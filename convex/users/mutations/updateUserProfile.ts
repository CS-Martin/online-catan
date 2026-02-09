import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateUserProfile = mutation({
  args: {
    clerkId: v.string(),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update user profile
    const updateData: any = {};
    if (args.displayName !== undefined) {
      updateData.displayName = args.displayName;
    }

    await ctx.db.patch(user._id, updateData);
    return user._id;
  },
});
