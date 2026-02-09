import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getLobbyPlayers = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, args) => {
    const lobby = await ctx.db.get(args.lobbyId);

    // Get players in lobby
    const players = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    // Enrich player data with user info for human players
    const enrichedPlayers = await Promise.all(
      players.map(async (player) => {
        if (player.isAI || !player.userId) {
          return {
            ...player,
            displayName: `AI (${player.aiDifficulty})`,
            imageUrl: null,
            isHost: false, // AI can't be host
          };
        }

        const user = await ctx.db.get(player.userId);

        return {
          ...player,
          displayName:
            user?.displayName || `${user?.firstName} ${user?.lastName}`,
          imageUrl: user?.imageUrl,
          isHost: lobby?.hostId === player.userId,
          clerkId: user?.clerkId ?? null,
        };
      }),
    );

    return enrichedPlayers;
  },
});
