import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getGamePlayers = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Sort by playerIndex
    return players.sort((a, b) => a.playerIndex - b.playerIndex);
  },
});
