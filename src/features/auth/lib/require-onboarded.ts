import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export async function requireOnboarded() {
  // Get current session user from Clerk
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user from DB
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const user = await convex.query(api.users.api.getUserByClerkId, {
    clerkId: userId,
  });

  // Check if user exists
  if (!user) {
    redirect("/onboarding");
  }

  // User is onboarded
  return user;
}
