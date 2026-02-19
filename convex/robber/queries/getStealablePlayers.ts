import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getStealablePlayers = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Only valid in robber_steal phase
    if (game.phase !== "robber_steal") {
      return [];
    }

    // Get robber position
    const robberHex = game.board.hexes.find((hex) => hex.hasRobber);
    if (!robberHex) {
      return [];
    }

    // Get all players
    const players = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    // Find players with buildings adjacent to robber
    const stealablePlayers = players
      .filter((player) => {
        // Skip the current player
        if (player.playerIndex === game.currentPlayerIndex) {
          return false;
        }

        // Check if player has any building adjacent to robber
        const hasAdjacentBuilding = game.board.vertices.some((vertex) => {
          if (!vertex.building || vertex.ownerId !== player.playerIndex) {
            return false;
          }
          return vertex.adjacentHexes.includes(robberHex.id);
        });

        if (!hasAdjacentBuilding) {
          return false;
        }

        // Check if player has resources to steal
        const totalResources = Object.values(player.resources).reduce((sum, count) => sum + count, 0);
        return totalResources > 0;
      })
      .map((player) => ({
        playerIndex: player.playerIndex,
        displayName: player.displayName,
        color: player.color,
        resources: player.resources,
        totalResources: Object.values(player.resources).reduce((sum, count) => sum + count, 0),
      }));

    return stealablePlayers;
  },
});
