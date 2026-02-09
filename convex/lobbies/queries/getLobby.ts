import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getLobby = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, args) => {
    // Get lobby
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) {
      return null;
    }

    // Get players in lobby
    const players = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    // Get host info
    const host = await ctx.db.get(lobby.hostId);

    // Enrich player data with user info for human players
    const enrichedPlayers = await Promise.all(
      players.map(async (player) => {
        if (player.isAI || !player.userId) {
          return {
            ...player,
            displayName: `AI (${player.aiDifficulty})`,
            imageUrl: null,
          };
        }

        const user = await ctx.db.get(player.userId);
        return {
          ...player,
          displayName:
            user?.displayName || `${user?.firstName} ${user?.lastName}`,
          imageUrl: user?.imageUrl,
        };
      }),
    );

    return {
      ...lobby,
      hostName: host ? `${host.firstName} ${host.lastName}` : "Unknown",
      hostClerkId: host?.clerkId ?? null,
      players: enrichedPlayers,
      playerCount: players.length,
      isFull: players.length >= lobby.maxPlayers,
      canStart:
        players.length >= 2 &&
        players.filter((p) => !p.isAI).every((p) => p.isReady),
    };
  },
});
