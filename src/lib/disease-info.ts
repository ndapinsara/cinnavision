// Keys match CLASS_NAMES in src/ml-service/predict_cinnamon_disease.py
export const DISEASE_KEYS = [
  "healthy_cinnamon",
  "leaf_spot_disease",
  "rough_bark",
  "stripe_canker",
] as const;

export type DiseaseKey = (typeof DISEASE_KEYS)[number];

export interface DiseaseInfo {
  label: string;
  severity: string;
  organic: string[];
  chemical: string[];
}

export const DISEASE_INFO: Record<DiseaseKey, DiseaseInfo> = {
  healthy_cinnamon: {
    label: "Healthy Cinnamon",
    severity: "No action required",
    organic: [
      "Maintain current spacing and shade management.",
      "Continue monthly neem-oil preventive spray (2%).",
      "Keep plantation floor free of decaying leaf litter.",
    ],
    chemical: [
      "No chemical intervention needed.",
      "Re-scan after heavy monsoon rainfall.",
    ],
  },
  leaf_spot_disease: {
    label: "Leaf Spot Disease",
    severity: "Moderate · treat within 3–5 days",
    organic: [
      "Remove and burn infected leaves; do not compost.",
      "Spray neem oil 3% + 0.5% potassium soap weekly for 3 weeks.",
      "Apply Trichoderma viride soil drench (5 g/L) around the base.",
    ],
    chemical: [
      "Copper oxychloride 50% WP @ 3 g/L, 2 sprays 14 days apart.",
      "Alternate with Mancozeb 75% WP @ 2 g/L to avoid resistance.",
      "Observe a 14-day pre-harvest interval.",
    ],
  },
  rough_bark: {
    label: "Rough Bark",
    severity: "High · isolate affected stems",
    organic: [
      "Prune and destroy roughened stems 15 cm below the lesion.",
      "Swab wounds with Bordeaux paste (10:10:100).",
      "Improve drainage; avoid overhead irrigation on stems.",
    ],
    chemical: [
      "Carbendazim 50% WP @ 1 g/L as a stem drench.",
      "Seal cut surfaces with copper-based wound sealant.",
      "Sterilise tools with 70% alcohol between plants.",
    ],
  },
  stripe_canker: {
    label: "Stripe Canker",
    severity: "Critical · act within 24–48 hours",
    organic: [
      "Excise cankered bark to healthy tissue and burn debris.",
      "Apply cow-dung + Bordeaux paste over the excised area.",
      "Drench root zone with Trichoderma-enriched compost.",
    ],
    chemical: [
      "Metalaxyl + Mancozeb @ 2 g/L stem and soil drench.",
      "Repeat after 21 days; monitor lesion margins weekly.",
      "Quarantine the block until two clean scans in a row.",
    ],
  },
};

export const isDiseaseKey = (value: string): value is DiseaseKey =>
  value in DISEASE_INFO;
