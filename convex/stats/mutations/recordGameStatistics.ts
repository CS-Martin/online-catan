import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const recordGameStatistics = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Get all game players
    const players = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId))
      .collect();

    // Get game logs
    const logs = await ctx.db
      .query("gameLogs")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId))
      .collect();

    // Get all trades
    const trades = await ctx.db
      .query("tradeOffers")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId))
      .collect();

    const bankTrades = await ctx.db
      .query("bankTrades")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId))
      .collect();

    // Calculate statistics
    const totalTurns = game.turnNumber;
    const gameDuration = Date.now() - game._creationTime; // in seconds
    const winnerIndex = players.findIndex(p => p.playerIndex === game.currentPlayerIndex);
    
    // Calculate final scores
    const finalScores = players.map(player => ({
      playerIndex: player.playerIndex,
      victoryPoints: player.victoryPoints,
      longestRoad: player.hasLongestRoad,
      largestArmy: false, // TODO: Implement largest army tracking
      developmentCardsPlayed: 0, // TODO: Implement dev card tracking
      resourcesCollected: player.resources,
    }));

    // Calculate resource distribution
    const resourceDistribution = {
      totalBrick: players.reduce((sum, p) => sum + p.resources.brick, 0),
      totalLumber: players.reduce((sum, p) => sum + p.resources.lumber, 0),
      totalOre: players.reduce((sum, p) => sum + p.resources.ore, 0),
      totalGrain: players.reduce((sum, p) => sum + p.resources.grain, 0),
      totalWool: players.reduce((sum, p) => sum + p.resources.wool, 0),
    };

    // Extract dice rolls from logs
    const diceRolls = logs
      .filter(log => log.action === "roll_dice")
      .map(log => {
        const details = log.details as any;
        return details?.total || 0;
      })
      .filter(roll => roll > 0);

    // Calculate robber moves
    const robberMoves = logs.filter(log => log.action === "move_robber").length;

    // Calculate total trades
    const totalTrades = trades.length + bankTrades.length;

    // Calculate longest road length
    const longestRoadLength = Math.max(...players.map(p => p.longestRoadLength));

    // Calculate most cards in hand (simplified)
    const mostCardsInHand = Math.max(...players.map(p => 
      Object.values(p.resources).reduce((sum, count) => sum + count, 0)
    ));

    // Count 7s rolled
    const sevenRolledCount = diceRolls.filter(roll => roll === 7).length;

    // Create game statistics record
    const statsId = await ctx.db.insert("gameStatistics", {
      gameId: args.gameId,
      totalTurns,
      gameDuration,
      winnerIndex,
      finalScores,
      resourceDistribution,
      diceRolls,
      robberMoves,
      totalTrades,
      longestRoadLength,
      mostCardsInHand,
      sevenRolledCount,
    });

    // Update user statistics for all human players
    for (const player of players) {
      if (!player.isAI && player.userId) {
        await updateUserStatistics(ctx, player.userId, {
          gameDuration,
          totalTurns,
          isWinner: player.playerIndex === winnerIndex,
          resources: player.resources,
          buildings: {
            settlements: player.settlementsBuilt,
            cities: player.citiesBuilt,
            roads: player.roadsBuilt,
          },
          trades: bankTrades.filter(t => t.playerIndex === player.playerIndex).length,
          robberMoves: logs.filter(log => 
            log.action === "move_robber" && log.playerIndex === player.playerIndex
          ).length,
          longestRoad: player.longestRoadLength,
        });
      }
    }

    return statsId;
  },
});

async function updateUserStatistics(ctx: any, userId: string, stats: {
  gameDuration: number;
  totalTurns: number;
  isWinner: boolean;
  resources: any;
  buildings: any;
  trades: number;
  robberMoves: number;
  longestRoad: number;
}) {
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user) return;

  // Update user statistics
  const updates: any = {
    hoursPlayed: (user.hoursPlayed || 0) + (stats.gameDuration / 3600), // Convert to hours
    totalTurnsPlayed: (user.totalTurnsPlayed || 0) + stats.totalTurns,
    gamesPlayed: (user.gamesPlayed || 0) + 1,
    gamesWon: (user.gamesWon || 0) + (stats.isWinner ? 1 : 0),
    totalTrades: (user.totalTrades || 0) + stats.trades,
    totalRobberMoves: (user.totalRobberMoves || 0) + stats.robberMoves,
    lastPlayedAt: Date.now(),
  };

  // Update resources collected
  if (user.totalResourcesCollected) {
    updates.totalResourcesCollected = {
      brick: user.totalResourcesCollected.brick + stats.resources.brick,
      lumber: user.totalResourcesCollected.lumber + stats.resources.lumber,
      ore: user.totalResourcesCollected.ore + stats.resources.ore,
      grain: user.totalResourcesCollected.grain + stats.resources.grain,
      wool: user.totalResourcesCollected.wool + stats.resources.wool,
    };
  }

  // Update buildings
  if (user.totalBuildings) {
    updates.totalBuildings = {
      settlements: user.totalBuildings.settlements + stats.buildings.settlements,
      cities: user.totalBuildings.cities + stats.buildings.cities,
      roads: user.totalBuildings.roads + stats.buildings.roads,
    };
  }

  // Update longest road ever
  if (!user.longestRoadEver || stats.longestRoad > user.longestRoadEver) {
    updates.longestRoadEver = stats.longestRoad;
  }

  // Update fastest win
  if (stats.isWinner) {
    const gameDurationMinutes = stats.gameDuration / 60;
    if (!user.fastestWin || gameDurationMinutes < user.fastestWin) {
      updates.fastestWin = gameDurationMinutes;
    }
  }

  // Update average game duration
  const avgDuration = ((user.averageGameDuration || 0) * (user.gamesPlayed || 0) + (stats.gameDuration / 60)) / ((user.gamesPlayed || 0) + 1);
  updates.averageGameDuration = avgDuration;

  // Update ELO (simplified)
  const eloChange = stats.isWinner ? 25 : -15;
  updates.elo = (user.elo || 1000) + eloChange;

  // Update experience points
  const xpGained = stats.totalTurns * 10 + (stats.isWinner ? 100 : 50);
  updates.experiencePoints = (user.experiencePoints || 0) + xpGained;

  // Update level (100 XP per level)
  updates.level = Math.floor((updates.experiencePoints || 0) / 100);

  await ctx.db.patch(userId, updates);
}
