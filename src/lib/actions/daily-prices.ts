"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import DailyPrice, {
  DEFAULT_GRADE_PRICES,
  MAX_PRICE_PER_KG,
  PRICE_GRADES,
  type PriceGrade,
} from "@/lib/models/DailyPrice";

export interface DailyPriceEntry {
  grade: PriceGrade;
  price: number;
  active: boolean;
  updatedAt: string | null;
}

export interface DailyPriceBoardData {
  grades: DailyPriceEntry[];
  lastPublishedAt: string | null;
  buyerName: string | null;
  district: string | null;
  isPublished: boolean;
}

export interface DailyPriceInput {
  grade: PriceGrade;
  price: number;
  active: boolean;
}

// A published buyer board as farmers see it in the market directory
export interface MarketBuyer {
  id: string;
  name: string;
  district: string | null;
  town: string | null;
  phone: string | null;
  whatsapp: string | null;
  grades: PriceGrade[];
  prices: Partial<Record<PriceGrade, number>>;
  lastPublishedAt: string | null;
}

export interface MarketPricesData {
  buyers: MarketBuyer[];
  districts: string[];
  viewerName: string | null;
  viewerDistrict: string | null;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type LeanGradePrice = {
  grade: PriceGrade;
  price: number;
  active: boolean;
  updatedAt?: Date;
};

type LeanBoard = {
  buyerName?: string;
  district?: string;
  grades?: LeanGradePrice[];
  lastPublishedAt?: Date;
};

type GradeUpdate = {
  price?: number;
  active?: boolean;
};

type LeanMarketBoard = LeanBoard & { clerkId: string };

type LeanBuyerProfile = {
  clerkId: string;
  buyerName?: string;
  district?: string;
  address?: string;
  phone?: string;
};

type BuyerContext = {
  userId: string;
  buyerName: string | null;
  district: string | null;
};

// Only signed-in buyer accounts own a price board
async function resolveBuyer(): Promise<
  { ok: true; ctx: BuyerContext } | { ok: false; error: string }
> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  await connectDB();

  const user = await User.findOne({ clerkId: userId })
    .select("role buyerName district")
    .lean<{ role?: string; buyerName?: string; district?: string } | null>();

  const role =
    user?.role && user.role !== "none" ? user.role : sessionClaims?.metadata?.role;

  if (role !== "buyer") {
    return {
      ok: false,
      error: "Only buyer accounts can manage the daily price board",
    };
  }

  return {
    ok: true,
    ctx: {
      userId,
      buyerName: user?.buyerName ?? null,
      district: user?.district ?? null,
    },
  };
}

function serializeBoard(
  board: LeanBoard | null,
  ctx: BuyerContext,
): DailyPriceBoardData {
  const stored = new Map(
    (board?.grades ?? []).map((entry) => [entry.grade, entry]),
  );

  return {
    grades: PRICE_GRADES.map((grade) => {
      const entry = stored.get(grade);
      return {
        grade,
        price: entry?.price ?? DEFAULT_GRADE_PRICES[grade],
        active: entry?.active ?? true,
        updatedAt: entry?.updatedAt ? entry.updatedAt.toISOString() : null,
      };
    }),
    lastPublishedAt: board?.lastPublishedAt
      ? board.lastPublishedAt.toISOString()
      : null,
    buyerName: board?.buyerName ?? ctx.buyerName,
    district: board?.district ?? ctx.district,
    isPublished: Boolean(board?.lastPublishedAt),
  };
}

// Apply partial updates on top of what is already stored, keeping the rest intact.
// A grade's updatedAt only moves when its price or status actually changed.
function mergeGrades(
  existing: LeanGradePrice[] | undefined,
  updates: Map<PriceGrade, GradeUpdate>,
  now: Date,
): LeanGradePrice[] {
  const storedByGrade = new Map(
    (existing ?? []).map((entry) => [entry.grade, entry]),
  );

  return PRICE_GRADES.map((grade) => {
    const stored = storedByGrade.get(grade);
    const update = updates.get(grade);

    const price = update?.price ?? stored?.price ?? DEFAULT_GRADE_PRICES[grade];
    const active = update?.active ?? stored?.active ?? true;
    const changed =
      !stored || stored.price !== price || stored.active !== active;

    return {
      grade,
      price,
      active,
      updatedAt: changed ? now : (stored?.updatedAt ?? now),
    };
  });
}

async function persistBoard(
  ctx: BuyerContext,
  existing: LeanBoard | null,
  updates: Map<PriceGrade, GradeUpdate>,
): Promise<DailyPriceBoardData> {
  const now = new Date();

  const board = await DailyPrice.findOneAndUpdate(
    { clerkId: ctx.userId },
    {
      $set: {
        grades: mergeGrades(existing?.grades, updates, now),
        lastPublishedAt: now,
        buyerName: ctx.buyerName ?? undefined,
        district: ctx.district ?? undefined,
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).lean<LeanBoard | null>();

  revalidatePath("/dashboard/daily-prices");
  revalidatePath("/dashboard/market-prices");

  return serializeBoard(board, ctx);
}

// Local numbers are stored as typed (0771234567 / +94771234567); wa.me needs 94…
function toWhatsAppNumber(phone: string | null): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");

  if (!digits) return null;
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;

  return digits;
}

// Every buyer board that has been published, as farmers browse it.
// Grades a buyer has closed are left out, so a card only shows live rates.
export async function getMarketPrices(): Promise<
  ActionResult<MarketPricesData>
> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await connectDB();

    const boards = await DailyPrice.find({
      lastPublishedAt: { $ne: null },
      grades: { $elemMatch: { active: true, price: { $gt: 0 } } },
    })
      .select("clerkId buyerName district grades lastPublishedAt")
      .sort({ lastPublishedAt: -1 })
      .lean<LeanMarketBoard[]>();

    const viewer = await User.findOne({ clerkId: userId })
      .select("firstName lastName buyerName district")
      .lean<{
        firstName?: string;
        lastName?: string;
        buyerName?: string;
        district?: string;
      } | null>();

    const profiles = boards.length
      ? await User.find({
          clerkId: { $in: boards.map((board) => board.clerkId) },
          role: "buyer",
        })
          .select("clerkId buyerName district address phone")
          .lean<LeanBuyerProfile[]>()
      : [];

    const profileByClerkId = new Map(
      profiles.map((profile) => [profile.clerkId, profile]),
    );

    const buyers: MarketBuyer[] = [];

    for (const board of boards) {
      const profile = profileByClerkId.get(board.clerkId);

      // A board without a buyer profile behind it is stale — skip it
      if (!profile) continue;

      const live = (board.grades ?? []).filter(
        (entry) => entry.active && entry.price > 0,
      );

      if (live.length === 0) continue;

      const phone = profile.phone ?? null;

      buyers.push({
        id: board.clerkId,
        name: board.buyerName ?? profile.buyerName ?? "Cinnamon Buyer",
        district: board.district ?? profile.district ?? null,
        town: profile.address ?? null,
        phone,
        whatsapp: toWhatsAppNumber(phone),
        grades: live.map((entry) => entry.grade),
        prices: Object.fromEntries(
          live.map((entry) => [entry.grade, entry.price]),
        ),
        lastPublishedAt: board.lastPublishedAt
          ? board.lastPublishedAt.toISOString()
          : null,
      });
    }

    const viewerName =
      [viewer?.firstName, viewer?.lastName].filter(Boolean).join(" ") ||
      viewer?.buyerName ||
      null;

    return {
      success: true,
      data: {
        buyers,
        districts: [
          ...new Set(
            buyers
              .map((buyer) => buyer.district)
              .filter((district): district is string => Boolean(district)),
          ),
        ].sort((a, b) => a.localeCompare(b)),
        viewerName,
        viewerDistrict: viewer?.district ?? null,
      },
    };
  } catch (error) {
    console.error("Error loading market prices", error);
    return { success: false, error: "Failed to load buyer prices" };
  }
}

// Read the signed-in buyer's board; falls back to export-reference defaults
export async function getDailyPrices(): Promise<
  ActionResult<DailyPriceBoardData>
> {
  const resolved = await resolveBuyer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  try {
    const board = await DailyPrice.findOne({ clerkId: resolved.ctx.userId })
      .select("buyerName district grades lastPublishedAt")
      .lean<LeanBoard | null>();

    return { success: true, data: serializeBoard(board, resolved.ctx) };
  } catch (error) {
    console.error("Error loading daily prices", error);
    return { success: false, error: "Failed to load your price board" };
  }
}

// Publish today's rates. Missing grades keep their previously stored values.
export async function saveDailyPrices(
  input: DailyPriceInput[],
): Promise<ActionResult<DailyPriceBoardData>> {
  const resolved = await resolveBuyer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  if (!Array.isArray(input) || input.length === 0) {
    return { success: false, error: "No prices were submitted" };
  }

  const submitted = new Map<PriceGrade, GradeUpdate>();

  for (const entry of input) {
    if (!entry || !PRICE_GRADES.includes(entry.grade)) {
      return { success: false, error: "Unknown cinnamon grade submitted" };
    }

    if (submitted.has(entry.grade)) {
      return { success: false, error: `Duplicate entry for grade ${entry.grade}` };
    }

    const active = Boolean(entry.active);
    const price = Number(entry.price);

    if (!Number.isInteger(price) || price < 0) {
      return {
        success: false,
        error: `Enter a whole rupee amount for grade ${entry.grade}`,
      };
    }

    if (active && price <= 0) {
      return {
        success: false,
        error: `Enter a price above LKR 0 for grade ${entry.grade}`,
      };
    }

    if (price > MAX_PRICE_PER_KG) {
      return {
        success: false,
        error: `Price for grade ${entry.grade} cannot exceed LKR ${MAX_PRICE_PER_KG.toLocaleString()} per kg`,
      };
    }

    submitted.set(entry.grade, { price, active });
  }

  try {
    const existing = await DailyPrice.findOne({ clerkId: resolved.ctx.userId })
      .select("grades")
      .lean<LeanBoard | null>();

    return {
      success: true,
      data: await persistBoard(resolved.ctx, existing, submitted),
    };
  } catch (error) {
    console.error("Error saving daily prices", error);
    return { success: false, error: "Failed to publish your prices" };
  }
}

// Opening or closing a grade publishes on its own, without touching stored prices
export async function setGradeStatus(
  grade: PriceGrade,
  active: boolean,
): Promise<ActionResult<DailyPriceBoardData>> {
  const resolved = await resolveBuyer();

  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  if (!PRICE_GRADES.includes(grade)) {
    return { success: false, error: "Unknown cinnamon grade submitted" };
  }

  const nextActive = Boolean(active);

  try {
    const existing = await DailyPrice.findOne({ clerkId: resolved.ctx.userId })
      .select("grades")
      .lean<LeanBoard | null>();

    const stored = (existing?.grades ?? []).find(
      (entry) => entry.grade === grade,
    );
    const price = stored?.price ?? DEFAULT_GRADE_PRICES[grade];

    // A grade cannot go live without a published rate behind it
    if (nextActive && price <= 0) {
      return {
        success: false,
        error: `Enter a price for grade ${grade} and click Update Prices before opening it`,
      };
    }

    return {
      success: true,
      data: await persistBoard(
        resolved.ctx,
        existing,
        new Map([[grade, { active: nextActive }]]),
      ),
    };
  } catch (error) {
    console.error("Error updating grade status", error);
    return { success: false, error: `Failed to update grade ${grade}` };
  }
}
