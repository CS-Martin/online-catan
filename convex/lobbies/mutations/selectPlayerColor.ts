import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const selectPlayerColor = mutation({
  args: {
    clerkId: v.string(),
    lobbyId: v.id("lobbies"),
    color: v.union(
      v.literal("red"),
      v.literal("blue"),
      v.literal("white"),
      v.literal("orange"),
    ),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Find player in lobby
    const player = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId_and_userId", (q) =>
        q.eq("lobbyId", args.lobbyId).eq("userId", user._id),
      )
      .first();

    if (!player) {
      throw new Error("Player not found in lobby");
    }

    // Get lobby
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    // Check if game hasn't started yet
    if (lobby.status !== "waiting" && lobby.status !== "color_selection") {
      throw new Error("Cannot change color after game has started");
    }

    // Check if color is already taken
    const existingPlayerWithColor = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .filter((q) => q.eq(q.field("color"), args.color))
      .first();

    if (existingPlayerWithColor && existingPlayerWithColor._id !== player._id) {
      throw new Error("Color is already taken by another player");
    }

    // Update player's color
    await ctx.db.patch(player._id, { color: args.color });

    return player._id;
  },
});
