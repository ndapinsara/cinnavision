"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Calendar,
  ChevronDown,
  Filter,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBasket,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DISTRICTS = [
  "All Districts",
  "Matara",
  "Galle",
  "Kalutara",
  "Kandy",
  "Hambantota",
];
const GRADES = ["All Grades", "Alba", "C5", "M4", "H1", "H2"];
const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Price: Low to High", value: "price-low" },
];
const RECENCY_HOURS: Record<string, number> = {
  "2 hours ago": 2,
  "5 hours ago": 5,
  "8 hours ago": 8,
  Yesterday: 24,
  "2 days ago": 48,
};

type Listing = {
  id: string;
  farmer: string;
  farmName: string;
  avatarInitial: string;
  district: string;
  grade: string;
  quantityKg: number;
  pricePerKg: number;
  totalValue: number;
  postedAt: string;
  sold: "available" | "negotiating" | "sold";
  images: number;
  note: string;
};

const DEMO_LISTINGS: Listing[] = [
  {
    id: "1",
    farmer: "Sunil Wickramasinghe",
    farmName: "Green Leaf Estate",
    avatarInitial: "S",
    district: "Matara",
    grade: "Alba",
    quantityKg: 85,
    pricePerKg: 4100,
    totalValue: 348500,
    postedAt: "2 hours ago",
    sold: "available",
    images: 4,
    note: "Sun-dried Alba quills from first harvest. Ready for collection within 3 days.",
  },
  {
    id: "2",
    farmer: "Nimal Perera",
    farmName: "Matara Estate",
    avatarInitial: "N",
    district: "Matara",
    grade: "C5",
    quantityKg: 120,
    pricePerKg: 3750,
    totalValue: 450000,
    postedAt: "5 hours ago",
    sold: "available",
    images: 3,
    note: "Standard C5 grade available in bulk. Negotiable for long-term buyers.",
  },
  {
    id: "3",
    farmer: "Kumari Silva",
    farmName: "Hill Spice Gardens",
    avatarInitial: "K",
    district: "Kandy",
    grade: "M4",
    quantityKg: 60,
    pricePerKg: 3200,
    totalValue: 192000,
    postedAt: "8 hours ago",
    sold: "available",
    images: 2,
    note: "M4 mid-grade quills. Organically grown, no chemical treatment.",
  },
  {
    id: "4",
    farmer: "Ajith Fernando",
    farmName: "Southern Aroma Farms",
    avatarInitial: "A",
    district: "Galle",
    grade: "H1",
    quantityKg: 200,
    pricePerKg: 2950,
    totalValue: 590000,
    postedAt: "Yesterday",
    sold: "negotiating",
    images: 5,
    note: "Large H1 batch from low-country estate. Ideal for export sorting.",
  },
  {
    id: "5",
    farmer: "Samanthi Weerasinghe",
    farmName: "Ruhunu Cinnamon",
    avatarInitial: "S",
    district: "Hambantota",
    grade: "Alba",
    quantityKg: 40,
    pricePerKg: 4250,
    totalValue: 170000,
    postedAt: "Yesterday",
    sold: "available",
    images: 6,
    note: "Premium organic Alba. Hand-peeled and traditionally cured.",
  },
  {
    id: "6",
    farmer: "Ranjith Rajapaksa",
    farmName: "Kalutara Spice Valley",
    avatarInitial: "R",
    district: "Kalutara",
    grade: "C5",
    quantityKg: 95,
    pricePerKg: 3800,
    totalValue: 361000,
    postedAt: "2 days ago",
    sold: "available",
    images: 3,
    note: "Fresh C5 harvest. Consistent grade, suitable for repeat orders.",
  },
];

const statusBadge = (status: Listing["sold"]) => {
  switch (status) {
    case "sold":
      return { label: "Sold", className: "bg-muted text-muted-foreground" };
    case "negotiating":
      return { label: "Negotiating", className: "bg-accent/10 text-accent" };
    default:
      return { label: "Available", className: "bg-primary/10 text-primary" };
  }
};

const FarmerListingsPage = () => {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [grade, setGrade] = useState("All Grades");
  const [sortBy, setSortBy] = useState("recent");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let items = DEMO_LISTINGS.filter((l) => {
      const matchesSearch =
        l.farmer.toLowerCase().includes(search.toLowerCase()) ||
        l.farmName.toLowerCase().includes(search.toLowerCase()) ||
        l.note.toLowerCase().includes(search.toLowerCase());
      const matchesDistrict =
        district === "All Districts" || l.district === district;
      const matchesGrade = grade === "All Grades" || l.grade === grade;
      return matchesSearch && matchesDistrict && matchesGrade;
    });

    items = [...items].sort((a, b) => {
      switch (sortBy) {
        case "price-high":
          return b.pricePerKg - a.pricePerKg;
        case "price-low":
          return a.pricePerKg - b.pricePerKg;
        case "recent":
        default:
          return (
            (RECENCY_HOURS[a.postedAt] ?? 999) -
            (RECENCY_HOURS[b.postedAt] ?? 999)
          );
      }
    });

    return items;
  }, [search, district, grade, sortBy]);

  const activeFilterCount =
    (district !== "All Districts" ? 1 : 0) + (grade !== "All Grades" ? 1 : 0);

  const handleWhatsApp = (listing: Listing) => {
    const text = encodeURIComponent(
      `Hi ${listing.farmer}, I saw your ${listing.grade} cinnamon listing on CinnaVision (${listing.quantityKg}kg at LKR ${listing.pricePerKg}/kg). Is it still available?`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleCall = (listing: Listing) => {
    window.open("tel:+94771234567", "_self");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-6">
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Browse Farmer Listings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Explore a real-time feed of active crop advertisements from regional
          farmers. Filter by location and grade, then reach out directly to
          secure high-quality harvests.
        </p>
      </header>
      <div className="grid gap-6">
        {/* Filters */}
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Search className="size-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold">
                  Discover Active Harvests
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Search and filter listings posted by farmers across Sri Lanka.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:min-w-65">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search farmer, farm, town or grade…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 rounded-xl pl-10"
                  aria-label="Search listings"
                />
              </div>

              <Button
                variant="outline"
                className="h-11 rounded-xl lg:hidden"
                onClick={() => setShowMobileFilters((s) => !s)}
              >
                <Filter className="mr-2 size-4" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "ml-2 size-4 transition-transform",
                    showMobileFilters && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "mt-4 grid gap-3 overflow-hidden transition-all",
              showMobileFilters
                ? "grid-rows-[1fr]"
                : "grid-rows-[0fr] lg:grid-rows-[1fr]",
            )}
          >
            <div className="min-h-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                  value={district}
                  onValueChange={(value) => value && setDistrict(value)}
                >
                  <SelectTrigger
                    className="h-11 rounded-xl sm:w-48"
                    aria-label="Filter by district"
                  >
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={grade}
                  onValueChange={(value) => value && setGrade(value)}
                >
                  <SelectTrigger
                    className="h-11 rounded-xl sm:w-44"
                    aria-label="Filter by grade"
                  >
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value) => value && setSortBy(value)}
                >
                  <SelectTrigger
                    className="h-11 rounded-xl sm:w-48"
                    aria-label="Sort listings"
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDistrict("All Districts");
                      setGrade("All Grades");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="grid gap-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              active listings
            </p>
            {filtered.length > 0 && (
              <p className="hidden text-sm text-muted-foreground sm:block">
                Updated live from regional farmers
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[1.75rem] border border-border bg-card p-10 text-center shadow-(--shadow-soft)">
              <ShoppingBasket
                className="mx-auto size-10 text-muted-foreground/60"
                aria-hidden="true"
              />
              <h3 className="mt-4 font-display text-lg font-semibold">
                No listings found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your filters or search term to discover more
                harvests.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) transition-shadow hover:shadow-(--shadow-lift) sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left: farmer + crop info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 place-items-center rounded-xl bg-cream font-display text-lg font-semibold text-primary">
                            {listing.avatarInitial}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display text-base font-semibold">
                                {listing.farmer}
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {listing.farmName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                              statusBadge(listing.sold).className,
                            )}
                          >
                            {statusBadge(listing.sold).label}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                          <Calendar className="size-3" aria-hidden="true" />
                          {listing.postedAt}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-cream p-3">
                          <p className="text-xs text-muted-foreground">Grade</p>
                          <p className="font-display text-lg font-semibold">
                            {listing.grade}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-cream p-3">
                          <p className="text-xs text-muted-foreground">
                            Quantity
                          </p>
                          <p className="font-display text-lg font-semibold">
                            {listing.quantityKg} kg
                          </p>
                        </div>
                        <div className="rounded-2xl bg-cream p-3">
                          <p className="text-xs text-muted-foreground">
                            Total Value
                          </p>
                          <p className="font-display text-lg font-semibold text-primary">
                            LKR {listing.totalValue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
                        {listing.note}
                      </p>
                    </div>

                    {/* Right: price + actions */}
                    <div className="flex flex-col gap-3 sm:flex-row lg:w-64 lg:flex-col">
                      <div className="rounded-2xl bg-cream p-4 text-center lg:px-6">
                        <p className="text-xs text-muted-foreground">
                          Asking price
                        </p>
                        <p className="font-display text-2xl font-semibold text-accent">
                          LKR {listing.pricePerKg.toLocaleString()}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          per kg
                        </p>
                      </div>

                      <div className="grid flex-1 grid-cols-2 gap-2 lg:grid-cols-1">
                        <Button
                          variant="outline"
                          className="h-11 rounded-xl"
                          onClick={() => handleWhatsApp(listing)}
                          disabled={listing.sold === "sold"}
                        >
                          <MessageCircle
                            className="mr-2 size-4"
                            aria-hidden="true"
                          />
                          WhatsApp
                        </Button>
                        <Button
                          className="h-11 rounded-xl"
                          onClick={() => handleCall(listing)}
                          disabled={listing.sold === "sold"}
                        >
                          <Phone className="mr-2 size-4" aria-hidden="true" />
                          Call Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="text-xs text-muted-foreground">
          Frontend preview with demo listings. No backend integration yet — all
          listings are local sample data.
        </p>
      </div>
    </main>
  );
};

export default FarmerListingsPage;
