// Shared between the Listing model, its server actions and the dashboard UI,
// so the client never has to import mongoose just to read a grade list.

export const LISTING_GRADES = ["Alba", "C5", "M4", "H1", "H2"] as const;

export type ListingGrade = (typeof LISTING_GRADES)[number];

export const LISTING_STATUSES = ["Available", "Sold"] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

// Kept in sync with the district list farmers pick from during onboarding,
// so a listing can always default to the district on their profile
export const LISTING_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
] as const;

export type ListingDistrict = (typeof LISTING_DISTRICTS)[number];

export const DEFAULT_LISTING_DISTRICT: ListingDistrict = "Matara";

// Guard rails so a mistyped listing cannot be published to buyers
export const MAX_WEIGHT_KG = 100000;
export const MAX_PRICE_PER_KG = 100000;
export const MAX_NOTE_LENGTH = 500;

export const GRADE_DESCRIPTIONS: Record<ListingGrade, string> = {
  Alba: "Premium quills — highest export demand",
  C5: "Standard export grade with strong volume",
  M4: "Mid-grade quills for domestic & export",
  H1: "Low-country grade, ideal for export sorting",
  H2: "Bulk grade for processing and domestic use",
};

// Indicative bands shown next to the price field — advisory only, not enforced
export const GRADE_MARKET_RANGE: Record<
  ListingGrade,
  { min: number; max: number }
> = {
  Alba: { min: 3800, max: 4500 },
  C5: { min: 3400, max: 4000 },
  M4: { min: 2900, max: 3500 },
  H1: { min: 2600, max: 3200 },
  H2: { min: 2200, max: 2800 },
};

export function isListingDistrict(value: string): value is ListingDistrict {
  return (LISTING_DISTRICTS as readonly string[]).includes(value);
}
