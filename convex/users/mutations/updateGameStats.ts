import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateGameStats = mutation({
  args: {
    clerkId: v.string(),
    gamesPlayed: v.optional(v.number()),
    gamesWon: v.optional(v.number()),
    elo: v.optional(v.number()),
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

    // Update game statistics
    const updateData: any = {};
    if (args.gamesPlayed !== undefined) {
      updateData.gamesPlayed = args.gamesPlayed;
    }
    if (args.gamesWon !== undefined) {
      updateData.gamesWon = args.gamesWon;
    }
    if (args.elo !== undefined) {
      updateData.elo = args.elo;
    }

    await ctx.db.patch(user._id, updateData);
    return user._id;
  },
});
