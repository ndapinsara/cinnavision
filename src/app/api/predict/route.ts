import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Scan from "@/lib/models/Scan";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";
import { DISEASE_INFO, isDiseaseKey } from "@/lib/disease-info";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://127.0.0.1:8000";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const CLOUDINARY_FOLDER = "cinnavision/scans";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let image: File | null = null;
  try {
    const formData = await req.formData();
    const value = formData.get("image");
    if (value instanceof File) image = value;
  } catch {
    return NextResponse.json(
      { error: "Could not read the uploaded image." },
      { status: 400 },
    );
  }

  if (!image) {
    return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
  }
  if (!image.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed." },
      { status: 400 },
    );
  }
  if (image.size === 0) {
    return NextResponse.json(
      { error: "Image file is empty." },
      { status: 400 },
    );
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 10 MB." },
      { status: 413 },
    );
  }

  // Buffer once: the same bytes go to the model and then to Cloudinary
  const bytes = Buffer.from(await image.arrayBuffer());
  const fileName = image.name || "upload.jpg";

  const upstreamForm = new FormData();
  upstreamForm.append(
    "image",
    new Blob([bytes], { type: image.type }),
    fileName,
  );

  let upstream: Response;
  try {
    upstream = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      body: upstreamForm,
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Diagnostic service is unreachable. Start it with `npm run dev:ml`.",
      },
      { status: 503 },
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("ML service error", upstream.status, detail);
    return NextResponse.json(
      { error: "Inference failed. Please try another image." },
      { status: 502 },
    );
  }

  const result = (await upstream.json()) as {
    disease?: unknown;
    confidence?: unknown;
  };

  if (
    typeof result.disease !== "string" ||
    typeof result.confidence !== "number" ||
    !isDiseaseKey(result.disease)
  ) {
    return NextResponse.json(
      { error: "Diagnostic service returned an unexpected response." },
      { status: 502 },
    );
  }

  const disease = result.disease;
  const confidence = result.confidence;
  const info = DISEASE_INFO[disease];

  // Persistence must not cost the farmer their diagnosis: if Cloudinary or
  // Mongo fails we still return the prediction and report saved: false.
  let saved = false;
  let imageUrl: string | null = null;

  try {
    if (!isCloudinaryConfigured) {
      throw new Error(
        "Cloudinary env vars are missing; skipping scan persistence.",
      );
    }

    const uploaded = await uploadImage(bytes, CLOUDINARY_FOLDER);
    imageUrl = uploaded.url;

    await connectDB();
    await Scan.create({
      clerkId: userId,
      disease,
      diseaseLabel: info.label,
      confidence,
      treatment: {
        severity: info.severity,
        organic: info.organic,
        chemical: info.chemical,
      },
      imageUrl: uploaded.url,
      imagePublicId: uploaded.publicId,
    });
    saved = true;
  } catch (error) {
    console.error("Failed to save scan:", error);
  }

  return NextResponse.json({ disease, confidence, imageUrl, saved });
}
