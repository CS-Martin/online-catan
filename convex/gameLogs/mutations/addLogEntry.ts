import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const addLogEntry = mutation({
  args: {
    gameId: v.id("games"),
    turnNumber: v.number(),
    playerIndex: v.number(),
    action: v.string(),
    details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Validate game exists
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Add log entry
    const logId = await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: args.turnNumber,
      playerIndex: args.playerIndex,
      action: args.action,
      details: args.details,
      timestamp: Date.now(),
    });

    return logId;
  },
});
