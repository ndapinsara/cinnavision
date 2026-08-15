"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  getDailyPrices,
  saveDailyPrices,
  setGradeStatus,
} from "@/lib/actions/daily-prices";
import type { DailyPriceBoardData } from "@/lib/actions/daily-prices";
import type { PriceGrade } from "@/lib/models/DailyPrice";

type GradeConfig = {
  grade: PriceGrade;
  label: string;
  exportReference: number;
  description: string;
};

const GRADES: GradeConfig[] = [
  {
    grade: "Alba",
    label: "Premium Alba",
    exportReference: 4200,
    description: "Finest quills, highest export demand",
  },
  {
    grade: "C5",
    label: "Grade C5",
    exportReference: 3800,
    description: "Standard export grade, strong volume",
  },
  {
    grade: "M4",
    label: "Grade M4",
    exportReference: 3200,
    description: "Mid-grade quills, domestic & export",
  },
];

const formatPublishedAt = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-LK", {
    timeZone: "Asia/Colombo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toPriceMap = (board: DailyPriceBoardData) =>
  Object.fromEntries(board.grades.map((g) => [g.grade, g.price])) as Record<
    PriceGrade,
    number
  >;

const toActiveMap = (board: DailyPriceBoardData) =>
  Object.fromEntries(board.grades.map((g) => [g.grade, g.active])) as Record<
    PriceGrade,
    boolean
  >;

const DailyPriceBoardPage = () => {
  // Published state from MongoDB — null until the first load resolves
  const [board, setBoard] = useState<DailyPriceBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [prices, setPrices] = useState<Record<PriceGrade, string>>(
    () =>
      Object.fromEntries(
        GRADES.map((g) => [g.grade, String(g.exportReference)]),
      ) as Record<PriceGrade, string>,
  );
  const [active, setActive] = useState<Record<PriceGrade, boolean>>(
    () =>
      Object.fromEntries(GRADES.map((g) => [g.grade, true])) as Record<
        PriceGrade,
        boolean
      >,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [pendingGrade, setPendingGrade] = useState<PriceGrade | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getDailyPrices();
        if (cancelled) return;

        if (!result.success) {
          setLoadError(result.error);
          return;
        }

        setBoard(result.data);
        setPrices(
          Object.fromEntries(
            result.data.grades.map((g) => [g.grade, String(g.price)]),
          ) as Record<PriceGrade, string>,
        );
        setActive(toActiveMap(result.data));
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("Could not load your price board.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const numericPrices = useMemo(() => {
    return Object.fromEntries(
      Object.entries(prices).map(([k, v]) => [k, Number(v) || 0]),
    ) as Record<PriceGrade, number>;
  }, [prices]);

  const isChanged = useMemo(() => {
    if (!board) return false;
    const publishedPrices = toPriceMap(board);
    const publishedActive = toActiveMap(board);
    return GRADES.some(
      (g) =>
        numericPrices[g.grade] !== publishedPrices[g.grade] ||
        active[g.grade] !== publishedActive[g.grade],
    );
  }, [numericPrices, active, board]);

  const updatePrice = (grade: PriceGrade, value: string) => {
    const digits = value.replace(/\D/g, "");
    setError(null);
    setPrices((prev) => ({ ...prev, [grade]: digits }));
  };

  // Status changes publish on their own — typed but unpublished prices stay untouched
  const toggleGradeActive = async (grade: PriceGrade) => {
    if (isSaving || pendingGrade) return;

    const nextActive = !active[grade];

    setError(null);
    setActive((prev) => ({ ...prev, [grade]: nextActive }));
    setPendingGrade(grade);

    try {
      const result = await setGradeStatus(grade, nextActive);

      if (!result.success) {
        setActive((prev) => ({ ...prev, [grade]: !nextActive }));
        setError(result.error);
        return;
      }

      setBoard(result.data);
    } catch (err) {
      console.error(err);
      setActive((prev) => ({ ...prev, [grade]: !nextActive }));
      setError("Could not reach the server. Please try again.");
    } finally {
      setPendingGrade(null);
    }
  };

  const handleSave = async () => {
    if (isSaving || pendingGrade) return;

    const activeGrades = GRADES.filter((g) => active[g.grade]);
    const invalid = activeGrades.some((g) => numericPrices[g.grade] <= 0);
    if (invalid) {
      setError(
        "Please enter a valid price above LKR 0 for every active grade.",
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await saveDailyPrices(
        GRADES.map((g) => ({
          grade: g.grade,
          price: numericPrices[g.grade],
          active: active[g.grade],
        })),
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setBoard(result.data);
      setPrices(
        Object.fromEntries(
          result.data.grades.map((g) => [g.grade, String(g.price)]),
        ) as Record<PriceGrade, string>,
      );
      setActive(toActiveMap(result.data));
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const publishedAt = formatPublishedAt(board?.lastPublishedAt ?? null);
  const activeCount = GRADES.filter((g) => active[g.grade]).length;

  if (isLoading || loadError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-6">
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">
            Daily Price Quotation Board
          </h1>
        </header>
        <div
          className={cn(
            "flex items-start gap-2 rounded-[1.75rem] border p-8 text-sm",
            loadError
              ? "border-dashed border-border text-muted-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {loadError ? (
            <>
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <p>{loadError}</p>
            </>
          ) : (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <p>Loading your price board…</p>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-6">
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Daily Price Quotation Board
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Enter your live purchasing rates for each cinnamon grade based on
          prevailing export market values. Toggle your purchasing status to
          control whether farmers can reach you today.
        </p>
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        {/* Main price updater */}
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ArrowLeftRight
                  className="size-4 text-accent"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-semibold">
                  Real-Time Price Updater
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Set today’s purchasing rates for each cinnamon grade. Toggle a
                grade off to stop accepting enquiries for it.
              </p>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                activeCount > 0
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  activeCount > 0 ? "bg-primary" : "bg-muted-foreground",
                )}
                aria-hidden="true"
              />
              {activeCount === 0
                ? "All grades closed"
                : `${activeCount} of ${GRADES.length} active`}
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {GRADES.map((g) => {
              const price = numericPrices[g.grade];
              const diff = price - g.exportReference;
              const diffPercent = g.exportReference
                ? (diff / g.exportReference) * 100
                : 0;
              const isAbove = diff >= 0;
              const isGradeActive = active[g.grade];
              const isGradePending = pendingGrade === g.grade;

              return (
                <div
                  key={g.grade}
                  className={cn(
                    "rounded-2xl border p-4 transition-colors sm:p-5",
                    isGradeActive
                      ? "border-border bg-card"
                      : "border-border/60 bg-muted/30",
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold",
                          isGradeActive
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {g.grade}
                      </span>
                      <div>
                        <p
                          className={cn(
                            "font-display text-base font-semibold",
                            !isGradeActive && "text-muted-foreground",
                          )}
                        >
                          {g.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {g.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:w-72">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {isGradeActive ? "Your rate per kg" : "Grade closed"}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-medium",
                            !isGradeActive
                              ? "text-muted-foreground"
                              : isAbove
                                ? "text-primary"
                                : "text-accent",
                          )}
                        >
                          {isGradeActive ? (
                            isAbove ? (
                              <TrendingUp
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            ) : (
                              <TrendingDown
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            )
                          ) : null}
                          {Math.abs(diffPercent).toFixed(1)}% vs export ref.
                        </span>
                      </div>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                          LKR
                        </span>
                        <Input
                          id={`price-${g.grade}`}
                          type="text"
                          inputMode="numeric"
                          value={prices[g.grade]}
                          onChange={(e) => updatePrice(g.grade, e.target.value)}
                          disabled={!isGradeActive || isSaving}
                          placeholder="0"
                          className="h-12 rounded-xl pl-11 text-right font-display text-lg"
                          aria-label={`${g.label} price per kilogram`}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Export reference: LKR{" "}
                          {g.exportReference.toLocaleString()}/kg
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            {isGradePending && (
                              <Loader2
                                className="size-3 animate-spin"
                                aria-hidden="true"
                              />
                            )}
                            {isGradePending
                              ? "Saving…"
                              : isGradeActive
                                ? "Active"
                                : "Closed"}
                          </span>
                          <Switch
                            id={`status-${g.grade}`}
                            checked={isGradeActive}
                            onCheckedChange={() => toggleGradeActive(g.grade)}
                            disabled={isSaving || pendingGrade !== null}
                            aria-label={`Toggle ${g.label} purchasing status`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              className="h-12 rounded-xl px-6"
              onClick={handleSave}
              disabled={isSaving || pendingGrade !== null || !isChanged}
            >
              {isSaving ? (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save className="mr-2 size-4" aria-hidden="true" />
              )}
              {isSaving ? "Publishing…" : "Update Prices"}
            </Button>
            {!isChanged && !isSaving && board?.isPublished && (
              <p className="text-xs text-muted-foreground">
                Your board is up to date.
              </p>
            )}
          </div>
        </section>

        {/* Summary panel */}
        <section className="grid content-start gap-4">
          <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Live Price Board</h2>
              <span
                className={cn(
                  "ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                  activeCount > 0
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    activeCount > 0 ? "bg-primary" : "bg-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                {activeCount > 0 ? `${activeCount} active` : "Closed"}
              </span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Summary of your published rates as farmers see them today.
            </p>

            <div className="mt-4 grid gap-3">
              {GRADES.map((g) => {
                const price = numericPrices[g.grade];
                const isGradeActive = active[g.grade];
                return (
                  <div
                    key={g.grade}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3",
                      isGradeActive
                        ? "border-border bg-cream"
                        : "border-border/60 bg-muted/30 opacity-70",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          !isGradeActive && "text-muted-foreground",
                        )}
                      >
                        {g.grade}
                      </span>
                      {!isGradeActive && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Closed
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-display text-lg font-semibold",
                          !isGradeActive && "text-muted-foreground",
                        )}
                      >
                        {isGradeActive ? `LKR ${price.toLocaleString()}` : "—"}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        per kg
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <History className="size-3.5" aria-hidden="true" />
                  Last updated
                </span>
                <span className="font-medium text-foreground">
                  {publishedAt ?? "Not yet published"}
                </span>
              </p>
              {board?.isPublished && (
                <p className="mt-1 text-right text-xs text-primary">
                  {isChanged
                    ? "You have unpublished changes"
                    : "Rates are now live for farmers"}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-cream p-5 sm:p-6">
            <h3 className="text-sm font-semibold">
              How farmers see your board
            </h3>
            <ul className="mt-3 grid gap-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                Prices update instantly after you click “Update Prices”.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                Opening or closing a grade saves on its own — no need to click
                “Update Prices” for a status change.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                Export-reference comparisons help farmers decide quickly.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DailyPriceBoardPage;
