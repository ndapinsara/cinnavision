import Image from "next/image";
import {
  ArrowRight,
  FlaskConical,
  Leaf,
  ScanLine,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./Reveal";
import leafImage from "@public/leaf-scan.jpg";

const classifications = [
  "Healthy Cinnamon",
  "Leaf Spot Disease",
  "Rough Bark",
  "Stripe Canker",
];

const DiseaseDetectionPreview = () => {
  return (
    <section id="detection" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            align="left"
            label="AI Agriculture Technology"
            title="Detect Cinnamon Diseases in Seconds"
            description="Simply upload or capture a photo of a cinnamon leaf or bark. CinnaVision's trained AI model analyzes the image and identifies potential diseases with a confidence score."
          />

          <div className="mt-8">
            <p className="text-sm font-semibold">Supported classifications</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {classifications.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <Button
            asChild
            size="lg"
            className="mt-8 h-13 rounded-full px-7 text-base"
          >
            <a href="/register">
              Try AI Disease Detection
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
          <p className="mt-4 max-w-md text-xs text-muted-foreground">
            Interface preview with demo results. AI predictions are guidance
            only and are not a scientific or medical guarantee.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[2rem] border border-border bg-card p-4 shadow-(--shadow-lift) sm:p-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <ScanLine className="size-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-semibold">
                AI Detection Preview
              </span>
              <span className="ml-auto rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                Demo
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.1fr]">
              <div className="relative overflow-hidden rounded-2xl bg-secondary">
                <Image
                  src={leafImage}
                  alt="Cinnamon leaf showing dark leaf spot lesions being analysed"
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-square w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-4 rounded-xl border-2 border-accent/70" />
                <div className="scanline pointer-events-none absolute inset-x-4 h-0.5 bg-accent shadow-[0_0_18px_2px_var(--color-accent)]" />
                <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium">
                  Cinnamon Leaf
                </span>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl bg-cream p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    AI Analysis
                  </p>
                  <p className="mt-1 font-display text-xl">Leaf Spot Disease</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Confidence</span>
                    <span>94.8%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand">
                    <div className="h-full w-[94.8%] rounded-full bg-primary" />
                  </div>
                </div>

                <p className="inline-flex items-center gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent-foreground/90">
                  <ShieldAlert
                    className="size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="text-foreground">
                    Potential Disease Detected
                  </span>
                </p>

                <div className="rounded-2xl border border-border p-4">
                  <p className="text-sm font-semibold">Recommended Treatment</p>
                  <ul className="mt-3 grid gap-2.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Leaf
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      Organic Treatment
                    </li>
                    <li className="flex items-center gap-2">
                      <FlaskConical
                        className="size-4 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      Chemical Treatment
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default DiseaseDetectionPreview;
