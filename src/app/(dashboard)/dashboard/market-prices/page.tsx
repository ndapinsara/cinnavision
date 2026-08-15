"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getMarketPrices } from "@/lib/actions/daily-prices";
import type { MarketBuyer, MarketPricesData } from "@/lib/actions/daily-prices";
import type { PriceGrade } from "@/lib/models/DailyPrice";

const ALL_DISTRICTS = "All Districts";

// Mirrors PRICE_GRADES — the model itself cannot be imported into a client bundle
const gradeOptions: PriceGrade[] = ["Alba", "C5", "M4"];

const formatUpdated = (iso: string | null) => {
  if (!iso) return "not published yet";

  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

function stockMessage(
  buyer: MarketBuyer,
  grades: PriceGrade[],
  viewerName: string | null,
  viewerDistrict: string | null,
) {
  const want = grades.length
    ? grades.filter((g) => buyer.grades.includes(g))
    : buyer.grades;
  const lines = want.map(
    (g) => `• ${g} — 50 kg (LKR ${buyer.prices[g]?.toLocaleString()}/kg listed)`,
  );
  const grower = viewerName ?? "a CinnaVision grower";
  const from = viewerDistrict ? ` from ${viewerDistrict}` : "";

  return encodeURIComponent(
    `Hello ${buyer.name},\n\nI am ${grower}, a cinnamon grower${from} (CinnaVision).\n\nAvailable stock:\n${lines.join(
      "\n",
    )}\n\nAll bark is sun-dried and graded. May I know your purchasing rate for today?\n\nThank you.`,
  );
}

const MarketPricesPage = () => {
  // Published buyer boards from MongoDB — null until the first load resolves
  const [data, setData] = useState<MarketPricesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState(ALL_DISTRICTS);
  const [grades, setGrades] = useState<PriceGrade[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getMarketPrices();
        if (cancelled) return;

        if (!result.success) {
          setLoadError(result.error);
          return;
        }

        setData(result.data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("Could not load buyer prices.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleGrade = (g: PriceGrade) =>
    setGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  const districts = useMemo(
    () => [ALL_DISTRICTS, ...(data?.districts ?? [])],
    [data],
  );

  const results = useMemo(() => {
    return (data?.buyers ?? []).filter((b) => {
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        (b.town?.toLowerCase().includes(q) ?? false) ||
        (b.district?.toLowerCase().includes(q) ?? false);
      const matchDistrict =
        district === ALL_DISTRICTS || b.district === district;
      const matchGrades =
        grades.length === 0 || grades.every((g) => b.grades.includes(g));
      return matchQuery && matchDistrict && matchGrades;
    });
  }, [data, query, district, grades]);

  if (isLoading || loadError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-6">
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">
            Live Market &amp; Buyer Directory
          </h1>
        </header>
        <div
          className={cn(
            "flex items-start gap-2 rounded-3xl border p-8 text-sm",
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
              <p>Loading today&apos;s buyer rates…</p>
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
          Live Market &amp; Buyer Directory
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Find active buyers near you, compare today&apos;s purchasing rates per
          kilogram by grade, and start a middleman-free negotiation with one
          tap.
        </p>
      </header>
      <div className="grid gap-6">
        {/* Filters */}
        <section
          aria-label="Buyer filters"
          className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buyer name or location"
              aria-label="Search buyers"
              className="h-12 rounded-xl pl-11"
            />
          </div>

          <div className="mt-5 grid gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                District / Proximity
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {districts.map((d) => (
                  <li key={d}>
                    <button
                      type="button"
                      onClick={() => setDistrict(d)}
                      aria-pressed={district === d}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                        district === d
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {d}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Cinnamon Grade
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {gradeOptions.map((g) => (
                  <li key={g}>
                    <button
                      type="button"
                      onClick={() => toggleGrade(g)}
                      aria-pressed={grades.includes(g)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-semibold tracking-wide transition-colors",
                        grades.includes(g)
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {g}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {results.length}
                </span>{" "}
                active buyers
              </p>
            </div>
          </div>
        </section>

        {/* Buyer cards */}
        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-xl">
              {data && data.buyers.length === 0
                ? "No buyer has published rates yet"
                : "No buyers match these filters"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data && data.buyers.length === 0
                ? "Rates appear here as soon as buyers publish their daily price board."
                : "Try widening the district or removing a grade filter."}
            </p>
            {data && data.buyers.length > 0 && (
              <Button
                variant="outline"
                className="mt-5 rounded-xl"
                onClick={() => {
                  setQuery("");
                  setDistrict(ALL_DISTRICTS);
                  setGrades([]);
                }}
              >
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2">
            {results.map((b) => (
              <li key={b.id}>
                <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-(--shadow-soft)">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg leading-snug">
                        {b.name}
                      </h2>
                      {(b.town || b.district) && (
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" aria-hidden="true" />
                            {[b.town, b.district].filter(Boolean).join(", ")}
                          </span>
                        </p>
                      )}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {b.grades.length} grade
                      {b.grades.length === 1 ? "" : "s"} open
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {gradeOptions.map((g) => {
                      const price = b.prices[g];
                      return (
                        <div
                          key={g}
                          className={cn(
                            "rounded-2xl border px-3 py-2.5 text-center",
                            price
                              ? "border-border bg-cream"
                              : "border-dashed border-border opacity-50",
                          )}
                        >
                          <p className="text-[11px] font-bold tracking-widest text-muted-foreground">
                            {g}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold">
                            {price ? price.toLocaleString() : "—"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            LKR / kg
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Rates updated {formatUpdated(b.lastPublishedAt)} · Daily
                    quotation
                  </p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {b.whatsapp ? (
                      <Button asChild className="h-12 rounded-xl">
                        <a
                          href={`https://wa.me/${b.whatsapp}?text=${stockMessage(
                            b,
                            grades,
                            data?.viewerName ?? null,
                            data?.viewerDistrict ?? null,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle
                            className="size-4"
                            aria-hidden="true"
                          />
                          WhatsApp Message
                        </a>
                      </Button>
                    ) : (
                      <Button disabled className="h-12 rounded-xl">
                        <MessageCircle className="size-4" aria-hidden="true" />
                        No WhatsApp number
                      </Button>
                    )}
                    {b.phone ? (
                      <Button
                        asChild
                        variant="outline"
                        className="h-12 rounded-xl"
                      >
                        <a href={`tel:${b.phone}`}>
                          <Phone className="size-4" aria-hidden="true" />
                          Call Now
                        </a>
                      </Button>
                    ) : (
                      <Button
                        disabled
                        variant="outline"
                        className="h-12 rounded-xl"
                      >
                        <Phone className="size-4" aria-hidden="true" />
                        No phone number
                      </Button>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default MarketPricesPage;
