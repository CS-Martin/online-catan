import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getPlayersNeedingDiscard = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    // Get all players in the game
    const players = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Filter players who have more than 7 cards
    const playersNeedingDiscard = players.filter(player => {
      const totalCards = Object.values(player.resources).reduce((sum, count) => sum + count, 0);
      return totalCards > 7;
    });

    // Return player info with discard requirements
    return playersNeedingDiscard.map(player => {
      const totalCards = Object.values(player.resources).reduce((sum, count) => sum + count, 0);
      const discardCount = Math.floor(totalCards / 2);
      
      return {
        playerIndex: player.playerIndex,
        displayName: player.displayName,
        resources: player.resources,
        totalCards,
        discardCount,
      };
    });
  },
});

