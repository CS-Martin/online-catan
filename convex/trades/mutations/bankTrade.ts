import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const bankTrade = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    giving: v.union(
      v.literal("brick"),
      v.literal("lumber"),
      v.literal("ore"),
      v.literal("grain"),
      v.literal("wool")
    ),
    receiving: v.union(
      v.literal("brick"),
      v.literal("lumber"),
      v.literal("ore"),
      v.literal("grain"),
      v.literal("wool")
    ),
    amount: v.number(), // How many of giving resource (4:1 default, 3:1 with port, 2:1 with specific port)
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Get player
    const player = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId_and_playerIndex", (q: any) => 
        q.eq("gameId", args.gameId).eq("playerIndex", args.playerIndex)
      )
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    // Validate game phase
    if (game.phase !== "trade_build") {
      throw new Error("Cannot trade in current phase");
    }

    // Validate trade
    if (args.giving === args.receiving) {
      throw new Error("Cannot trade same resource");
    }

    // Calculate trade ratio (simplified - 4:1 default)
    const tradeRatio = 4; // Could be enhanced with port checking
    const requiredAmount = args.amount * tradeRatio;

    // Check if player has enough resources
    if (player.resources[args.giving as keyof typeof player.resources] < requiredAmount) {
      throw new Error("Not enough resources for trade");
    }

    // Execute trade
    const newResources = { ...player.resources };
    newResources[args.giving as keyof typeof newResources] -= requiredAmount;
    newResources[args.receiving as keyof typeof newResources] += args.amount;

    // Update player
    await ctx.db.patch(player._id, { resources: newResources });

    // Record trade
    await ctx.db.insert("bankTrades", {
      gameId: args.gameId,
      playerIndex: args.playerIndex,
      giving: args.giving,
      receiving: args.receiving,
      tradeRatio,
      turnNumber: game.turnNumber,
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "bank_trade",
      details: { 
        giving: args.giving, 
        receiving: args.receiving, 
        amount: args.amount,
        ratio: tradeRatio
      },
      timestamp: Date.now(),
    });

    return newResources;
  },
});
