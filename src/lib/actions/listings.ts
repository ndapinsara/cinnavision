"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Listing from "@/lib/models/Listing";
import {
  LISTING_GRADES,
  LISTING_STATUSES,
  MAX_NOTE_LENGTH,
  MAX_PRICE_PER_KG,
  MAX_WEIGHT_KG,
  isListingDistrict,
  type ListingDistrict,
  type ListingGrade,
  type ListingStatus,
} from "@/lib/listing-info";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// A stored listing flattened into plain JSON for the client component
export interface ListingRecord {
  id: string;
  weightKg: number;
  grade: ListingGrade;
  pricePerKg: number;
  phone: string;
  district: string;
  harvestDate: string | null;
  organic: boolean;
  note: string;
  status: ListingStatus;
  postedAt: string;
  soldAt: string | null;
}

export interface ListingInput {
  weightKg: number;
  grade: ListingGrade;
  pricePerKg: number;
  phone: string;
  district: string;
  harvestDate?: string | null;
  organic?: boolean;
  note?: string;
}

export interface MyListingsData {
  listings: ListingRecord[];
  // Profile values the add form starts from, so the farmer retypes less
  defaultDistrict: string | null;
  defaultPhone: string | null;
}

type LeanListing = {
  _id: mongoose.Types.ObjectId;
  weightKg: number;
  grade: ListingGrade;
  pricePerKg: number;
  phone: string;
  district: string;
  harvestDate?: Date | null;
  organic?: boolean;
  note?: string;
  status: ListingStatus;
  soldAt?: Date | null;
  createdAt: Date;
};

type FarmerContext = {
  userId: string;
  district: string | null;
  phone: string | null;
};

type ValidatedListing = {
  weightKg: number;
  grade: ListingGrade;
  pricePerKg: number;
  phone: string;
  district: ListingDistrict;
  harvestDate: Date | null;
  organic: boolean;
  note: string;
};

const LISTING_PATH = "/dashboard/my-listings";
const BUYER_PATH = "/dashboard/farmer-listings";
const DASHBOARD_PATH = "/dashboard";

// Profiles store numbers as typed (0771234567 / +94 77 123 4567);
// listings keep only the 9 digits that follow +94
function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;

  let digits = String(value).replace(/\D/g, "");

  if (digits.startsWith("94")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);

  return digits.length === 9 ? digits : null;
}

// Only signed-in farmer accounts own harvest listings
async function resolveFarmer(): Promise<
  { ok: true; ctx: FarmerContext } | { ok: false; error: string }
> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  await connectDB();

  const user = await User.findOne({ clerkId: userId })
    .select("role district phone")
    .lean<{ role?: string; district?: string; phone?: string } | null>();

  const role =
    user?.role && user.role !== "none"
      ? user.role
      : sessionClaims?.metadata?.role;

  if (role !== "farmer") {
    return {
      ok: false,
      error: "Only farmer accounts can manage harvest listings",
    };
  }

  return {
    ok: true,
    ctx: {
      userId,
      district: user?.district ?? null,
      phone: normalizePhone(user?.phone),
    },
  };
}

function serializeListing(listing: LeanListing): ListingRecord {
  return {
    id: listing._id.toString(),
    weightKg: listing.weightKg,
    grade: listing.grade,
    pricePerKg: listing.pricePerKg,
    phone: listing.phone,
    district: listing.district,
    harvestDate: listing.harvestDate
      ? listing.harvestDate.toISOString().split("T")[0]
      : null,
    organic: Boolean(listing.organic),
    note: listing.note ?? "",
    status: listing.status,
    postedAt: listing.createdAt.toISOString(),
    soldAt: listing.soldAt ? listing.soldAt.toISOString() : null,
  };
}

// The client is never trusted: every field is re-checked before it is stored
function validateInput(
  input: ListingInput,
): { ok: true; value: ValidatedListing } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "No listing details were submitted" };
  }

  const weightKg = Number(input.weightKg);

  if (!Number.isInteger(weightKg) || weightKg <= 0) {
    return { ok: false, error: "Enter a valid total weight in kilograms" };
  }

  if (weightKg > MAX_WEIGHT_KG) {
    return {
      ok: false,
      error: `Weight cannot exceed ${MAX_WEIGHT_KG.toLocaleString()} kg`,
    };
  }

  if (!LISTING_GRADES.includes(input.grade)) {
    return { ok: false, error: "Unknown cinnamon grade submitted" };
  }

  const pricePerKg = Number(input.pricePerKg);

  if (!Number.isInteger(pricePerKg) || pricePerKg <= 0) {
    return { ok: false, error: "Enter a valid expected price per kg" };
  }

  if (pricePerKg > MAX_PRICE_PER_KG) {
    return {
      ok: false,
      error: `Price cannot exceed LKR ${MAX_PRICE_PER_KG.toLocaleString()} per kg`,
    };
  }

  const phone = normalizePhone(input.phone);

  if (!phone) {
    return { ok: false, error: "Enter a valid 9-digit mobile number after +94" };
  }

  const district = String(input.district ?? "");

  if (!isListingDistrict(district)) {
    return { ok: false, error: "Select a district from the list" };
  }

  let harvestDate: Date | null = null;

  if (input.harvestDate) {
    const parsed = new Date(`${input.harvestDate}T00:00:00.000Z`);

    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Enter a valid harvest or ready date" };
    }

    harvestDate = parsed;
  }

  const note = (input.note ?? "").trim();

  if (note.length > MAX_NOTE_LENGTH) {
    return {
      ok: false,
      error: `Additional details cannot exceed ${MAX_NOTE_LENGTH} characters`,
    };
  }

  return {
    ok: true,
    value: {
      weightKg,
      grade: input.grade,
      pricePerKg,
      phone,
      district,
      harvestDate,
      organic: Boolean(input.organic),
      note,
    },
  };
}

function revalidateListings() {
  revalidatePath(LISTING_PATH);
  revalidatePath(BUYER_PATH);
  revalidatePath(DASHBOARD_PATH);
}

// Every listing the signed-in farmer has published, newest first
export async function getMyListings(): Promise<ActionResult<MyListingsData>> {
  const resolved = await resolveFarmer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  try {
    const listings = await Listing.find({ clerkId: resolved.ctx.userId })
      .sort({ createdAt: -1 })
      .lean<LeanListing[]>();

    return {
      success: true,
      data: {
        listings: listings.map(serializeListing),
        defaultDistrict: resolved.ctx.district,
        defaultPhone: resolved.ctx.phone,
      },
    };
  } catch (error) {
    console.error("Error loading harvest listings", error);
    return { success: false, error: "Failed to load your listings" };
  }
}

export async function createListing(
  input: ListingInput,
): Promise<ActionResult<ListingRecord>> {
  const resolved = await resolveFarmer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  const validated = validateInput(input);

  if (!validated.ok) {
    return { success: false, error: validated.error };
  }

  try {
    const created = await Listing.create({
      clerkId: resolved.ctx.userId,
      ...validated.value,
      status: "Available",
      soldAt: null,
    });

    revalidateListings();

    return {
      success: true,
      data: serializeListing(created.toObject() as LeanListing),
    };
  } catch (error) {
    console.error("Error creating harvest listing", error);
    return { success: false, error: "Failed to publish your listing" };
  }
}

// Edits are scoped to the owner, so a farmer can never touch someone else's listing
export async function updateListing(
  id: string,
  input: ListingInput,
): Promise<ActionResult<ListingRecord>> {
  const resolved = await resolveFarmer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Listing not found" };
  }

  const validated = validateInput(input);

  if (!validated.ok) {
    return { success: false, error: validated.error };
  }

  try {
    const updated = await Listing.findOneAndUpdate(
      { _id: id, clerkId: resolved.ctx.userId },
      { $set: validated.value },
      { returnDocument: "after", runValidators: true },
    ).lean<LeanListing | null>();

    if (!updated) {
      return { success: false, error: "Listing not found" };
    }

    revalidateListings();

    return { success: true, data: serializeListing(updated) };
  } catch (error) {
    console.error("Error updating harvest listing", error);
    return { success: false, error: "Failed to save your changes" };
  }
}

// Flipping the Available / Sold switch — soldAt records when it was closed
export async function setListingStatus(
  id: string,
  status: ListingStatus,
): Promise<ActionResult<ListingRecord>> {
  const resolved = await resolveFarmer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Listing not found" };
  }

  if (!LISTING_STATUSES.includes(status)) {
    return { success: false, error: "Unknown listing status submitted" };
  }

  try {
    const updated = await Listing.findOneAndUpdate(
      { _id: id, clerkId: resolved.ctx.userId },
      { $set: { status, soldAt: status === "Sold" ? new Date() : null } },
      { returnDocument: "after", runValidators: true },
    ).lean<LeanListing | null>();

    if (!updated) {
      return { success: false, error: "Listing not found" };
    }

    revalidateListings();

    return { success: true, data: serializeListing(updated) };
  } catch (error) {
    console.error("Error updating listing status", error);
    return { success: false, error: "Failed to update the listing status" };
  }
}

export async function deleteListing(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const resolved = await resolveFarmer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { success: false, error: "Listing not found" };
  }

  try {
    const deleted = await Listing.findOneAndDelete({
      _id: id,
      clerkId: resolved.ctx.userId,
    }).lean<LeanListing | null>();

    if (!deleted) {
      return { success: false, error: "Listing not found" };
    }

    revalidateListings();

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Error deleting harvest listing", error);
    return { success: false, error: "Failed to delete the listing" };
  }
}
