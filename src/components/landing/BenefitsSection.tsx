import {
  Bot,
  MapPinned,
  ScanLine,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const benefits: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ScanLine,
    title: "AI-Powered Detection",
    text: "Identify common cinnamon conditions using our trained AI model.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Market Prices",
    text: "Stay informed with current buyer purchasing rates.",
  },
  {
    icon: Users,
    title: "Direct Connections",
    text: "Connect farmers and buyers without unnecessary intermediaries.",
  },
  {
    icon: MapPinned,
    title: "Location-Based Discovery",
    text: "Find relevant buyers and harvests by region.",
  },
  {
    icon: Scale,
    title: "Transparent Pricing",
    text: "Compare purchasing rates and make informed decisions.",
  },
  {
    icon: Bot,
    title: "Agricultural AI Assistant",
    text: "Get instant practical farming guidance.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            label="Why CinnaVision"
            title="Built Around Real Farming Needs"
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 0.08}>
              <article className="h-full rounded-3xl border border-border bg-card p-6 shadow-(--shadow-soft) transition-transform duration-300 hover:-translate-y-1">
                <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
                  <b.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {b.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
