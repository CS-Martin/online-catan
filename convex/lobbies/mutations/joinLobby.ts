import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const joinLobby = mutation({
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

    // Check if lobby is joinable
    if (lobby.status !== "waiting") {
      throw new Error("Lobby is not accepting new players");
    }

    // Check if user is already in lobby
    const existingPlayer = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId_and_userId", (q) =>
        q.eq("lobbyId", args.lobbyId).eq("userId", user._id),
      )
      .first();

    if (existingPlayer) {
      throw new Error("User is already in this lobby");
    }

    // Get current player count
    const currentPlayers = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    if (currentPlayers.length >= lobby.maxPlayers) {
      throw new Error("Lobby is full");
    }

    // Add player to lobby (no color assigned yet)
    await ctx.db.insert("lobbyPlayers", {
      lobbyId: args.lobbyId,
      userId: user._id,
      isAI: false,
      color: "unassigned", // Will be selected by user
      isReady: false,
      joinedAt: Date.now(),
    });

    return args.lobbyId;
  },
});
