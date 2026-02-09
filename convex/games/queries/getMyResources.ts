import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getMyResources = query({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId_and_playerIndex", (q) => 
        q.eq("gameId", args.gameId).eq("playerIndex", args.playerIndex)
      )
      .first();

    if (!player) {
      return null;
    }

    return player.resources;
  },
});
