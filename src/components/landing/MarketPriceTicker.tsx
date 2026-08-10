import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

export type MarketPrice = {
  grade: string;
  price: string;
  trend: "up" | "down" | "flat";
  change: string;
  buyers: string;
};

const prices: MarketPrice[] = [
  {
    grade: "ALBA",
    price: "LKR 4,200",
    trend: "up",
    change: "+2.4%",
    buyers: "12 Active Buyers",
  },
  {
    grade: "C5",
    price: "LKR 3,800",
    trend: "up",
    change: "+1.1%",
    buyers: "9 Active Buyers",
  },
  {
    grade: "M4",
    price: "LKR 3,200",
    trend: "down",
    change: "-0.6%",
    buyers: "7 Active Buyers",
  },
];

const MarketPriceTicker = () => {
  return (
    <section id="prices" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            title="Today's Cinnamon Market"
            description="Stay updated with daily purchasing prices from active buyers."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {prices.map((p, i) => (
            <Reveal key={p.grade} delay={i * 0.08}>
              <article className="group h-full rounded-3xl border border-border bg-card p-6 shadow-(--shadow-soft) transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold tracking-widest text-secondary-foreground">
                    {p.grade}
                  </span>
                  <span
                    className={
                      p.trend === "down"
                        ? "inline-flex items-center gap-1 text-xs font-semibold text-accent"
                        : "inline-flex items-center gap-1 text-xs font-semibold text-primary"
                    }
                  >
                    {p.trend === "down" ? (
                      <TrendingDown className="size-3.5" aria-hidden="true" />
                    ) : (
                      <TrendingUp className="size-3.5" aria-hidden="true" />
                    )}
                    {p.change}
                  </span>
                </div>
                <p className="mt-5 font-display text-3xl">
                  {p.price}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / kg
                  </span>
                </p>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <span
                    className="size-2 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {p.buyers}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-8 text-center">
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary hover:underline"
            >
              Live Market Prices
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default MarketPriceTicker;
