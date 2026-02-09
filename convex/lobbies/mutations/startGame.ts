import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const startGame = mutation({
  args: {
    clerkId: v.string(), // Host's clerkId for authorization
    lobbyId: v.id("lobbies"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get user (host)
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

    // Check if user is host
    if (lobby.hostId !== user._id) {
      throw new Error("Only host can start the game");
    }

    // Check if lobby is still waiting
    if (lobby.status !== "waiting") {
      throw new Error("Game has already started");
    }

    // Get all players in lobby
    const players = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    // Check minimum players
    if (players.length < 2) {
      throw new Error("Need at least 2 players to start");
    }

    // Check all human players are ready and have selected colors
    const humanPlayers = players.filter((p) => !p.isAI);
    const allReady = humanPlayers.every((p) => p.isReady);

    if (!allReady) {
      throw new Error("All players must be ready to start");
    }

    // Update lobby status to color_selection phase
    await ctx.db.patch(args.lobbyId, {
      status: "color_selection",
    });

    return null;
  },
});
