import { defineTable } from "convex/server";
import { v } from "convex/values";

export const gameStatistics = defineTable({
  gameId: v.id("games"),
  totalTurns: v.number(),
  gameDuration: v.number(), // in seconds
  winnerIndex: v.number(),
  finalScores: v.array(v.object({
    playerIndex: v.number(),
    victoryPoints: v.number(),
    longestRoad: v.boolean(),
    largestArmy: v.boolean(),
    developmentCardsPlayed: v.number(),
    resourcesCollected: v.object({
      brick: v.number(),
      lumber: v.number(),
      ore: v.number(),
      grain: v.number(),
      wool: v.number(),
    }),
  })),
  resourceDistribution: v.object({
    totalBrick: v.number(),
    totalLumber: v.number(),
    totalOre: v.number(),
    totalGrain: v.number(),
    totalWool: v.number(),
  }),
  diceRolls: v.array(v.number()), // All dice rolls during game
  robberMoves: v.number(), // Total times robber was moved
  totalTrades: v.number(), // Total trades made
  longestRoadLength: v.number(), // Longest road achieved
  mostCardsInHand: v.number(), // Most cards any player held
  sevenRolledCount: v.number(), // How many times 7 was rolled
})
  .index("by_gameId", ["gameId"])
  .index("by_gameDuration", ["gameDuration"])
  .index("by_totalTurns", ["totalTurns"]);
