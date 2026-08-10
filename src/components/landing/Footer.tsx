import { Sprout } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "AI Disease Detection", href: "#detection" },
      { label: "Marketplace", href: "#marketplace" },
      { label: "Market Prices", href: "#prices" },
      { label: "AI Assistant", href: "#assistant" },
    ],
  },
  {
    title: "For Farmers",
    links: [
      { label: "Farmer Portal", href: "/register?role=farmer" },
      { label: "Post Harvest", href: "/register?role=farmer" },
      { label: "Find Buyers", href: "#marketplace" },
      { label: "Disease Detection", href: "#detection" },
    ],
  },
  {
    title: "For Buyers",
    links: [
      { label: "Buyer Portal", href: "/register?role=buyer" },
      { label: "Publish Prices", href: "/register?role=buyer" },
      { label: "Browse Harvests", href: "#marketplace" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About CinnaVision", href: "#home" },
      { label: "Contact", href: "#home" },
      { label: "Privacy", href: "#home" },
      { label: "Terms", href: "#home" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-cream py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sprout className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-semibold">
                CinnaVision
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered agriculture and direct cinnamon marketplace for Sri
              Lanka.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-sans text-sm font-semibold tracking-wide">
                {col.title}
              </h3>
              <ul className="mt-4 grid gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          © 2026 CinnaVision. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
