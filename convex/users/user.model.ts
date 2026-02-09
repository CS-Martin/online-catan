import { defineTable } from "convex/server";
import { v } from "convex/values";

export const users = defineTable({
  clerkId: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  imageUrl: v.optional(v.string()),
  phone: v.optional(v.string()),
  // Game-specific fields
  displayName: v.optional(v.string()),
  gamesPlayed: v.optional(v.number()),
  gamesWon: v.optional(v.number()),
  elo: v.optional(v.number()),
  // Fun statistics
  hoursPlayed: v.optional(v.number()), // Total hours played
  totalTurnsPlayed: v.optional(v.number()), // Total turns across all games
  totalResourcesCollected: v.optional(
    v.object({
      brick: v.number(),
      lumber: v.number(),
      ore: v.number(),
      grain: v.number(),
      wool: v.number(),
    }),
  ),
  totalBuildings: v.optional(
    v.object({
      settlements: v.number(),
      cities: v.number(),
      roads: v.number(),
    }),
  ),
  totalTrades: v.optional(v.number()), // Total trades made
  totalRobberMoves: v.optional(v.number()), // Times moved robber
  longestRoadEver: v.optional(v.number()), // Longest road ever achieved
  biggestComeback: v.optional(v.number()), // Biggest VP deficit overcome to win
  fastestWin: v.optional(v.number()), // Fastest win in minutes
  highestDiceRollStreak: v.optional(v.number()), // Consecutive rolls of 6+
  favoriteResource: v.optional(
    v.union(
      v.literal("brick"),
      v.literal("lumber"),
      v.literal("ore"),
      v.literal("grain"),
      v.literal("wool"),
    ),
  ),
  playStyle: v.optional(
    v.union(
      v.literal("aggressive"), // Lots of robber moves, blocking
      v.literal("trader"), // High trade count
      v.literal("builder"), // High building count
      v.literal("strategic"), // Balanced play
    ),
  ),
  achievements: v.optional(v.array(v.string())), // Achievement names
  currentStreak: v.optional(
    v.object({
      wins: v.number(),
      losses: v.number(),
      type: v.union(v.literal("wins"), v.literal("losses")),
    }),
  ),
  bestGame: v.optional(
    v.object({
      gameId: v.id("games"),
      victoryPoints: v.number(),
      duration: v.number(), // in minutes
      date: v.number(), // timestamp
    }),
  ),
  // Performance metrics
  averageGameDuration: v.optional(v.number()), // Average game length in minutes
  winRateByPlayerCount: v.optional(
    v.object({
      twoPlayers: v.number(),
      threePlayers: v.number(),
      fourPlayers: v.number(),
    }),
  ),
  preferredColor: v.optional(
    v.union(
      v.literal("red"),
      v.literal("blue"),
      v.literal("white"),
      v.literal("orange"),
    ),
  ),
  lastPlayedAt: v.optional(v.number()), // Last game timestamp
  level: v.optional(v.number()), // User level based on XP
  experiencePoints: v.optional(v.number()), // XP earned
})
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_displayName", ["displayName"])
  .index("by_elo", ["elo"])
  .index("by_hoursPlayed", ["hoursPlayed"])
  .index("by_gamesWon", ["gamesWon"])
  .index("by_lastPlayedAt", ["lastPlayedAt"]);
