import { defineTable } from "convex/server";
import { v } from "convex/values";

export const lobbyPlayers = defineTable({
  lobbyId: v.id("lobbies"),
  userId: v.optional(v.id("users")), // null for AI
  isAI: v.boolean(),
  aiDifficulty: v.optional(
    v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  ),
  color: v.union(
    v.literal("unassigned"),
    v.literal("red"),
    v.literal("blue"),
    v.literal("white"),
    v.literal("orange"),
  ),
  isReady: v.boolean(),
  joinedAt: v.number(),
})
  .index("by_lobbyId", ["lobbyId"])
  .index("by_userId", ["userId"])
  .index("by_lobbyId_and_userId", ["lobbyId", "userId"]);
