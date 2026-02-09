import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getUserLobbies = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get all lobby players for this user
    const lobbyPlayers = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Get lobby details for each
    const lobbies = await Promise.all(
      lobbyPlayers.map(async (lobbyPlayer) => {
        const lobby = await ctx.db.get(lobbyPlayer.lobbyId);
        if (!lobby) {
          return null;
        }

        // Get player count
        const allPlayers = await ctx.db
          .query("lobbyPlayers")
          .withIndex("by_lobbyId", (q) => q.eq("lobbyId", lobbyPlayer.lobbyId))
          .collect();

        return {
          ...lobby,
          playerCount: allPlayers.length,
          isFull: allPlayers.length >= lobby.maxPlayers,
          playerColor: lobbyPlayer.color,
          isReady: lobbyPlayer.isReady,
        };
      })
    );

    // Filter out null lobbies and sort by creation time
    return lobbies
      .filter((lobby): lobby is NonNullable<typeof lobby> => lobby !== null)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});
