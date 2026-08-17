"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Scan from "@/lib/models/Scan";
import { isDiseaseKey, type DiseaseKey } from "@/lib/disease-info";

export type ActionResult<T> =
  { success: true; data: T } | { success: false; error: string };

export interface ScanTreatment {
  severity: string;
  organic: string[];
  chemical: string[];
}

export interface ScanHistoryItem {
  id: string;
  disease: DiseaseKey;
  diseaseLabel: string;
  confidence: number;
  treatment: ScanTreatment;
  imageUrl: string;
  createdAt: string;
}

type LeanScan = {
  _id: unknown;
  disease: string;
  diseaseLabel: string;
  confidence: number;
  treatment?: Partial<ScanTreatment>;
  imageUrl: string;
  createdAt: Date;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Mongo documents cross the server/client boundary, so ObjectId and Date are
// flattened to strings here rather than in the component.
function serializeScan(scan: LeanScan): ScanHistoryItem | null {
  if (!isDiseaseKey(scan.disease)) return null;

  return {
    id: String(scan._id),
    disease: scan.disease,
    diseaseLabel: scan.diseaseLabel,
    confidence: scan.confidence,
    treatment: {
      severity: scan.treatment?.severity ?? "",
      organic: scan.treatment?.organic ?? [],
      chemical: scan.treatment?.chemical ?? [],
    },
    imageUrl: scan.imageUrl,
    createdAt: scan.createdAt.toISOString(),
  };
}

export async function getScanHistory(
  limit: number = DEFAULT_LIMIT,
): Promise<ActionResult<ScanHistoryItem[]>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const safeLimit = Math.min(
    Math.max(Math.trunc(limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  try {
    await connectDB();

    const scans = await Scan.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .select("disease diseaseLabel confidence treatment imageUrl createdAt")
      .lean<LeanScan[]>();

    return {
      success: true,
      data: scans
        .map(serializeScan)
        .filter((scan): scan is ScanHistoryItem => scan !== null),
    };
  } catch (error) {
    console.error("Failed to load scan history:", error);
    return { success: false, error: "Could not load your scan history." };
  }
}
