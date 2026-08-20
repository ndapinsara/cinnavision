import mongoose, { Document, Model, Schema } from "mongoose";
import {
  LISTING_DISTRICTS,
  LISTING_GRADES,
  LISTING_STATUSES,
  MAX_NOTE_LENGTH,
  MAX_PRICE_PER_KG,
  MAX_WEIGHT_KG,
  type ListingGrade,
  type ListingStatus,
} from "@/lib/listing-info";

export interface IListing extends Document {
  clerkId: string;
  weightKg: number;
  grade: ListingGrade;
  pricePerKg: number;
  // Stored as the 9 digits that follow +94, matching how the form collects it
  phone: string;
  district: string;
  harvestDate?: Date | null;
  organic: boolean;
  note?: string;
  status: ListingStatus;
  soldAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema: Schema<IListing> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 1,
      max: MAX_WEIGHT_KG,
    },
    grade: {
      type: String,
      enum: LISTING_GRADES,
      required: true,
      index: true,
    },
    pricePerKg: {
      type: Number,
      required: true,
      min: 1,
      max: MAX_PRICE_PER_KG,
    },
    phone: {
      type: String,
      required: true,
      match: /^\d{9}$/,
    },
    district: {
      type: String,
      enum: LISTING_DISTRICTS,
      required: true,
      index: true,
    },
    harvestDate: {
      type: Date,
      default: null,
    },
    organic: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      maxlength: MAX_NOTE_LENGTH,
      default: "",
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: "Available",
      index: true,
    },
    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// The farmer's own board and the buyer directory both read newest-first
ListingSchema.index({ clerkId: 1, createdAt: -1 });
ListingSchema.index({ status: 1, createdAt: -1 });

const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;
