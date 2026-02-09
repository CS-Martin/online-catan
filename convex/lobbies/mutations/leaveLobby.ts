import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const leaveLobby = mutation({
  args: {
    clerkId: v.string(),
    lobbyId: v.id("lobbies"),
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
        q.eq("lobbyId", args.lobbyId).eq("userId", user._id)
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

    // Remove player from lobby
    await ctx.db.delete(player._id);

    // If player was host and lobby still has players, transfer host
    if (lobby.hostId === user._id) {
      const remainingPlayers = await ctx.db
        .query("lobbyPlayers")
        .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
        .collect();

      if (remainingPlayers.length > 0) {
        // Transfer host to first remaining player
        const newHost = remainingPlayers[0];
        await ctx.db.patch(args.lobbyId, { hostId: newHost.userId });
      } else {
        // No players left, delete lobby
        await ctx.db.delete(args.lobbyId);
      }
    }

    return true;
  },
});
