"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Listing from "@/lib/models/Listing";
import Scan from "@/lib/models/Scan";
import DailyPrice, {
  PRICE_GRADES,
  type PriceGrade,
} from "@/lib/models/DailyPrice";
import { DISEASE_INFO, isDiseaseKey, type DiseaseKey } from "@/lib/disease-info";
import type { ListingGrade, ListingStatus } from "@/lib/listing-info";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface DashboardSummary {
  totalListings: number;
  availableListings: number;
  soldListings: number;
  availableStockKg: number;
  availableValue: number;
  soldStockKg: number;
  soldValue: number;
  totalScans: number;
  scansLast30Days: number;
  healthyScans: number;
  // Percentage of all scans classified healthy — null until the first scan
  healthyShare: number | null;
}

export interface DashboardRate {
  grade: PriceGrade;
  best: number;
  average: number;
  low: number;
  buyers: number;
  topBuyer: string | null;
}

// One of the farmer's available grades measured against what buyers pay today
export interface DashboardPriceGap {
  grade: PriceGrade;
  weightKg: number;
  asking: number;
  best: number;
  diff: number;
}

export interface DashboardScan {
  id: string;
  disease: DiseaseKey;
  diseaseLabel: string;
  confidence: number;
  severity: string;
  imageUrl: string;
  createdAt: string;
}

export interface DashboardListing {
  id: string;
  grade: ListingGrade;
  weightKg: number;
  pricePerKg: number;
  district: string;
  organic: boolean;
  status: ListingStatus;
  createdAt: string;
}

export interface DashboardHealthRow {
  disease: DiseaseKey;
  label: string;
  count: number;
  share: number;
}

export interface FarmerDashboardData {
  farmerName: string | null;
  district: string | null;
  summary: DashboardSummary;
  rates: DashboardRate[];
  topRate: DashboardRate | null;
  priceGaps: DashboardPriceGap[];
  marketBuyers: number;
  localBuyers: number;
  recentScans: DashboardScan[];
  recentListings: DashboardListing[];
  health: DashboardHealthRow[];
  lastScanAt: string | null;
}

type FarmerContext = {
  userId: string;
  name: string | null;
  district: string | null;
};

type LeanScan = {
  _id: unknown;
  disease: string;
  diseaseLabel: string;
  confidence: number;
  treatment?: { severity?: string };
  imageUrl: string;
  createdAt: Date;
};

type LeanListing = {
  _id: unknown;
  grade: ListingGrade;
  weightKg: number;
  pricePerKg: number;
  district: string;
  organic?: boolean;
  status: ListingStatus;
  createdAt: Date;
};

type LeanBoard = {
  buyerName?: string;
  district?: string;
  grades?: { grade: PriceGrade; price: number; active: boolean }[];
};

type StatusGroup = {
  _id: ListingStatus;
  count: number;
  weightKg: number;
  value: number;
};

type GradeGroup = {
  _id: ListingGrade;
  weightKg: number;
  value: number;
};

type DiseaseGroup = {
  _id: string;
  count: number;
};

const RECENT_LIMIT = 3;
const RECENT_WINDOW_DAYS = 30;

// Same guard the listing actions use: the dashboard is farmer-only data
async function resolveFarmer(): Promise<
  { ok: true; ctx: FarmerContext } | { ok: false; error: string }
> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  await connectDB();

  const user = await User.findOne({ clerkId: userId })
    .select("role firstName lastName district")
    .lean<{
      role?: string;
      firstName?: string;
      lastName?: string;
      district?: string;
    } | null>();

  const role =
    user?.role && user.role !== "none"
      ? user.role
      : sessionClaims?.metadata?.role;

  if (role !== "farmer") {
    return {
      ok: false,
      error: "Only farmer accounts can open the farmer dashboard",
    };
  }

  return {
    ok: true,
    ctx: {
      userId,
      name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
      district: user?.district ?? null,
    },
  };
}

// Buyer boards are stored per buyer; the dashboard needs them pivoted by grade
function buildRates(boards: LeanBoard[]): DashboardRate[] {
  const buckets = new Map<
    PriceGrade,
    { prices: number[]; topBuyer: string | null; topPrice: number }
  >();

  for (const board of boards) {
    for (const entry of board.grades ?? []) {
      if (!entry.active || entry.price <= 0) continue;
      if (!PRICE_GRADES.includes(entry.grade)) continue;

      const bucket = buckets.get(entry.grade) ?? {
        prices: [],
        topBuyer: null,
        topPrice: 0,
      };

      bucket.prices.push(entry.price);

      if (entry.price > bucket.topPrice) {
        bucket.topPrice = entry.price;
        bucket.topBuyer = board.buyerName ?? null;
      }

      buckets.set(entry.grade, bucket);
    }
  }

  return PRICE_GRADES.flatMap((grade) => {
    const bucket = buckets.get(grade);

    if (!bucket || bucket.prices.length === 0) return [];

    const total = bucket.prices.reduce((sum, price) => sum + price, 0);

    return [
      {
        grade,
        best: Math.max(...bucket.prices),
        low: Math.min(...bucket.prices),
        average: Math.round(total / bucket.prices.length),
        buyers: bucket.prices.length,
        topBuyer: bucket.topBuyer,
      },
    ];
  });
}

// Everything the farmer landing page renders, in one round trip
export async function getFarmerDashboard(): Promise<
  ActionResult<FarmerDashboardData>
> {
  const resolved = await resolveFarmer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  const { userId, name, district } = resolved.ctx;

  try {
    const since = new Date(
      Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    const [
      statusGroups,
      gradeGroups,
      diseaseGroups,
      scansLast30Days,
      recentScanDocs,
      recentListingDocs,
      boards,
    ] = await Promise.all([
      Listing.aggregate<StatusGroup>([
        { $match: { clerkId: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            weightKg: { $sum: "$weightKg" },
            value: { $sum: { $multiply: ["$weightKg", "$pricePerKg"] } },
          },
        },
      ]),
      Listing.aggregate<GradeGroup>([
        { $match: { clerkId: userId, status: "Available" } },
        {
          $group: {
            _id: "$grade",
            weightKg: { $sum: "$weightKg" },
            value: { $sum: { $multiply: ["$weightKg", "$pricePerKg"] } },
          },
        },
      ]),
      Scan.aggregate<DiseaseGroup>([
        { $match: { clerkId: userId } },
        { $group: { _id: "$disease", count: { $sum: 1 } } },
      ]),
      Scan.countDocuments({ clerkId: userId, createdAt: { $gte: since } }),
      Scan.find({ clerkId: userId })
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .select("disease diseaseLabel confidence treatment imageUrl createdAt")
        .lean<LeanScan[]>(),
      Listing.find({ clerkId: userId })
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .select("grade weightKg pricePerKg district organic status createdAt")
        .lean<LeanListing[]>(),
      DailyPrice.find({
        lastPublishedAt: { $ne: null },
        grades: { $elemMatch: { active: true, price: { $gt: 0 } } },
      })
        .select("buyerName district grades")
        .lean<LeanBoard[]>(),
    ]);

    const available = statusGroups.find((group) => group._id === "Available");
    const sold = statusGroups.find((group) => group._id === "Sold");

    const totalScans = diseaseGroups.reduce(
      (sum, group) => sum + group.count,
      0,
    );
    const healthyScans =
      diseaseGroups.find((group) => group._id === "healthy_cinnamon")?.count ??
      0;

    const rates = buildRates(boards);

    const topRate = rates.reduce<DashboardRate | null>(
      (best, rate) => (!best || rate.best > best.best ? rate : best),
      null,
    );

    const rateByGrade = new Map(rates.map((rate) => [rate.grade, rate]));

    // Only grades that buyers actually quote can be compared against
    const priceGaps = gradeGroups.flatMap<DashboardPriceGap>((group) => {
      const grade = group._id as PriceGrade;
      const rate = rateByGrade.get(grade);

      if (!rate || group.weightKg <= 0) return [];

      const asking = Math.round(group.value / group.weightKg);

      return [
        {
          grade,
          weightKg: group.weightKg,
          asking,
          best: rate.best,
          diff: rate.best - asking,
        },
      ];
    });

    const health: DashboardHealthRow[] = diseaseGroups
      .flatMap((group) =>
        isDiseaseKey(group._id)
          ? [
              {
                disease: group._id,
                label: DISEASE_INFO[group._id].label,
                count: group.count,
                share: totalScans
                  ? Math.round((group.count / totalScans) * 100)
                  : 0,
              },
            ]
          : [],
      )
      .sort((a, b) => b.count - a.count);

    const recentScans = recentScanDocs.flatMap<DashboardScan>((scan) =>
      isDiseaseKey(scan.disease)
        ? [
            {
              id: String(scan._id),
              disease: scan.disease,
              diseaseLabel: scan.diseaseLabel,
              confidence: scan.confidence,
              severity:
                scan.treatment?.severity ?? DISEASE_INFO[scan.disease].severity,
              imageUrl: scan.imageUrl,
              createdAt: scan.createdAt.toISOString(),
            },
          ]
        : [],
    );

    const recentListings = recentListingDocs.map<DashboardListing>(
      (listing) => ({
        id: String(listing._id),
        grade: listing.grade,
        weightKg: listing.weightKg,
        pricePerKg: listing.pricePerKg,
        district: listing.district,
        organic: Boolean(listing.organic),
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
      }),
    );

    return {
      success: true,
      data: {
        farmerName: name,
        district,
        summary: {
          totalListings: (available?.count ?? 0) + (sold?.count ?? 0),
          availableListings: available?.count ?? 0,
          soldListings: sold?.count ?? 0,
          availableStockKg: available?.weightKg ?? 0,
          availableValue: available?.value ?? 0,
          soldStockKg: sold?.weightKg ?? 0,
          soldValue: sold?.value ?? 0,
          totalScans,
          scansLast30Days,
          healthyScans,
          healthyShare: totalScans
            ? Math.round((healthyScans / totalScans) * 100)
            : null,
        },
        rates,
        topRate,
        priceGaps,
        marketBuyers: boards.length,
        localBuyers: district
          ? boards.filter((board) => board.district === district).length
          : 0,
        recentScans,
        recentListings,
        health,
        lastScanAt: recentScans[0]?.createdAt ?? null,
      },
    };
  } catch (error) {
    console.error("Error loading farmer dashboard", error);
    return { success: false, error: "Failed to load your dashboard" };
  }
}
