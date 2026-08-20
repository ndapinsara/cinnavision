import type { ElementType } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Leaf,
  MapPin,
  Microscope,
  Package,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Sprout,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RefreshButton from "@/components/dashboard/RefreshButton";
import { cloudinaryThumb } from "@/lib/cloudinary-url";
import { cn } from "@/lib/utils";
import {
  getFarmerDashboard,
  type DashboardRate,
  type FarmerDashboardData,
} from "@/lib/actions/farmer-dashboard";

type Tone = "primary" | "accent" | "destructive";

const TONE_CHIP: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  destructive: "bg-destructive/10 text-destructive",
};

const TONE_BAR: Record<Tone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  destructive: "bg-destructive",
};

const QUICK_ACTIONS = [
  {
    href: "/dashboard/disease-detect",
    label: "Scan a leaf",
    description: "Detect disease from a photo in seconds",
    icon: Microscope,
  },
  {
    href: "/dashboard/market-prices",
    label: "Check rates",
    description: "Compare buyer prices grade by grade",
    icon: TrendingUp,
  },
  {
    href: "/dashboard/my-listings",
    label: "Post harvest",
    description: "Reach buyers without a middleman",
    icon: Package,
  },
];

const formatLkr = (value: number) => `LKR ${value.toLocaleString("en-LK")}`;

const compactLkr = (value: number) =>
  value >= 1_000_000
    ? `LKR ${(value / 1_000_000).toFixed(2)}M`
    : formatLkr(value);

const relativeTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return formatDistanceToNow(date, { addSuffix: true });
};

const scanTone = (disease: string): Tone => {
  if (disease === "healthy_cinnamon") return "primary";
  if (disease === "leaf_spot_disease") return "accent";
  return "destructive";
};

// The single most useful next step, decided from what is actually stored
function buildAdvisory(data: FarmerDashboardData) {
  const { summary, recentScans, priceGaps } = data;

  const sickScan = recentScans.find(
    (scan) => scan.disease !== "healthy_cinnamon",
  );

  if (sickScan) {
    return {
      title: `Treat ${sickScan.diseaseLabel}`,
      body: `${sickScan.severity} Open the scan to follow the organic and chemical treatment steps for the affected plot.`,
      href: "/dashboard/disease-detect",
      cta: "View treatment",
      tone: "destructive" as Tone,
    };
  }

  const bestGap = priceGaps.reduce<(typeof priceGaps)[number] | null>(
    (best, gap) => (!best || gap.diff > best.diff ? gap : best),
    null,
  );

  if (bestGap && bestGap.diff > 0) {
    return {
      title: `Raise your ${bestGap.grade} price`,
      body: `Buyers are quoting up to ${formatLkr(bestGap.best)} per kg while you are asking ${formatLkr(bestGap.asking)} — that is ${formatLkr(bestGap.diff * bestGap.weightKg)} across your ${bestGap.weightKg.toLocaleString()} kg.`,
      href: "/dashboard/my-listings",
      cta: "Update listing",
      tone: "accent" as Tone,
    };
  }

  if (summary.availableListings === 0) {
    return {
      title: "Publish your harvest",
      body: "You have no stock on the market right now. Post your grade, weight and asking price so buyers can contact you directly.",
      href: "/dashboard/my-listings",
      cta: "Add a listing",
      tone: "accent" as Tone,
    };
  }

  if (summary.totalScans === 0) {
    return {
      title: "Run your first leaf scan",
      body: "Photograph a leaf and the AI model checks it for leaf spot, rough bark and stripe canker in a few seconds.",
      href: "/dashboard/disease-detect",
      cta: "Scan a leaf",
      tone: "primary" as Tone,
    };
  }

  return {
    title: "Your plantation looks healthy",
    body: "No disease was found in your recent scans. Re-scan after the next heavy rain — that is when leaf spot spreads fastest.",
    href: "/dashboard/disease-detect",
    cta: "Scan again",
    tone: "primary" as Tone,
  };
}

const FarmerDashboard = async ({ userName }: { userName?: string }) => {
  const result = await getFarmerDashboard();

  if (!result.success) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-6">
          <h1 className="font-display text-3xl sm:text-4xl">Dashboard</h1>
        </header>
        <section className="grid place-items-center rounded-[1.75rem] border border-dashed border-destructive/40 bg-card p-12 text-center">
          <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">
            Could not load your dashboard
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {result.error}
          </p>
          <RefreshButton label="Try again" className="mt-5 h-12 px-6" />
        </section>
      </main>
    );
  }

  const data = result.data;
  const { summary, rates, topRate, priceGaps, recentScans, recentListings } =
    data;

  const greetingName =
    userName || data.farmerName?.split(" ")[0] || "Farmer";
  const today = new Date().toLocaleDateString("en-LK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const advisory = buildAdvisory(data);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Welcome banner */}
      <section className="leaf-pattern relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-(--shadow-soft) sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                <Sprout className="size-3.5" aria-hidden="true" />
                Farmer Portal
              </span>
              {data.district && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {data.district}
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-4xl">
              Ayubowan, {greetingName}
            </h1>

            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
                {today}
              </p>
              <RefreshButton
                label="Refresh data"
                className="h-8 rounded-full px-3 text-xs"
              />
            </div>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Scan your cinnamon leaves for early disease signs, follow
              today&apos;s buyer rates and publish your harvest — everything for
              your plantation in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-xl px-6">
                <Link href="/dashboard/disease-detect">
                  <ScanLine className="size-4" aria-hidden="true" />
                  Scan a leaf
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl px-6">
                <Link href="/dashboard/my-listings">
                  <Package className="size-4" aria-hidden="true" />
                  Add a listing
                </Link>
              </Button>
            </div>
          </div>

          {/* Best rate published by any buyer right now */}
          <div className="rounded-[1.5rem] border border-border bg-cream p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Today&apos;s best rate
              </p>
              {topRate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Users className="size-3" aria-hidden="true" />
                  {topRate.buyers}
                </span>
              )}
            </div>

            {topRate ? (
              <>
                <p className="mt-3 font-display text-3xl font-semibold text-primary">
                  {formatLkr(topRate.best)}
                </p>
                <p className="text-xs text-muted-foreground">
                  per kg · {topRate.grade} grade
                  {topRate.topBuyer ? ` · ${topRate.topBuyer}` : ""}
                </p>

                <SpreadBar rate={topRate} className="mt-4" />

                <p className="mt-3 text-xs text-muted-foreground">
                  {data.localBuyers > 0 && data.district
                    ? `${data.localBuyers} of ${data.marketBuyers} buyers publish from ${data.district}.`
                    : `${data.marketBuyers} buyer${
                        data.marketBuyers === 1 ? "" : "s"
                      } publishing rates today.`}
                </p>

                <Link
                  href="/dashboard/market-prices"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  See all buyer rates
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 font-display text-xl">No rates yet</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  No buyer has published a price board today. Rates appear here
                  as soon as one does.
                </p>
                <Link
                  href="/dashboard/market-prices"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open buyer directory
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Key numbers */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="Active listings"
          value={String(summary.availableListings)}
          note={
            summary.totalListings === 0
              ? "Nothing published yet"
              : `${summary.totalListings} total · ${summary.soldListings} sold`
          }
        />
        <StatCard
          icon={Leaf}
          label="Stock ready"
          value={`${summary.availableStockKg.toLocaleString()} kg`}
          note={
            summary.soldStockKg > 0
              ? `${summary.soldStockKg.toLocaleString()} kg already sold`
              : "Across your available listings"
          }
        />
        <StatCard
          icon={Wallet}
          label="Estimated value"
          value={compactLkr(summary.availableValue)}
          note={
            summary.soldValue > 0
              ? `${compactLkr(summary.soldValue)} from sold stock`
              : "At your asking prices"
          }
          tone="accent"
        />
        <StatCard
          icon={BadgeCheck}
          label="Plant health"
          value={
            summary.healthyShare === null ? "—" : `${summary.healthyShare}%`
          }
          note={
            summary.totalScans === 0
              ? "Run your first scan"
              : `${summary.healthyScans}/${summary.totalScans} scans healthy · ${summary.scansLast30Days} this month`
          }
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="grid gap-6 lg:col-span-2 lg:content-start">
          {/* Quick actions */}
          <section
            aria-label="Quick actions"
            className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6"
          >
            <h2 className="font-display text-xl">Quick actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The three things farmers use most, one tap away.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex flex-col rounded-2xl border border-border bg-cream p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <action.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="mt-3.5 font-medium">{action.label}</span>
                  <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {action.description}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Open
                    <ArrowUpRight
                      className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Buyer rates */}
          <section
            aria-label="Today's buyer rates"
            className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">
                  Today&apos;s buyer rates
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Published price boards, best rate first.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-10 shrink-0 rounded-xl"
              >
                <Link href="/dashboard/market-prices">
                  View directory
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {rates.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No buyer rates published"
                body="Once buyers publish their daily price board, every grade they quote shows up here."
                className="mt-5"
              />
            ) : (
              <ul className="mt-5 grid gap-2.5">
                {rates.map((rate) => (
                  <li
                    key={rate.grade}
                    className="flex flex-wrap items-center gap-3 rounded-2xl bg-cream px-4 py-3"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-sm font-semibold text-primary-foreground">
                      {rate.grade}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{rate.grade} grade</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {rate.buyers} buyer{rate.buyers === 1 ? "" : "s"}
                        {rate.topBuyer ? ` · best from ${rate.topBuyer}` : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-lg font-semibold text-accent">
                        {rate.best.toLocaleString()}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        LKR / kg
                      </p>
                    </div>

                    <div className="w-full sm:w-40">
                      <SpreadBar rate={rate} compact />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Asking price vs what buyers pay */}
            {priceGaps.length > 0 && (
              <div className="mt-5 border-t border-border pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Your price vs the market
                </h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {priceGaps.map((gap) => {
                    const behind = gap.diff > 0;
                    return (
                      <li
                        key={gap.grade}
                        className="rounded-2xl border border-border p-3.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            {gap.grade} · {gap.weightKg.toLocaleString()} kg
                          </p>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[11px] font-semibold",
                              behind
                                ? TONE_CHIP.accent
                                : TONE_CHIP.primary,
                            )}
                          >
                            {behind
                              ? `+${gap.diff.toLocaleString()}`
                              : "Best price"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          You ask {formatLkr(gap.asking)} · buyers pay up to{" "}
                          {formatLkr(gap.best)} per kg
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          {/* Recent scans */}
          <section
            aria-label="Recent scans"
            className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Recent leaf scans</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your latest AI disease checks and their confidence.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-10 shrink-0 rounded-xl"
              >
                <Link href="/dashboard/disease-detect">
                  <ScanLine className="size-4" aria-hidden="true" />
                  New scan
                </Link>
              </Button>
            </div>

            {recentScans.length === 0 ? (
              <EmptyState
                icon={Microscope}
                title="No scans yet"
                body="Photograph a leaf and the AI model classifies it, saves the result and keeps the treatment guide here."
                href="/dashboard/disease-detect"
                cta="Scan a leaf"
                className="mt-5"
              />
            ) : (
              <ul className="mt-5 grid gap-3">
                {recentScans.map((scan) => {
                  const tone = scanTone(scan.disease);
                  const healthy = scan.disease === "healthy_cinnamon";
                  return (
                    <li
                      key={scan.id}
                      className="rounded-2xl border border-border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={cloudinaryThumb(scan.imageUrl)}
                          alt={`Scan classified as ${scan.diseaseLabel}`}
                          loading="lazy"
                          className="size-14 shrink-0 rounded-xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {scan.diseaseLabel}
                              </p>
                              <time
                                dateTime={scan.createdAt}
                                className="text-xs text-muted-foreground"
                              >
                                {relativeTime(scan.createdAt)}
                              </time>
                            </div>
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                                TONE_CHIP[tone],
                              )}
                            >
                              {scan.confidence.toFixed(1)}%
                            </span>
                          </div>

                          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                TONE_BAR[tone],
                              )}
                              style={{
                                width: `${Math.min(Math.max(scan.confidence, 0), 100)}%`,
                              }}
                            />
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
                            {scan.severity || "No severity recorded"}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="grid gap-6 lg:content-start">
          {/* Plantation health */}
          <section
            aria-label="Plantation health"
            className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6"
          >
            <h2 className="font-display text-xl">Plantation health</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {summary.totalScans === 0
                ? "Your scan results will be summarised here."
                : `Across all ${summary.totalScans} scan${
                    summary.totalScans === 1 ? "" : "s"
                  } you have run.`}
            </p>

            {data.health.length === 0 ? (
              <EmptyState
                icon={Leaf}
                title="Nothing scanned yet"
                body="Every scan you run is grouped here so you can see which disease is spreading."
                className="mt-5"
              />
            ) : (
              <div className="mt-5 grid gap-4">
                {data.health.map((row) => (
                  <div key={row.disease}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.count} · {row.share}%
                      </p>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          TONE_BAR[scanTone(row.disease)],
                        )}
                        style={{ width: `${row.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent listings */}
          <section
            aria-label="Recent listings"
            className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl">Your listings</h2>
              {summary.availableListings > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {summary.availableListings} live
                </span>
              )}
            </div>

            {recentListings.length === 0 ? (
              <EmptyState
                icon={Store}
                title="No listings yet"
                body="Publish your available stock so buyers in your district can find and call you."
                href="/dashboard/my-listings"
                cta="Add a listing"
                className="mt-4"
              />
            ) : (
              <>
                <ul className="mt-4 grid gap-3">
                  {recentListings.map((listing) => (
                    <li
                      key={listing.id}
                      className="rounded-2xl bg-cream p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {listing.grade} · {listing.weightKg.toLocaleString()}{" "}
                          kg
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                            listing.status === "Available"
                              ? TONE_CHIP.primary
                              : TONE_CHIP.accent,
                          )}
                        >
                          {listing.status}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatLkr(listing.pricePerKg)} per kg ·{" "}
                        {formatLkr(listing.weightKg * listing.pricePerKg)} total
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1">
                          <MapPin className="size-3" aria-hidden="true" />
                          {listing.district}
                        </span>
                        {listing.organic && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                            <Leaf className="size-3" aria-hidden="true" />
                            Organic
                          </span>
                        )}
                        <span>{relativeTime(listing.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant="outline"
                  className="mt-4 h-11 w-full rounded-xl"
                >
                  <Link href="/dashboard/my-listings">
                    Manage my listings
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}
          </section>

          {/* Data-driven next step */}
          <section
            className={cn(
              "rounded-3xl border p-5 sm:p-6",
              advisory.tone === "destructive"
                ? "border-destructive/25 bg-destructive/5"
                : advisory.tone === "accent"
                  ? "border-accent/25 bg-accent/10"
                  : "border-primary/25 bg-primary/5",
            )}
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-xl",
                advisory.tone === "destructive"
                  ? "bg-destructive text-destructive-foreground"
                  : advisory.tone === "accent"
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground",
              )}
            >
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-3.5 font-display text-lg">{advisory.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {advisory.body}
            </p>
            <Link
              href={advisory.href}
              className="mt-3.5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {advisory.cta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
};

// Lowest → highest quote for one grade, with the average marked on the track
function SpreadBar({
  rate,
  compact = false,
  className,
}: {
  rate: DashboardRate;
  compact?: boolean;
  className?: string;
}) {
  const span = rate.best - rate.low;

  // One quote (or identical quotes) has no spread to draw
  if (span === 0) {
    return (
      <div className={className}>
        <div className="h-1.5 w-full rounded-full bg-primary/70" />
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          {rate.buyers === 1
            ? "Only quote today"
            : "All buyers quote the same rate"}
        </p>
      </div>
    );
  }

  const position = ((rate.average - rate.low) / span) * 100;

  return (
    <div className={className}>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-primary/70"
          style={{ width: `${Math.min(Math.max(position, 4), 100)}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{rate.low.toLocaleString()}</span>
        <span>
          {compact ? "avg " : "average "}
          {rate.average.toLocaleString()}
        </span>
        <span>{rate.best.toLocaleString()}</span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone = "primary",
}: {
  icon: ElementType;
  label: string;
  value: string;
  note: string;
  tone?: "primary" | "accent";
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-(--shadow-soft)">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            tone === "accent"
              ? "bg-accent/15 text-accent"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-4 font-display text-2xl font-semibold",
          tone === "accent" && "text-accent",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </article>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  href,
  cta,
  className,
}: {
  icon: ElementType;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3.5 font-display text-base">{title}</p>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
      {href && cta && (
        <Button asChild className="mt-4 h-11 rounded-xl px-5">
          <Link href={href}>{cta}</Link>
        </Button>
      )}
    </div>
  );
}

export default FarmerDashboard;
