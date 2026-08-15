import mongoose, { Document, Model, Schema } from "mongoose";

export const PRICE_GRADES = ["Alba", "C5", "M4"] as const;

export type PriceGrade = (typeof PRICE_GRADES)[number];

// Guard rail so a mistyped quotation cannot be published to farmers
export const MAX_PRICE_PER_KG = 100000;

export const DEFAULT_GRADE_PRICES: Record<PriceGrade, number> = {
  Alba: 4200,
  C5: 3800,
  M4: 3200,
};

export interface IGradePrice {
  grade: PriceGrade;
  price: number;
  active: boolean;
  updatedAt?: Date;
}

export interface IDailyPrice extends Document {
  clerkId: string;
  buyerName?: string;
  district?: string;
  grades: IGradePrice[];
  lastPublishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GradePriceSchema: Schema<IGradePrice> = new Schema(
  {
    grade: {
      type: String,
      enum: PRICE_GRADES,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: MAX_PRICE_PER_KG,
    },
    active: {
      type: Boolean,
      default: true,
    },
    updatedAt: {
      type: Date,
    },
  },
  { _id: false },
);

const DailyPriceSchema: Schema<IDailyPrice> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyerName: {
      type: String,
    },
    district: {
      type: String,
      index: true,
    },
    grades: {
      type: [GradePriceSchema],
      default: [],
    },
    lastPublishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const DailyPrice: Model<IDailyPrice> =
  mongoose.models.DailyPrice ||
  mongoose.model<IDailyPrice>("DailyPrice", DailyPriceSchema);

export default DailyPrice;
