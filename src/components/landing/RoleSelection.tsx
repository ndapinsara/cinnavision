import Image from "next/image";
import type { StaticImageData } from "next/image";
import { ArrowRight, Check, ShoppingBag, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./Reveal";
import farmerImage from "@public/farmer.jpg";
import buyerImage from "@public/buyer.jpg";

type Role = {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  image: StaticImageData;
  alt: string;
};

const roles: Role[] = [
  {
    icon: Sprout,
    title: "I'm a Farmer",
    description:
      "Detect cinnamon diseases, discover treatment guidance, check live buyer prices, and sell your harvest directly.",
    features: [
      "AI disease detection",
      "Treatment recommendations",
      "Live market prices",
      "Find nearby buyers",
      "Post your harvest",
    ],
    cta: "Explore Farmer Portal",
    href: "/register?role=farmer",
    image: farmerImage,
    alt: "Sri Lankan farmer peeling cinnamon bark in a plantation",
  },
  {
    icon: ShoppingBag,
    title: "I'm a Buyer",
    description:
      "Publish your daily purchasing prices and discover quality cinnamon harvests directly from farmers.",
    features: [
      "Publish daily quotations",
      "Browse farmer listings",
      "Filter by cinnamon grade",
      "Discover regional harvests",
      "Connect directly with farmers",
    ],
    cta: "Explore Buyer Portal",
    href: "/register?role=buyer",
    image: buyerImage,
    alt: "Graded Ceylon cinnamon quills sorted for export at a trading facility",
  },
];

const RoleSelection = () => {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            title="How can CinnaVision help you?"
            description="Choose the experience designed for you."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {roles.map((role, i) => (
            <Reveal key={role.title} delay={i * 0.1}>
              <article className="group h-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-(--shadow-soft) transition-all duration-500 hover:-translate-y-1.5 hover:shadow-(--shadow-lift)">
                <div className="relative h-48 overflow-hidden sm:h-56">
                  <Image
                    src={role.image}
                    alt={role.alt}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-primary-deep/70 to-transparent" />
                  <span className="absolute bottom-4 left-5 grid size-12 place-items-center rounded-2xl bg-card text-primary shadow-(--shadow-soft)">
                    <role.icon className="size-6" aria-hidden="true" />
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl">{role.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {role.description}
                  </p>
                  <ul className="mt-6 grid gap-2.5">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    className="mt-7 h-12 w-full rounded-xl sm:w-auto"
                  >
                    <a href={role.href}>
                      {role.cta}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;
