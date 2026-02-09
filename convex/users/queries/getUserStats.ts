import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getUserStats = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    return {
      gamesPlayed: user.gamesPlayed || 0,
      gamesWon: user.gamesWon || 0,
      elo: user.elo || 1000,
      winRate:
        (user.gamesPlayed || 0) > 0
          ? (user.gamesWon || 0) / (user.gamesPlayed || 0)
          : 0,
    };
  },
});
