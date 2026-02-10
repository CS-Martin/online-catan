import { query } from "../_generated/server";
import { v } from "convex/values";

export const getGameLogs = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("gameLogs")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .collect();

    return logs;
  },
});
