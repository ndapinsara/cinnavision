import { Reveal, SectionHeading } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Create Your Account",
    text: "Choose whether you're a Farmer or Buyer.",
  },
  {
    n: "02",
    title: "Use AI Tools",
    text: "Detect diseases and get agricultural guidance.",
  },
  {
    n: "03",
    title: "Discover the Market",
    text: "View live prices and available harvests.",
  },
  {
    n: "04",
    title: "Connect Directly",
    text: "Buy or sell cinnamon without unnecessary middlemen.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            label="How it works"
            title="Everything You Need in One Place"
          />
        </Reveal>

        <ol className="relative mt-12 grid gap-8 lg:grid-cols-4 lg:gap-6">
          <div
            className="absolute top-6 left-6 h-[calc(100%-3rem)] w-px bg-border lg:top-6 lg:left-0 lg:h-px lg:w-full"
            aria-hidden="true"
          />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08} className="relative">
              <li className="relative flex gap-5 lg:block">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border bg-card font-display text-base text-primary shadow-(--shadow-soft)">
                  {s.n}
                </span>
                <div className="lg:mt-6">
                  <h3 className="text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:pr-6">
                    {s.text}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
