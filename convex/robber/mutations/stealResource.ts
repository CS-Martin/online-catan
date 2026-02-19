import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const stealResource = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    targetPlayerIndex: v.number(),
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
    if (game.phase !== "robber_steal") {
      throw new Error("Cannot steal in current phase");
    }

    // Get players
    const players = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    const stealingPlayer = players.find(
      (p) => p.playerIndex === args.playerIndex,
    );
    const targetPlayer = players.find(
      (p) => p.playerIndex === args.targetPlayerIndex,
    );

    if (!stealingPlayer || !targetPlayer) {
      throw new Error("Player not found");
    }

    // Get robber position
    const robberHex = game.board.hexes.find((hex) => hex.hasRobber);
    if (!robberHex) {
      throw new Error("Robber position not found");
    }

    // Check if target player has settlement/city adjacent to robber
    const hasAdjacentBuilding = game.board.vertices.some((vertex) => {
      if (!vertex.building || vertex.ownerId !== args.targetPlayerIndex) {
        return false;
      }
      return vertex.adjacentHexes.includes(robberHex.id);
    });

    if (!hasAdjacentBuilding) {
      throw new Error("Target player has no buildings adjacent to robber");
    }

    // Check if target player has resources
    const totalResources = Object.values(targetPlayer.resources).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (totalResources === 0) {
      throw new Error("Target player has no resources to steal");
    }

    // Get all resource types the target player has
    const availableResources = (
      Object.entries(targetPlayer.resources) as [
        keyof typeof targetPlayer.resources,
        number,
      ][]
    )
      .filter(([_, count]) => count > 0)
      .map(([resource]) => resource);

    if (availableResources.length === 0) {
      throw new Error("Target player has no resources to steal");
    }

    // Randomly select a resource to steal
    const stolenResource =
      availableResources[Math.floor(Math.random() * availableResources.length)];

    // Update players' resources
    const updatedStealingPlayer = { ...stealingPlayer };
    const updatedTargetPlayer = { ...targetPlayer };

    updatedStealingPlayer.resources[stolenResource] += 1;
    updatedTargetPlayer.resources[stolenResource] -= 1;

    // Update database
    await ctx.db.patch(stealingPlayer._id, {
      resources: updatedStealingPlayer.resources,
    });

    await ctx.db.patch(targetPlayer._id, {
      resources: updatedTargetPlayer.resources,
    });

    // Advance to trade_build phase
    await ctx.db.patch(args.gameId, {
      phase: "trade_build",
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "steal_resource",
      details: {
        targetPlayerIndex: args.targetPlayerIndex, // Fixed: use targetPlayerIndex instead of targetPlayer
        stolenResource,
        robberHex: robberHex.id,
      },
      timestamp: Date.now(),
    });

    return {
      stolenResource,
      fromPlayer: args.targetPlayerIndex,
      toPlayer: args.playerIndex,
    };
  },
});

export const skipStealing = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
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
    if (game.phase !== "robber_steal") {
      throw new Error("Cannot skip stealing in current phase");
    }

    // Get robber position
    const robberHex = game.board.hexes.find((hex) => hex.hasRobber);
    if (!robberHex) {
      throw new Error("Robber position not found");
    }

    // Check if there are any players with buildings adjacent to robber
    const players = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    const adjacentPlayers = players.filter((player) => {
      if (player.playerIndex === args.playerIndex) return false; // Skip self

      return game.board.vertices.some((vertex) => {
        if (!vertex.building || vertex.ownerId !== player.playerIndex) {
          return false;
        }
        return vertex.adjacentHexes.includes(robberHex.id);
      });
    });

    // Only allow skipping if no adjacent players or no one has resources
    const playersWithResources = adjacentPlayers.filter((player) => {
      const totalResources = Object.values(player.resources).reduce(
        (sum, count) => sum + count,
        0,
      );
      return totalResources > 0;
    });

    if (playersWithResources.length > 0) {
      throw new Error(
        "Cannot skip stealing when there are players with resources to steal from",
      );
    }

    // Advance to trade_build phase
    await ctx.db.patch(args.gameId, {
      phase: "trade_build",
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "skip_stealing",
      details: {
        reason: "no_players_with_resources",
        robberHex: robberHex.id,
      },
      timestamp: Date.now(),
    });

    return { skipped: true };
  },
});
