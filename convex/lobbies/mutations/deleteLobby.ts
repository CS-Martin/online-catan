import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const deleteLobby = mutation({
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

    // Get lobby
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    // Check if user is the host
    if (lobby.hostId !== user._id) {
      throw new Error("Only the host can delete the lobby");
    }

    // Check if game is in progress
    if (lobby.status === "in_game") {
      throw new Error("Cannot delete a lobby that is in progress");
    }

    // Delete all players in the lobby (cascade delete)
    const players = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    console.log(
      `Deleting ${players.length} players from lobby ${args.lobbyId}`,
    );

    // Delete all players first (cascade)
    for (const player of players) {
      await ctx.db.delete(player._id);
    }

    // Verify all players are deleted before deleting lobby
    const remainingPlayers = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    if (remainingPlayers.length > 0) {
      throw new Error("Failed to delete all players from lobby");
    }

    // Now safely delete the lobby
    await ctx.db.delete(args.lobbyId);

    console.log(
      `Successfully deleted lobby ${args.lobbyId} and ${players.length} players`,
    );

    return {
      deletedLobby: args.lobbyId,
      deletedPlayers: players.length,
    };
  },
});
