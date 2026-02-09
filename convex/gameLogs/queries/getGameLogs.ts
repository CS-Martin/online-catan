import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getGameLogs = query({
  args: {
    gameId: v.id("games"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("gameLogs")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});
