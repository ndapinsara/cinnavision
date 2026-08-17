"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FlaskConical,
  History,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScanHistory from "@/components/dashboard/ScanHistory";
import {
  DISEASE_INFO,
  isDiseaseKey,
  type DiseaseKey,
} from "@/lib/disease-info";

type Prediction = {
  disease: DiseaseKey;
  confidence: number;
  saved: boolean;
};

const DiseaseDetectPage = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">(
    "idle",
  );
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Bumped after a scan is persisted so the history tab refetches
  const [historyKey, setHistoryKey] = useState(0);
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
    setResult(null);
    setError(null);
    setStatus("analyzing");

    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/predict", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Diagnosis failed. Please try again.");
        setStatus("error");
        return;
      }

      if (typeof data.disease !== "string" || !isDiseaseKey(data.disease)) {
        setError("The model returned an unrecognised class.");
        setStatus("error");
        return;
      }

      const saved = Boolean(data.saved);
      setResult({
        disease: data.disease,
        confidence: data.confidence,
        saved,
      });
      setStatus("done");
      if (saved) setHistoryKey((k) => k + 1);
    } catch {
      setError("Could not reach the diagnostic service. Please try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  const info = result ? DISEASE_INFO[result.disease] : null;
  const healthy = result?.disease === "healthy_cinnamon";

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

      <Tabs defaultValue="scan" className="gap-6">
        <TabsList className="h-10 w-full max-w-sm">
          <TabsTrigger value="scan" className="rounded-md">
            <ScanLine className="size-4" aria-hidden="true" />
            New scan
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-md">
            <History className="size-4" aria-hidden="true" />
            Scan history
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6">
              <div className="flex items-center gap-2">
                <ScanLine className="size-4 text-accent" aria-hidden="true" />
                <h2 className="text-sm font-semibold">
                  Image capture & upload
                </h2>
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
                  disabled={status === "analyzing"}
                  onClick={() => uploadRef.current?.click()}
                >
                  <Upload className="size-4" aria-hidden="true" />
                  Upload image
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-full"
                  disabled={status === "analyzing"}
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
                  disabled={status === "analyzing"}
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
                    Keras CNN
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

                {status === "error" && (
                  <p className="mt-4 flex items-start gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <span className="text-foreground">{error}</span>
                  </p>
                )}

                {result && info && (
                  <>
                    <p className="mt-4 font-display text-2xl">{info.label}</p>
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
                        · {info.severity}
                      </span>
                    </p>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {result.saved ? (
                        <>
                          <CheckCircle2
                            className="size-3.5 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          Scan saved to your history.
                        </>
                      ) : (
                        <>
                          <AlertTriangle
                            className="size-3.5 shrink-0 text-accent"
                            aria-hidden="true"
                          />
                          Diagnosis shown but not saved to your history.
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>

              {info && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border bg-cream p-5">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Leaf
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      Organic treatment
                    </p>
                    <ul className="mt-3 grid gap-2.5 text-sm text-muted-foreground">
                      {info.organic.map((t) => (
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
                      {info.chemical.map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                AI predictions are guidance only — confirm critical cases with
                an agricultural extension officer.
              </p>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <ScanHistory refreshKey={historyKey} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default DiseaseDetectPage;
