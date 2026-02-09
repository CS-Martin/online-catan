import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const deleteGame = mutation({
  args: {
    clerkId: v.string(),
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Get the lobby to check if user is the host
    const lobby = await ctx.db.get(game.lobbyId);
    if (!lobby) {
      throw new Error("Associated lobby not found");
    }

    // Check if user is the host (only host can delete the game)
    if (lobby.hostId !== user._id) {
      throw new Error("Only the host can delete the game");
    }

    // Delete all players in the game (cascade delete)
    const players = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    console.log(
      `Deleting ${players.length} players from game ${args.gameId}`,
    );

    // Delete all players first (cascade)
    for (const player of players) {
      await ctx.db.delete(player._id);
    }

    // Verify all players are deleted before deleting game
    const remainingPlayers = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    if (remainingPlayers.length > 0) {
      throw new Error("Failed to delete all players from game");
    }

    // Delete related game data
    // Delete trade offers
    const tradeOffers = await ctx.db
      .query("tradeOffers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    for (const tradeOffer of tradeOffers) {
      await ctx.db.delete(tradeOffer._id);
    }

    // Delete bank trades
    const bankTrades = await ctx.db
      .query("bankTrades")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    for (const bankTrade of bankTrades) {
      await ctx.db.delete(bankTrade._id);
    }

    // Delete robber positions
    const robberPositions = await ctx.db
      .query("robberPositions")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    for (const robberPosition of robberPositions) {
      await ctx.db.delete(robberPosition._id);
    }

    // Delete game logs
    const gameLogs = await ctx.db
      .query("gameLogs")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    for (const gameLog of gameLogs) {
      await ctx.db.delete(gameLog._id);
    }

    // Delete game statistics
    const gameStatistics = await ctx.db
      .query("gameStatistics")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    for (const gameStatistic of gameStatistics) {
      await ctx.db.delete(gameStatistic._id);
    }

    // Now safely delete the game
    await ctx.db.delete(args.gameId);

    // Update the lobby to remove gameId reference
    await ctx.db.patch(lobby._id, {
      gameId: undefined,
      status: "waiting", // Reset lobby status
    });

    console.log(
      `Successfully deleted game ${args.gameId}, ${players.length} players, and related game data`,
    );

    return {
      deletedGame: args.gameId,
      deletedPlayers: players.length,
      deletedTradeOffers: tradeOffers.length,
      deletedBankTrades: bankTrades.length,
      deletedRobberPositions: robberPositions.length,
      deletedGameLogs: gameLogs.length,
      deletedGameStatistics: gameStatistics.length,
    };
  },
});
