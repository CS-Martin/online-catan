import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const endTurn = mutation({
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

    // Validate it's the player's turn
    if (game.currentPlayerIndex !== args.playerIndex) {
      throw new Error("Not your turn");
    }

    // Validate game phase
    if (game.phase !== "trade_build") {
      throw new Error("Cannot end turn in current phase");
    }

    // Get all players
    const players = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId))
      .collect();

    // Calculate next player
    const nextPlayerIndex = (args.playerIndex + 1) % players.length;
    const nextTurnNumber = game.turnNumber + (nextPlayerIndex === 0 ? 1 : 0);

    // Update game state
    await ctx.db.patch(args.gameId, {
      currentPlayerIndex: nextPlayerIndex,
      turnNumber: nextTurnNumber,
      phase: "roll_dice",
      diceRoll: undefined, // Clear previous dice roll
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "end_turn",
      details: { nextPlayer: nextPlayerIndex },
      timestamp: Date.now(),
    });

    // Check for win condition
    await checkWinCondition(ctx, args.gameId);

    return nextPlayerIndex;
  },
});

async function checkWinCondition(ctx: any, gameId: string) {
  // Get all players
  const players = await ctx.db
    .query("gamePlayers")
    .withIndex("by_gameId", (q: any) => q.eq("gameId", gameId))
    .collect();

  // Check if any player has 10+ victory points
  for (const player of players) {
    let totalVP = player.victoryPoints;

    // Add longest road bonus
    if (player.hasLongestRoad) {
      totalVP += 2;
    }

    if (totalVP >= 10) {
      // Game over!
      await ctx.db.patch(gameId, {
        status: "finished",
        winnerId: player.userId,
        phase: "game_over",
      });

      // Update game statistics for human players
      for (const p of players) {
        if (!p.isAI && p.userId) {
          await ctx.runMutation("api.users.updateGameStats", {
            clerkId: p.userId, // This would need to be converted from userId to clerkId
            gamesPlayed: 1,
            gamesWon: p.playerIndex === player.playerIndex ? 1 : 0,
          });
        }
      }

      // Log game end
      await ctx.db.insert("gameLogs", {
        gameId,
        turnNumber: players.length, // Approximate
        playerIndex: player.playerIndex,
        action: "game_over",
        details: { winner: player.displayName, victoryPoints: totalVP },
        timestamp: Date.now(),
      });

      break;
    }
  }
}
