import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const moveRobber = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    hexId: v.number(),
    targetPlayerIndex: v.optional(v.number()), // Player to steal from
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Validate it's the player's turn
    if (game.currentPlayerIndex !== args.playerIndex) {
      throw new Error("Not your turn");
    }

    // Validate game phase
    if (game.phase !== "robber_move") {
      throw new Error("Cannot move robber in current phase");
    }

    // Validate hex exists
    const targetHex = game.board.hexes.find((hex) => hex.id === args.hexId);
    if (!targetHex) {
      throw new Error("Hex not found");
    }

    // Find current robber position
    const currentRobberHex = game.board.hexes.find((hex) => hex.hasRobber);
    if (!currentRobberHex) {
      throw new Error("Robber position not found");
    }

    // Cannot move robber to same hex
    if (currentRobberHex.id === args.hexId) {
      throw new Error("Cannot move robber to same position");
    }

    // Update board - move robber
    const newBoard = { ...game.board };
    const oldHex = newBoard.hexes.find((hex) => hex.id === currentRobberHex.id);
    const newHex = newBoard.hexes.find((hex) => hex.id === args.hexId);
    
    if (oldHex) oldHex.hasRobber = false;
    if (newHex) newHex.hasRobber = true;

    // Update game
    await ctx.db.patch(args.gameId, { 
      board: newBoard,
      phase: "robber_steal"
    });

    // Record robber movement
    await ctx.db.insert("robberPositions", {
      gameId: args.gameId,
      hexId: args.hexId,
      movedByPlayerIndex: args.playerIndex,
      movedAtTurn: game.turnNumber,
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "move_robber",
      details: { fromHex: currentRobberHex.id, toHex: args.hexId },
      timestamp: Date.now(),
    });

    return args.hexId;
  },
});
