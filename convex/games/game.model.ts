import { defineTable } from "convex/server";
import { v } from "convex/values";

export const games = defineTable({
  lobbyId: v.id("lobbies"),
  status: v.union(
    v.literal("setup"),        // initial placement phase
    v.literal("active"),       // main game loop
    v.literal("finished")
  ),
  currentPlayerIndex: v.number(),
  turnNumber: v.number(),
  phase: v.union(
    v.literal("setup_forward"),    // 1st round placement (clockwise)
    v.literal("setup_reverse"),    // 2nd round placement (counter-clockwise)
    v.literal("roll_dice"),
    v.literal("robber_move"),      // when 7 is rolled
    v.literal("robber_steal"),
    v.literal("discard"),          // players with >7 cards discard
    v.literal("trade_build"),      // main action phase
    v.literal("game_over")
  ),
  diceRoll: v.optional(v.array(v.number())), // [die1, die2]
  winnerId: v.optional(v.id("users")),
  board: v.object({
    hexes: v.array(v.object({
      id: v.number(),
      row: v.number(),
      col: v.number(),
      resource: v.union(
        v.literal("brick"),
        v.literal("lumber"),
        v.literal("ore"),
        v.literal("grain"),
        v.literal("wool"),
        v.literal("desert")
      ),
      numberToken: v.optional(v.number()), // 2–12, null for desert
      hasRobber: v.boolean(),
    })),
    vertices: v.array(v.object({
      id: v.number(),
      building: v.optional(
        v.union(v.literal("settlement"), v.literal("city"))
      ),
      ownerId: v.optional(v.number()), // playerIndex
      adjacentHexes: v.array(v.number()), // hex ids
      adjacentVertices: v.array(v.number()),
      adjacentEdges: v.array(v.number()),
    })),
    edges: v.array(v.object({
      id: v.number(),
      hasRoad: v.boolean(),
      ownerId: v.optional(v.number()), // playerIndex
      vertices: v.array(v.number()), // [vertexId1, vertexId2]
    })),
  }),
})
  .index("by_lobbyId", ["lobbyId"])
  .index("by_status", ["status"])
  .index("by_currentPlayer", ["currentPlayerIndex"]);
