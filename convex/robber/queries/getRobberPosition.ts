import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getRobberPosition = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      return null;
    }

    // Find robber position
    const robberHex = game.board.hexes.find((hex) => hex.hasRobber);
    
    if (!robberHex) {
      return null;
    }

    // Get robber movement history
    const movementHistory = await ctx.db
      .query("robberPositions")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(10);

    return {
      currentHex: robberHex,
      movementHistory,
    };
  },
});
