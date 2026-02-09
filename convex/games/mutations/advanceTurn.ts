import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const advanceTurn = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Get all players
    const allPlayers = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Calculate next player
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % allPlayers.length;

    // Update game state
    await ctx.db.patch(args.gameId, {
      currentPlayerIndex: nextPlayerIndex,
    });

    console.log("Advanced turn from", game.currentPlayerIndex, "to", nextPlayerIndex);
  },
});
