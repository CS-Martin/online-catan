import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tradeOffers = defineTable({
  gameId: v.id("games"),
  offeredByIndex: v.number(),
  offering: v.object({
    brick: v.number(),
    lumber: v.number(),
    ore: v.number(),
    grain: v.number(),
    wool: v.number(),
  }),
  requesting: v.object({
    brick: v.number(),
    lumber: v.number(),
    ore: v.number(),
    grain: v.number(),
    wool: v.number(),
  }),
  status: v.union(
    v.literal("open"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("cancelled")
  ),
  targetPlayerIndex: v.optional(v.number()), // null = open to all
  respondedByIndex: v.optional(v.number()),
})
  .index("by_gameId", ["gameId"])
  .index("by_gameId_and_status", ["gameId", "status"])
  .index("by_offeredBy", ["offeredByIndex"]);
