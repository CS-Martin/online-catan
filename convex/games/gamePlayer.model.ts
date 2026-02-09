import { defineTable } from "convex/server";
import { v } from "convex/values";

export const gamePlayers = defineTable({
  gameId: v.id("games"),
  userId: v.optional(v.id("users")),
  playerIndex: v.number(), // 0–3, determines turn order
  isAI: v.boolean(),
  aiDifficulty: v.optional(
    v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))
  ),
  color: v.union(
    v.literal("red"),
    v.literal("blue"),
    v.literal("white"),
    v.literal("orange")
  ),
  displayName: v.string(),
  resources: v.object({
    brick: v.number(),
    lumber: v.number(),
    ore: v.number(),
    grain: v.number(),
    wool: v.number(),
  }),
  victoryPoints: v.number(),
  roadsBuilt: v.number(),
  settlementsBuilt: v.number(),
  citiesBuilt: v.number(),
  longestRoadLength: v.number(),
  hasLongestRoad: v.boolean(),
})
  .index("by_gameId", ["gameId"])
  .index("by_gameId_and_playerIndex", ["gameId", "playerIndex"])
  .index("by_userId", ["userId"]);
