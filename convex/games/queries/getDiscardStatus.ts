import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getDiscardStatus = query({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Get player
    const player = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId_and_playerIndex", (q) => 
        q.eq("gameId", args.gameId).eq("playerIndex", args.playerIndex)
      )
      .first();
    
    if (!player) {
      return null;
    }

    const totalCards = Object.values(player.resources).reduce((sum, count) => sum + count, 0);
    const needsToDiscard = totalCards > 7;
    const discardCount = needsToDiscard ? Math.floor(totalCards / 2) : 0;

    return {
      playerIndex: player.playerIndex,
      displayName: player.displayName,
      resources: player.resources,
      totalCards,
      needsToDiscard,
      discardCount,
    };
  },
});
