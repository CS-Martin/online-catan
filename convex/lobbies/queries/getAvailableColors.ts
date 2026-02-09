import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getAvailableColors = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, args) => {
    // Get all players in lobby
    const players = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    // Get used colors (exclude unassigned)
    const usedColors = players
      .filter(p => p.color !== "unassigned")
      .map(p => p.color);

    // All possible colors
    const allColors = ["red", "blue", "white", "orange"] as const;
    
    // Return available colors
    const availableColors = allColors.filter(color => !usedColors.includes(color));
    
    return {
      availableColors,
      usedColors,
      totalPlayers: players.length,
    };
  },
});
