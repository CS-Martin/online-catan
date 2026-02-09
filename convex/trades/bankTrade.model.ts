import { defineTable } from "convex/server";
import { v } from "convex/values";

export const bankTrades = defineTable({
  gameId: v.id("games"),
  playerIndex: v.number(),
  giving: v.union(
    v.literal("brick"),
    v.literal("lumber"),
    v.literal("ore"),
    v.literal("grain"),
    v.literal("wool")
  ),
  receiving: v.union(
    v.literal("brick"),
    v.literal("lumber"),
    v.literal("ore"),
    v.literal("grain"),
    v.literal("wool")
  ),
  tradeRatio: v.number(), // 4:1, 3:1, 2:1
  turnNumber: v.number(),
})
  .index("by_gameId", ["gameId"])
  .index("by_gameId_and_player", ["gameId", "playerIndex"])
  .index("by_gameId_and_turn", ["gameId", "turnNumber"]);
