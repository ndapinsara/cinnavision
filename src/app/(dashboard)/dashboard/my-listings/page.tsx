"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ImagePlus,
  Leaf,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Store,
  Tag,
  Trash2,
  Upload,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Grade = "Alba" | "C5" | "M4" | "H1" | "H2";

const GRADES: Grade[] = ["Alba", "C5", "M4", "H1", "H2"];
const DISTRICTS = [
  "Matara",
  "Galle",
  "Kalutara",
  "Kandy",
  "Hambantota",
  "Colombo",
  "Gampaha",
];

const gradeDescriptions: Record<Grade, string> = {
  Alba: "Premium quills — highest export demand",
  C5: "Standard export grade with strong volume",
  M4: "Mid-grade quills for domestic & export",
  H1: "Low-country grade, ideal for export sorting",
  H2: "Bulk grade for processing and domestic use",
};

const gradeMarketRange: Record<Grade, { min: number; max: number }> = {
  Alba: { min: 3800, max: 4500 },
  C5: { min: 3400, max: 4000 },
  M4: { min: 2900, max: 3500 },
  H1: { min: 2600, max: 3200 },
  H2: { min: 2200, max: 2800 },
};

type Listing = {
  id: string;
  weightKg: number;
  grade: Grade;
  pricePerKg: number;
  phone: string;
  district: string;
  harvestDate: string;
  organic: boolean;
  note: string;
  image: string | null;
  postedAt: Date;
  status: "Available" | "Reserved";
};

const demoListings: Listing[] = [
  {
    id: "demo-1",
    weightKg: 180,
    grade: "Alba",
    pricePerKg: 4150,
    phone: "771234567",
    district: "Matara",
    harvestDate: "",
    organic: true,
    note: "Sun-dried premium quills, ready for collection within 2 days.",
    image: null,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    status: "Available",
  },
  {
    id: "demo-2",
    weightKg: 320,
    grade: "C5",
    pricePerKg: 3600,
    phone: "771234567",
    district: "Matara",
    harvestDate: "",
    organic: false,
    note: "Bulk stock from second harvest. Bags of 40 kg.",
    image: null,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
    status: "Reserved",
  },
  {
    id: "demo-3",
    weightKg: 95,
    grade: "M4",
    pricePerKg: 3050,
    phone: "771234567",
    district: "Galle",
    harvestDate: "",
    organic: false,
    note: "Mid-grade quills, graded and bundled.",
    image: null,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    status: "Available",
  },
];

const formatPhoneDisplay = (digits: string) => {
  if (digits.length !== 9) return `+94 ${digits}`;
  return `+94 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
};

const relativeTime = (date: Date) => {
  const hours = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const MyHarvestListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>(demoListings);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);

  const totalValue = useMemo(
    () => listings.reduce((sum, l) => sum + l.weightKg * l.pricePerKg, 0),
    [listings],
  );
  const totalWeight = useMemo(
    () => listings.reduce((sum, l) => sum + l.weightKg, 0),
    [listings],
  );
  const availableCount = listings.filter(
    (l) => l.status === "Available",
  ).length;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (listing: Listing) => {
    setEditing(listing);
    setDialogOpen(true);
  };

  const handleSave = (listing: Listing) => {
    setListings((prev) => {
      const exists = prev.some((l) => l.id === listing.id);
      return exists
        ? prev.map((l) => (l.id === listing.id ? listing : l))
        : [listing, ...prev];
    });
    setDialogOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleStatus = (id: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: l.status === "Available" ? "Reserved" : "Available",
            }
          : l,
      ),
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-6">
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          My Harvest Listings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Publish your cinnamon harvest in under a minute. Add the grade, total
          weight, expected price and your contact number so buyers can message
          or call you directly.
        </p>
      </header>
      <div className="grid gap-6">
        {/* Summary + add */}
        <section className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-card p-5 shadow-(--shadow-soft) sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-3 lg:flex-1">
            <div className="rounded-2xl bg-cream p-4">
              <p className="text-xs text-muted-foreground">Active listings</p>
              <p className="font-display text-2xl font-semibold">
                {listings.length}
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  {availableCount} available
                </span>
              </p>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <p className="text-xs text-muted-foreground">Total stock</p>
              <p className="font-display text-2xl font-semibold">
                {totalWeight.toLocaleString()} kg
              </p>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <p className="text-xs text-muted-foreground">Estimated value</p>
              <p className="font-display text-2xl font-semibold text-primary">
                LKR {totalValue.toLocaleString()}
              </p>
            </div>
          </div>
          <Button className="h-12 shrink-0 rounded-xl px-6" onClick={openAdd}>
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Add Listing
          </Button>
        </section>

        {/* Listings */}
        {listings.length === 0 ? (
          <section className="grid place-items-center rounded-[1.75rem] border border-dashed border-border bg-card p-12 text-center">
            <Store
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-4 font-display text-xl">No listings yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Publish your available cinnamon stock so buyers in your district
              can find and contact you directly.
            </p>
            <Button className="mt-5 h-12 rounded-xl px-6" onClick={openAdd}>
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Add Listing
            </Button>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="flex flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-(--shadow-soft)"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-primary font-display text-base font-semibold text-primary-foreground">
                      {listing.grade.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        {listing.grade} · {listing.weightKg} kg
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {relativeTime(listing.postedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStatus(listing.id)}
                    aria-label={`Mark listing as ${listing.status === "Available" ? "reserved" : "available"}`}
                  >
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                        listing.status === "Available"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent/15 text-accent",
                      )}
                    >
                      {listing.status}
                    </Badge>
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                    <MapPin className="size-3" aria-hidden="true" />
                    {listing.district}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                    <Calendar className="size-3" aria-hidden="true" />
                    {listing.harvestDate
                      ? new Date(listing.harvestDate).toLocaleDateString(
                          "en-LK",
                        )
                      : "Ready now"}
                  </span>
                  {listing.organic && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
                      <Leaf className="size-3" aria-hidden="true" />
                      Organic
                    </span>
                  )}
                </div>

                {listing.image && (
                  <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-border">
                    <img
                      src={listing.image}
                      alt={`${listing.grade} harvest`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-cream p-3">
                    <p className="text-xs text-muted-foreground">
                      Asking price
                    </p>
                    <p className="font-display text-lg font-semibold text-accent">
                      LKR {listing.pricePerKg.toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      per kg
                    </p>
                  </div>
                  <div className="rounded-xl bg-cream p-3">
                    <p className="text-xs text-muted-foreground">Total value</p>
                    <p className="font-display text-lg font-semibold text-primary">
                      LKR{" "}
                      {(listing.weightKg * listing.pricePerKg).toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {listing.weightKg} kg
                    </p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {listing.note || "No additional details."}
                </p>

                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {formatPhoneDisplay(listing.phone)}
                </p>

                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  <Button
                    variant="outline"
                    className="h-11 flex-1 rounded-xl"
                    onClick={() => openEdit(listing)}
                  >
                    <Pencil className="mr-2 size-4" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 flex-1 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTarget(listing)}
                  >
                    <Trash2 className="mr-2 size-4" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}

        <p className="text-xs text-muted-foreground">
          Frontend preview only — no backend integration yet. Listings stay
          local to this session.
        </p>

        <ListingDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditing(null);
          }}
          listing={editing}
          onSave={handleSave}
        />

        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent className="rounded-[1.5rem]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget
                  ? `${deleteTarget.grade} · ${deleteTarget.weightKg} kg in ${deleteTarget.district} will be removed and buyers will no longer see it.`
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={confirmDelete}
              >
                Delete listing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
};

function ListingDialog({
  open,
  onOpenChange,
  listing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
  onSave: (listing: Listing) => void;
}) {
  const isEdit = !!listing;
  const [weightKg, setWeightKg] = useState(
    listing ? String(listing.weightKg) : "",
  );
  const [grade, setGrade] = useState<Grade>(listing?.grade ?? "Alba");
  const [pricePerKg, setPricePerKg] = useState(
    listing ? String(listing.pricePerKg) : "",
  );
  const [phone, setPhone] = useState(
    listing ? formatPhoneInput(listing.phone) : "",
  );
  const [district, setDistrict] = useState(listing?.district ?? "Matara");
  const [harvestDate, setHarvestDate] = useState(listing?.harvestDate ?? "");
  const [organic, setOrganic] = useState(listing?.organic ?? false);
  const [note, setNote] = useState(listing?.note ?? "");
  const [image, setImage] = useState<string | null>(listing?.image ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const numericWeight = Number(weightKg) || 0;
  const numericPrice = Number(pricePerKg) || 0;
  const totalValue = numericWeight * numericPrice;
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const isWithinRange =
    !numericPrice ||
    (numericPrice >= gradeMarketRange[grade].min &&
      numericPrice <= gradeMarketRange[grade].max);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a photo (JPG or PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const phoneDigits = phone.replace(/\D/g, "");

    if (!numericWeight || numericWeight <= 0) {
      setError("Please enter a valid total weight in kilograms.");
      return;
    }
    if (!numericPrice || numericPrice <= 0) {
      setError("Please enter a valid expected price per kg.");
      return;
    }
    if (phoneDigits.length < 9) {
      setError("Please enter a valid 9-digit mobile number after +94.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      onSave({
        id: listing?.id ?? `local-${Date.now()}`,
        weightKg: numericWeight,
        grade,
        pricePerKg: numericPrice,
        phone: phoneDigits,
        district,
        harvestDate,
        organic,
        note,
        image,
        postedAt: listing?.postedAt ?? new Date(),
        status: listing?.status ?? "Available",
      });
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-[1.5rem] p-0">
        <DialogHeader className="shrink-0 gap-1.5 border-b border-border px-5 py-4 pr-14 sm:px-7 sm:py-5">
          <DialogTitle className="flex items-center gap-2 font-display text-xl sm:text-2xl">
            <Store className="size-5 shrink-0 text-primary" aria-hidden="true" />
            {isEdit ? "Edit Listing" : "Add Listing"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your stock details — buyers see changes instantly."
              : "Publish your available cinnamon stock so buyers can discover it instantly."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto px-5 py-5 sm:px-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="grade"
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <Tag
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Cinnamon Grade
                </Label>
                <Select value={grade} onValueChange={(v) => setGrade(v as Grade)}>
                  <SelectTrigger
                    id="grade"
                    className="w-full rounded-xl data-[size=default]:h-12"
                    aria-label="Select cinnamon grade"
                  >
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {gradeDescriptions[grade]}
                </p>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="weight"
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <Weight
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Total Weight (kg)
                </Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="text"
                    inputMode="numeric"
                    value={weightKg}
                    onChange={(e) =>
                      setWeightKg(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="e.g. 120"
                    className="h-12 rounded-xl pr-14 text-right font-display text-lg"
                    aria-label="Total weight in kilograms"
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    kg
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="price"
                className="flex items-center gap-1.5 text-sm font-medium"
              >
                <Tag
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                Expected Price per kg
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  LKR
                </span>
                <Input
                  id="price"
                  type="text"
                  inputMode="numeric"
                  value={pricePerKg}
                  onChange={(e) =>
                    setPricePerKg(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="e.g. 3800"
                  className={cn(
                    "h-12 rounded-xl pl-11 text-right font-display text-lg",
                    !isWithinRange && "border-accent focus-visible:ring-accent",
                  )}
                  aria-label="Expected price per kilogram"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                  Typical market range: LKR{" "}
                  {gradeMarketRange[grade].min.toLocaleString()} -{" "}
                  {gradeMarketRange[grade].max.toLocaleString()}/kg
                </span>
                {!isWithinRange && (
                  <span className="inline-flex items-center gap-1 font-medium text-accent">
                    <AlertCircle className="size-3.5" aria-hidden="true" />
                    Price outside typical range
                  </span>
                )}
              </div>
              {totalValue > 0 && (
                <p className="text-xs font-medium text-primary">
                  Total value: LKR {totalValue.toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="phone"
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <Phone
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Contact Number
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                    +94
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    placeholder="77 123 4567"
                    className="h-12 rounded-xl pl-12 font-display"
                    aria-label="Mobile phone number"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="district"
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <MapPin
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  District
                </Label>
                <Select
                  value={district}
                  onValueChange={(value) => value && setDistrict(value)}
                >
                  <SelectTrigger
                    id="district"
                    className="w-full rounded-xl data-[size=default]:h-12"
                    aria-label="Select district"
                  >
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="harvestDate"
                  className="flex items-center gap-1.5 text-sm font-medium"
                >
                  <Calendar
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Harvest / Ready Date
                </Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={harvestDate}
                  min={today}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="h-12 rounded-xl font-display"
                  aria-label="Expected harvest or ready date"
                />
              </div>

              <div className="flex flex-col justify-between gap-2 rounded-2xl border border-border bg-cream p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Leaf className="size-4 text-primary" aria-hidden="true" />
                    <span className="text-sm font-medium">
                      Organic / Chemical-free
                    </span>
                  </div>
                  <Switch
                    id="organic"
                    checked={organic}
                    onCheckedChange={setOrganic}
                    aria-label="Toggle organic certification"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Toggle on if grown without synthetic pesticides.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <ImagePlus
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                Photo (optional)
              </Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                  aria-label="Upload harvest photo"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl px-5"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" aria-hidden="true" />
                  {image ? "Change photo" : "Upload photo"}
                </Button>
                {image && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Remove photo
                  </button>
                )}
              </div>
              {image && (
                <div className="relative mt-1 aspect-video w-full max-w-sm overflow-hidden rounded-2xl border border-border">
                  <img
                    src={image}
                    alt="Preview of harvest"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="note"
                className="flex items-center gap-1.5 text-sm font-medium"
              >
                <Package
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                Additional Details
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="E.g. first harvest, sun-dried, available for collection within 3 days…"
                className="min-h-22.5 rounded-xl"
                aria-label="Additional details about the harvest"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 rounded-b-[1.5rem] px-5 py-4 sm:gap-3 sm:px-7">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl px-5"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-xl px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle2 className="mr-2 size-4" aria-hidden="true" />
              )}
              {isSubmitting
                ? isEdit
                  ? "Saving changes…"
                  : "Publishing listing…"
                : isEdit
                  ? "Save Changes"
                  : "Publish Listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export default MyHarvestListingsPage;
