import { defineTable } from "convex/server";
import { v } from "convex/values";

export const gameLogs = defineTable({
  gameId: v.id("games"),
  turnNumber: v.number(),
  playerIndex: v.number(),
  action: v.string(), // "roll_dice", "build_road", "trade", etc.
  details: v.optional(v.any()),
  timestamp: v.number(),
})
  .index("by_gameId", ["gameId"])
  .index("by_gameId_and_turn", ["gameId", "turnNumber"])
  .index("by_timestamp", ["timestamp"]);
