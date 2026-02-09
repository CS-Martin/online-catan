import { Infer, v } from "convex/values";
import { MutationCtx } from "../../_generated/server";

export const userDeletedArgs = v.object({
  clerkUserId: v.string(),
});

export const userDeletedHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof userDeletedArgs>,
) => {
  const { clerkUserId } = args;

  try {
    // Find user first
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkUserId))
      .first();

    if (!existingUser) {
      console.log("User not found for deletion:", clerkUserId);
      return null;
    }

    const userId = existingUser._id;
    console.log("Starting cascade deletion for user:", userId);

    await ctx.db.delete(userId);
    console.log("Successfully deleted user and all related data:", userId);

    return userId;
  } catch (error) {
    console.error("Error during cascade user deletion:", error);
    throw error;
  }
};
