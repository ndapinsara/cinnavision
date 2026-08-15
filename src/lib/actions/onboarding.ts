"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
type Roles = "farmer" | "buyer";

export interface OnboardingPayload {
  role: Roles;
  district?: string;
  nic?: string;
  phone?: string;
  buyerName?: string;
  address?: string;
}

export async function saveOnboarding(
  data: OnboardingPayload,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const { role, district, nic, phone, buyerName, address } = data ?? {};

  if (!role || !["farmer", "buyer"].includes(role)) {
    return { success: false, error: "Invalid role" };
  }

  const updates: Record<string, unknown> = {
    role,
    onboardingCompleted: true,
  };

  if (role === "farmer") {
    if (!district || !nic || !phone) {
      return { success: false, error: "District, NIC, and phone are required" };
    }
    updates.district = district;
    updates.nic = nic;
    updates.phone = phone;
  }

  if (role === "buyer") {
    if (!district || !buyerName || !address || !phone) {
      return { success: false, error: "All mill fields are required" };
    }
    updates.district = district;
    updates.buyerName = buyerName;
    updates.address = address;
    updates.phone = phone;
  }

  try {
    await connectDB();

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role, onboardingComplete: true },
    });

    const clerkProfile = await currentUser();
    const email =
      clerkProfile?.primaryEmailAddress?.emailAddress ||
      clerkProfile?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return {
        success: false,
        error: "Unable to read email from Clerk profile",
      };
    }

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: updates,
        $setOnInsert: {
          clerkId: userId,
          email,
          firstName: clerkProfile?.firstName,
          lastName: clerkProfile?.lastName,
          imageUrl: clerkProfile?.imageUrl,
        },
      },
      { new: true, upsert: true },
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving onboarding data", error);
    return { success: false, error: "Failed to save onboarding data" };
  }
}
