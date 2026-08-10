import Image from "next/image";
import { Reveal } from "./Reveal";
import plantation from "@public/plantation.jpg";

const stats = [
  { value: "AI-Powered", label: "Disease Detection" },
  { value: "Real-Time", label: "Market Information" },
  { value: "Direct", label: "Farmer–Buyer Connections" },
];

const ImpactSection = () => {
  return (
    <section className="relative isolate overflow-hidden py-24 text-primary-foreground sm:py-28">
      <Image
        src={plantation}
        alt="Misty cinnamon plantation hills in Sri Lanka at sunrise"
        loading="lazy"
        width={1600}
        height={912}
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-primary-deep/82" />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl leading-[1.1] text-balance sm:text-4xl lg:text-5xl">
            Technology for a Stronger Cinnamon Industry
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-primary-foreground/80 sm:text-lg">
            CinnaVision brings artificial intelligence and digital commerce
            together to help Sri Lankan cinnamon farmers make better decisions,
            access better market opportunities, and build stronger connections
            with buyers.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="rounded-3xl border border-primary-foreground/15 bg-primary-foreground/10 p-6 backdrop-blur-sm">
                <p className="font-display text-2xl text-accent-soft">
                  {s.value}
                </p>
                <p className="mt-1.5 text-sm text-primary-foreground/80">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
