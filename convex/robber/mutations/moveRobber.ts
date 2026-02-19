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
      // Debug: Log all hex resources
      console.log("All hex resources:", game.board.hexes.map(h => ({ id: h.id, resource: h.resource, hasRobber: h.hasRobber })));
      
      // Robber not initialized - find the desert hex and place robber there
      const desertHex = game.board.hexes.find((hex) => hex.resource === "desert");
      if (!desertHex) {
        // If no desert, try to find any hex without a number token (should be desert)
        const anyDesertLikeHex = game.board.hexes.find((hex) => !hex.numberToken);
        if (!anyDesertLikeHex) {
          throw new Error("No desert hex found for robber initialization and no hex without number token");
        }
        
        // Use this hex as desert equivalent - place robber there first, then move to target
        const newBoard = { ...game.board };
        const sourceHex = newBoard.hexes.find((hex) => hex.id === anyDesertLikeHex.id);
        const destHex = newBoard.hexes.find((hex) => hex.id === args.hexId);
        
        if (sourceHex) {
          sourceHex.hasRobber = true;
          sourceHex.resource = "desert"; // Fix the resource type if needed
        }
        
        // Now proceed with the move
        if (anyDesertLikeHex.id === args.hexId) {
          throw new Error("Cannot move robber to same position");
        }
        
        if (sourceHex && destHex) {
          sourceHex.hasRobber = false;
          destHex.hasRobber = true;
        }
        
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
          details: { fromHex: anyDesertLikeHex.id, toHex: args.hexId },
          timestamp: Date.now(),
        });

        return args.hexId;
      }
      
      // Initialize robber on desert hex and move to target
      const newBoard = { ...game.board };
      const desert = newBoard.hexes.find((hex) => hex.id === desertHex.id);
      const finalTarget = newBoard.hexes.find((hex) => hex.id === args.hexId);
      
      if (desert) {
        desert.hasRobber = true;
      }
      
      // If trying to move to the same desert hex, that's not allowed
      if (desertHex.id === args.hexId) {
        throw new Error("Cannot move robber to same position");
      }
      
      // Move robber from desert to target
      if (desert && finalTarget) {
        desert.hasRobber = false;
        finalTarget.hasRobber = true;
      }
      
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
        details: { fromHex: desertHex.id, toHex: args.hexId },
        timestamp: Date.now(),
      });

      return args.hexId;
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
