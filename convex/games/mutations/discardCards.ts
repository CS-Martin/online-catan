import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const discardCards = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    discards: v.object({
      brick: v.number(),
      lumber: v.number(),
      ore: v.number(),
      grain: v.number(),
      wool: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Validate game phase
    if (game.phase !== "discard") {
      throw new Error("Cannot discard cards in current phase");
    }

    // Get player
    const player = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId_and_playerIndex", (q) =>
        q.eq("gameId", args.gameId).eq("playerIndex", args.playerIndex),
      )
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    // Calculate total cards before and after discard
    const totalCardsBefore = Object.values(player.resources).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalDiscarded = Object.values(args.discards).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalCardsAfter = totalCardsBefore - totalDiscarded;

    // Validate player has enough cards to discard
    for (const [resource, discardCount] of Object.entries(args.discards)) {
      if (discardCount < 0) {
        throw new Error("Cannot discard negative cards");
      }
      if (
        discardCount >
        player.resources[resource as keyof typeof player.resources]
      ) {
        throw new Error(`Cannot discard more ${resource} cards than you have`);
      }
    }

    // Validate discard count is exactly half (rounding down)
    const expectedDiscard = Math.floor(totalCardsBefore / 2);
    if (totalDiscarded !== expectedDiscard) {
      throw new Error(`Must discard exactly ${expectedDiscard} cards`);
    }

    // Update player's resources
    const newResources = { ...player.resources };
    for (const [resource, discardCount] of Object.entries(args.discards)) {
      newResources[resource as keyof typeof newResources] -= discardCount;
    }

    await ctx.db.patch(player._id, { resources: newResources });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "discard_cards",
      details: { discarded: args.discards, remaining: newResources },
      timestamp: Date.now(),
    });

    // Check if all players who need to discard have done so
    const allPlayers = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    const playersNeedingDiscard = allPlayers.filter((p) => {
      const totalCards = Object.values(p.resources).reduce(
        (sum, count) => sum + count,
        0,
      );
      return totalCards > 7;
    });

    // Check if all required discards are complete
    const allDiscardsComplete = playersNeedingDiscard.every((p) => {
      const totalCards = Object.values(p.resources).reduce(
        (sum, count) => sum + count,
        0,
      );
      return totalCards <= 7;
    });

    // If all discards are complete, move to robber phase
    if (allDiscardsComplete) {
      await ctx.db.patch(args.gameId, { phase: "robber_move" });
    }

    return { discarded: args.discards, remaining: newResources };
  },
});

export const skipDiscard = mutation({
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

    // Validate game phase - allow skip if phase has already advanced to robber_move
    // This handles the race condition where phase advances while player is clicking Continue
    if (game.phase !== "discard" && game.phase !== "robber_move") {
      throw new Error("Cannot skip discard in current phase");
    }

    // If phase is already robber_move, just return success (player already handled)
    if (game.phase === "robber_move") {
      return { skipped: true, alreadyAdvanced: true };
    }

    // Get player
    const player = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId_and_playerIndex", (q) =>
        q.eq("gameId", args.gameId).eq("playerIndex", args.playerIndex),
      )
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    // Check if player has 7 or fewer cards (can skip discard)
    const totalCards = Object.values(player.resources).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (totalCards > 7) {
      throw new Error("Must discard cards when you have more than 7");
    }

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "skip_discard",
      details: { totalCards },
      timestamp: Date.now(),
    });

    // Check if all players who need to discard have done so
    const allPlayers = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    const playersNeedingDiscard = allPlayers.filter((p) => {
      const totalCards = Object.values(p.resources).reduce(
        (sum, count) => sum + count,
        0,
      );
      return totalCards > 7;
    });

    // Check if all required discards are complete
    const allDiscardsComplete = playersNeedingDiscard.every((p) => {
      const totalCards = Object.values(p.resources).reduce(
        (sum, count) => sum + count,
        0,
      );
      return totalCards <= 7;
    });

    // If all discards are complete, move to robber phase
    if (allDiscardsComplete) {
      await ctx.db.patch(args.gameId, { phase: "robber_move" });
    }

    return { skipped: true };
  },
});
