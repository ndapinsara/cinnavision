import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export type UserRole = "farmer" | "buyer";

// Get current user's district from User schema (for pricing region etc.)
export async function getCurrentUserDistrict(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  try {
    await connectDB();
    const user = await User.findOne({ clerkId: userId })
      .select("district")
      .lean();
    return user?.district ?? null;
  } catch {
    return null;
  }
}

// Get the current user's role from Clerk public metadata
export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Check public metadata for role
  const role = user.publicMetadata?.role as string;

  return role === "farmer" || role === "buyer" ? role : null;
}

// Get user data with role
export async function getCurrentUserWithRole() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const role = await getUserRole();
  let buyerName: string | undefined;

  if (role === "buyer") {
    try {
      await connectDB();
      const dbUser = await User.findOne({ clerkId: user.id })
        .select("buyerName")
        .lean<{ buyerName?: string } | null>();
      buyerName = dbUser?.buyerName;
    } catch {
      buyerName = undefined;
    }
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role,
    buyerName,
  };
}

// Require authentication, redirect to sign-in if not authenticated
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}
