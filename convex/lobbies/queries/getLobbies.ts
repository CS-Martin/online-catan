import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getLobbies = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("waiting"),
        v.literal("starting"),
        v.literal("in_game"),
        v.literal("closed"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let lobbies;

    // Filter by status if specified
    if (args.status) {
      lobbies = await ctx.db
        .query("lobbies")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      lobbies = await ctx.db.query("lobbies").collect();
    }

    // Apply limit if specified
    const limitedLobbies = args.limit ? lobbies.slice(0, args.limit) : lobbies;

    // For each lobby, get player count and host info
    const lobbiesWithPlayerCount = await Promise.all(
      limitedLobbies.map(async (lobby) => {
        const players = await ctx.db
          .query("lobbyPlayers")
          .withIndex("by_lobbyId", (q) => q.eq("lobbyId", lobby._id))
          .collect();

        const host = await ctx.db.get(lobby.hostId);

        return {
          ...lobby,
          playerCount: players.length,
          hostName: host ? `${host.firstName} ${host.lastName}` : "Unknown",
          isFull: players.length >= lobby.maxPlayers,
        };
      }),
    );

    return lobbiesWithPlayerCount;
  },
});
