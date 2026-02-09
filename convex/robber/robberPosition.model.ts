import { defineTable } from "convex/server";
import { v } from "convex/values";

export const robberPositions = defineTable({
  gameId: v.id("games"),
  hexId: v.number(),
  movedByPlayerIndex: v.number(),
  movedAtTurn: v.number(),
})
  .index("by_gameId", ["gameId"])
  .index("by_gameId_and_turn", ["gameId", "movedAtTurn"]);
