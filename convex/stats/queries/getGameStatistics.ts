import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getGameStatistics = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("gameStatistics")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId))
      .first();

    return stats;
  },
});
