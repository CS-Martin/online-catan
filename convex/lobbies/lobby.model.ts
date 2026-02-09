import { defineTable } from "convex/server";
import { v } from "convex/values";

export const lobbies = defineTable({
  hostId: v.id("users"),
  name: v.string(),
  status: v.union(
    v.literal("waiting"),
    v.literal("starting"),
    v.literal("color_selection"),
    v.literal("in_game"),
    v.literal("closed"),
  ),
  maxPlayers: v.number(), // 2–4
  isPrivate: v.boolean(),
  inviteCode: v.optional(v.string()),
  gameId: v.optional(v.id("games")),
})
  .index("by_status", ["status"])
  .index("by_hostId", ["hostId"])
  .index("by_inviteCode", ["inviteCode"]);
