import { ArrowRight, ShoppingBag, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

const FinalCTA = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="leaf-pattern relative overflow-hidden rounded-[2.5rem] border border-border bg-card px-6 py-16 text-center shadow-(--shadow-soft) sm:px-12">
            <Sprout
              className="pointer-events-none absolute -top-6 -left-6 size-40 text-primary/5"
              aria-hidden="true"
            />
            <Sprout
              className="pointer-events-none absolute -right-8 -bottom-10 size-48 text-accent/5"
              aria-hidden="true"
            />
            <h2 className="relative text-3xl text-balance sm:text-4xl lg:text-5xl">
              Ready to Grow Smarter?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground sm:text-lg">
              Whether you&apos;re growing cinnamon or sourcing it, CinnaVision
              gives you the tools to make better decisions.
            </p>
            <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-13 rounded-full px-7 text-base"
              >
                <a href="/register?role=farmer">
                  <Sprout className="size-4" aria-hidden="true" />
                  Get Started as a Farmer
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-primary/25 px-7 text-base"
              >
                <a href="/register?role=buyer">
                  <ShoppingBag className="size-4" aria-hidden="true" />
                  Get Started as a Buyer
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCTA;
