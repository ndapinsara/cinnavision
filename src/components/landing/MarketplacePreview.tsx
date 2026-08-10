import { ArrowRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./Reveal";

const filters = ["Nearby", "Alba", "C5", "M4", "Highest Price"];

const buyers = [
  {
    name: "Ceylon Cinnamon Exporters",
    location: "Matara",
    grades: "Alba · C5 · M4",
    price: "Up to LKR 4,200/kg",
    status: "Buying Now",
  },
  {
    name: "Southern Spice Collectors",
    location: "Galle",
    grades: "C5 · M4",
    price: "Up to LKR 3,850/kg",
    status: "Buying Now",
  },
  {
    name: "Lanka Bark Trading Co.",
    location: "Kalutara",
    grades: "Alba · C5",
    price: "Up to LKR 4,050/kg",
    status: "Buying Now",
  },
];

const MarketplacePreview = () => {
  return (
    <section id="marketplace" className="scroll-mt-20 bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            title="From Your Harvest to the Right Buyer"
            description="Skip unnecessary middlemen. Discover active buyers, compare purchasing prices, and connect directly with businesses looking for quality cinnamon."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="mt-9 flex flex-wrap justify-center gap-2">
            {filters.map((f, i) => (
              <li key={f}>
                <span
                  className={
                    i === 0
                      ? "inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      : "inline-block rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
                  }
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {buyers.map((b, i) => (
            <Reveal key={b.name} delay={0.1 + i * 0.08}>
              <article className="h-full rounded-3xl border border-border bg-card p-6 shadow-(--shadow-soft) transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg leading-snug">{b.name}</h3>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    <span
                      className="size-1.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    {b.status}
                  </span>
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" aria-hidden="true" />
                  {b.location}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Grades:{" "}
                  <span className="font-medium text-foreground">
                    {b.grades}
                  </span>
                </p>
                <p className="mt-1 font-display text-xl text-accent">
                  {b.price}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-11 rounded-xl">
                    <MessageCircle className="size-4" aria-hidden="true" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="h-11 rounded-xl">
                    <Phone className="size-4" aria-hidden="true" />
                    Call Buyer
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              className="h-13 rounded-full px-7 text-base"
            >
              <a href="/register">
                Explore Marketplace
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default MarketplacePreview;
