import mongoose, { Document, Model, Schema } from "mongoose";
import { DISEASE_KEYS, type DiseaseKey } from "@/lib/disease-info";

// Treatment is snapshotted per scan: if the guidance table is later revised,
// past scans still show what the farmer was actually advised at the time.
export interface ITreatment {
  severity: string;
  organic: string[];
  chemical: string[];
}

export interface IScan extends Document {
  clerkId: string;
  disease: DiseaseKey;
  diseaseLabel: string;
  confidence: number;
  treatment: ITreatment;
  imageUrl: string;
  imagePublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TreatmentSchema: Schema<ITreatment> = new Schema(
  {
    severity: {
      type: String,
      required: true,
    },
    organic: {
      type: [String],
      default: [],
    },
    chemical: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const ScanSchema: Schema<IScan> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    disease: {
      type: String,
      enum: DISEASE_KEYS,
      required: true,
      index: true,
    },
    diseaseLabel: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    treatment: {
      type: TreatmentSchema,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Scan history is always read newest-first for one farmer
ScanSchema.index({ clerkId: 1, createdAt: -1 });

const Scan: Model<IScan> =
  mongoose.models.Scan || mongoose.model<IScan>("Scan", ScanSchema);

export default Scan;
