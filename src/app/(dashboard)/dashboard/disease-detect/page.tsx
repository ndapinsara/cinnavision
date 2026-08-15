"use client";

import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  FlaskConical,
  Image as ImageIcon,
  Leaf,
  Loader2,
  RefreshCw,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ClassName =
  | "Healthy Cinnamon"
  | "Leaf Spot Disease"
  | "Rough Bark"
  | "Stripe Canker";

type Prediction = {
  label: ClassName;
  confidence: number;
  scores: { label: ClassName; value: number }[];
};

const CLASSES: ClassName[] = [
  "Healthy Cinnamon",
  "Leaf Spot Disease",
  "Rough Bark",
  "Stripe Canker",
];

const REMEDIES: Record<
  ClassName,
  { severity: string; organic: string[]; chemical: string[] }
> = {
  "Healthy Cinnamon": {
    severity: "No action required",
    organic: [
      "Maintain current spacing and shade management.",
      "Continue monthly neem-oil preventive spray (2%).",
      "Keep plantation floor free of decaying leaf litter.",
    ],
    chemical: [
      "No chemical intervention needed.",
      "Re-scan after heavy monsoon rainfall.",
    ],
  },
  "Leaf Spot Disease": {
    severity: "Moderate · treat within 3–5 days",
    organic: [
      "Remove and burn infected leaves; do not compost.",
      "Spray neem oil 3% + 0.5% potassium soap weekly for 3 weeks.",
      "Apply Trichoderma viride soil drench (5 g/L) around the base.",
    ],
    chemical: [
      "Copper oxychloride 50% WP @ 3 g/L, 2 sprays 14 days apart.",
      "Alternate with Mancozeb 75% WP @ 2 g/L to avoid resistance.",
      "Observe a 14-day pre-harvest interval.",
    ],
  },
  "Rough Bark": {
    severity: "High · isolate affected stems",
    organic: [
      "Prune and destroy roughened stems 15 cm below the lesion.",
      "Swab wounds with Bordeaux paste (10:10:100).",
      "Improve drainage; avoid overhead irrigation on stems.",
    ],
    chemical: [
      "Carbendazim 50% WP @ 1 g/L as a stem drench.",
      "Seal cut surfaces with copper-based wound sealant.",
      "Sterilise tools with 70% alcohol between plants.",
    ],
  },
  "Stripe Canker": {
    severity: "Critical · act within 24–48 hours",
    organic: [
      "Excise cankered bark to healthy tissue and burn debris.",
      "Apply cow-dung + Bordeaux paste over the excised area.",
      "Drench root zone with Trichoderma-enriched compost.",
    ],
    chemical: [
      "Metalaxyl + Mancozeb @ 2 g/L stem and soil drench.",
      "Repeat after 21 days; monitor lesion margins weekly.",
      "Quarantine the block until two clean scans in a row.",
    ],
  },
};

function mockPredict(seed: number): Prediction {
  const label = CLASSES[seed % CLASSES.length]!;
  const confidence = 88 + ((seed * 37) % 110) / 10;
  const remaining = 100 - confidence;
  const others = CLASSES.filter((c) => c !== label);
  const scores = [
    { label, value: confidence },
    ...others.map((c, i) => ({ label: c, value: (remaining * (3 - i)) / 6 })),
  ];
  return { label, confidence, scores };
}

const DiseaseDetectPage = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");
  const [result, setResult] = useState<Prediction | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setStatus("analyzing");
    const seed = file.name.length + file.size;
    window.setTimeout(() => {
      setResult(mockPredict(seed));
      setStatus("done");
    }, 1800);
  };

  const reset = () => {
    setPreview(null);
    setFileName(null);
    setResult(null);
    setStatus("idle");
  };

  const healthy = result?.label === "Healthy Cinnamon";
  const remedy = result ? REMEDIES[result.label] : null;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-6">
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          AI Disease Detection
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Capture or upload a cinnamon leaf or bark image. The diagnostic engine
          classifies it as Healthy Cinnamon, Leaf Spot Disease, Rough Bark or
          Stripe Canker, with confidence metrics and a treatment guide.
        </p>
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6">
          <div className="flex items-center gap-2">
            <ScanLine className="size-4 text-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Image capture & upload</h2>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl bg-secondary">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Selected cinnamon sample being analysed"
                  className="aspect-square w-full object-cover"
                />
                {status === "analyzing" && (
                  <>
                    <div className="pointer-events-none absolute inset-4 rounded-xl border-2 border-accent/70" />
                    <div className="scanline pointer-events-none absolute inset-x-4 h-0.5 bg-accent shadow-[0_0_18px_2px_var(--color-accent)]" />
                  </>
                )}
              </div>
            ) : (
              <div className="grid aspect-square place-items-center px-6 text-center">
                <div>
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-card text-accent">
                    <ImageIcon className="size-6" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-sm font-semibold">
                    Upload a leaf or bark photo
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG or PNG, clear daylight photo, single leaf or bark
                    section in frame.
                  </p>
                </div>
              </div>
            )}
          </div>

          {fileName && (
            <p className="mt-3 truncate text-xs text-muted-foreground">
              Selected: {fileName}
            </p>
          )}

          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button
              className="h-12 rounded-full"
              onClick={() => uploadRef.current?.click()}
            >
              <Upload className="size-4" aria-hidden="true" />
              Upload image
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="size-4" aria-hidden="true" />
              Capture photo
            </Button>
          </div>

          {preview && (
            <Button
              variant="ghost"
              className="mt-2 w-full rounded-full"
              onClick={reset}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Scan another sample
            </Button>
          )}
        </section>

        <section className="grid content-start gap-4">
          <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Diagnostic engine</h2>
              <span className="ml-auto rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                Keras CNN · demo
              </span>
            </div>

            {status === "idle" && (
              <p className="mt-4 text-sm text-muted-foreground">
                Select or capture an image to run the classifier. The model
                predicts one of four conditions: Healthy Cinnamon, Leaf Spot
                Disease, Rough Bark or Stripe Canker.
              </p>
            )}

            {status === "analyzing" && (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2
                  className="size-4 animate-spin text-accent"
                  aria-hidden="true"
                />
                Running inference on the cinnamon CNN model…
              </p>
            )}

            {result && (
              <>
                <p className="mt-4 font-display text-2xl">{result.label}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Prediction confidence
                  </span>
                  <span>{result.confidence.toFixed(1)}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>

                <p
                  className={`mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${
                    healthy ? "bg-secondary" : "bg-accent-soft"
                  }`}
                >
                  {healthy ? (
                    <CheckCircle2
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <ShieldAlert
                      className="size-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-foreground">
                    {healthy
                      ? "No disease detected"
                      : "Potential disease detected"}{" "}
                    · {remedy?.severity}
                  </span>
                </p>

                <div className="mt-5 grid gap-2.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Class probability distribution
                  </p>
                  {result.scores.map((s) => (
                    <div key={s.label} className="grid gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={
                            s.label === result.label
                              ? "font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {s.label}
                        </span>
                        <span className="text-muted-foreground">
                          {s.value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                        <div
                          className={`h-full rounded-full ${
                            s.label === result.label
                              ? "bg-primary"
                              : "bg-muted-foreground/40"
                          }`}
                          style={{ width: `${s.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {remedy && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border bg-cream p-5">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Leaf className="size-4 text-primary" aria-hidden="true" />
                  Organic treatment
                </p>
                <ul className="mt-3 grid gap-2.5 text-sm text-muted-foreground">
                  {remedy.organic.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <FlaskConical
                    className="size-4 text-accent"
                    aria-hidden="true"
                  />
                  Chemical treatment
                </p>
                <ul className="mt-3 grid gap-2.5 text-sm text-muted-foreground">
                  {remedy.chemical.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Frontend preview with demo inference. AI predictions are guidance
            only — confirm critical cases with an agricultural extension
            officer.
          </p>
        </section>
      </div>
    </main>
  );
};

export default DiseaseDetectPage;
