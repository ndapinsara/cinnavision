"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ChevronDown,
  FlaskConical,
  History,
  Leaf,
  Loader2,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScanHistory, type ScanHistoryItem } from "@/lib/actions/scans";
import { cloudinaryThumb } from "@/lib/cloudinary-url";

const formatWhen = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return formatDistanceToNow(date, { addSuffix: true });
};

const ScanCard = ({ scan }: { scan: ScanHistoryItem }) => {
  const [open, setOpen] = useState(false);
  const healthy = scan.disease === "healthy_cinnamon";
  const hasTreatment =
    scan.treatment.organic.length > 0 || scan.treatment.chemical.length > 0;

  return (
    <li className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-(--shadow-soft)">
      <div className="flex gap-4 p-4">
        <img
          src={cloudinaryThumb(scan.imageUrl)}
          alt={`Scan classified as ${scan.diseaseLabel}`}
          loading="lazy"
          className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="font-display text-lg leading-tight">
              {scan.diseaseLabel}
            </p>
            <time
              dateTime={scan.createdAt}
              className="text-xs text-muted-foreground"
            >
              {formatWhen(scan.createdAt)}
            </time>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${scan.confidence}%` }}
              />
            </div>
            <span className="text-xs font-semibold">
              {scan.confidence.toFixed(1)}%
            </span>
          </div>

          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {healthy ? (
              <CheckCircle2
                className="size-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
            ) : (
              <ShieldAlert
                className="size-3.5 shrink-0 text-accent"
                aria-hidden="true"
              />
            )}
            {scan.treatment.severity || "No severity recorded"}
          </p>
        </div>
      </div>

      {hasTreatment && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {open ? "Hide treatment" : "View treatment"}
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {open && (
            <div className="grid gap-4 border-t border-border bg-secondary/40 p-4 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold">
                  <Leaf className="size-3.5 text-primary" aria-hidden="true" />
                  Organic treatment
                </p>
                <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
                  {scan.treatment.organic.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold">
                  <FlaskConical
                    className="size-3.5 text-accent"
                    aria-hidden="true"
                  />
                  Chemical treatment
                </p>
                <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
                  {scan.treatment.chemical.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </li>
  );
};

const ScanHistory = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  const applyResult = useCallback(
    (result: Awaited<ReturnType<typeof getScanHistory>> | null) => {
      if (!result) {
        setError("Could not load your scan history.");
        setStatus("error");
        return;
      }
      if (!result.success) {
        setError(result.error);
        setStatus("error");
        return;
      }
      setScans(result.data);
      setStatus("ready");
    },
    [],
  );

  // The fetch is awaited before any setState so the effect body stays free of
  // synchronous state updates; `cancelled` drops results from a superseded run.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getScanHistory().catch(() => null);
      if (cancelled) return;
      applyResult(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, applyResult]);

  // Event handler, not an effect — showing the spinner immediately is fine here
  const refresh = async () => {
    setStatus("loading");
    setError(null);
    applyResult(await getScanHistory().catch(() => null));
  };

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6">
      <div className="flex items-center gap-2">
        <History className="size-4 text-accent" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Recent scans</h2>
        {status === "ready" && scans.length > 0 && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
            {scans.length}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto rounded-full"
          onClick={() => void refresh()}
          disabled={status === "loading"}
        >
          <RefreshCw
            className={`size-4 ${status === "loading" ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      {status === "loading" && (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2
            className="size-4 animate-spin text-accent"
            aria-hidden="true"
          />
          Loading your scan history…
        </p>
      )}

      {status === "error" && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <span className="text-foreground">{error}</span>
        </p>
      )}

      {status === "ready" && scans.length === 0 && (
        <div className="mt-6 grid place-items-center rounded-2xl bg-secondary px-6 py-12 text-center">
          <div>
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-card text-accent">
              <History className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-semibold">No scans yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Run a scan from the New scan tab and it will appear here with its
              treatment guide.
            </p>
          </div>
        </div>
      )}

      {status === "ready" && scans.length > 0 && (
        <ul className="mt-5 grid gap-3">
          {scans.map((scan) => (
            <ScanCard key={scan.id} scan={scan} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default ScanHistory;
