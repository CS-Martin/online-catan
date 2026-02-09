import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { generateStandardBoard } from "../lib/boardGeneration";

export const createGame = mutation({
  args: {
    lobbyId: v.id("lobbies"),
  },
  returns: v.id("games"),
  handler: async (ctx, args) => {
    // Get lobby
    const lobby = await ctx.db.get(args.lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    // Check if lobby is in starting status
    if (lobby.status !== "starting") {
      throw new Error("Lobby is not ready to start");
    }

    // Get lobby players
    const lobbyPlayers = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    // Validate all players have colors
    const playersWithoutColors = lobbyPlayers.filter(
      (p) => p.color === "unassigned",
    );
    if (playersWithoutColors.length > 0) {
      throw new Error("All players must select a color before starting");
    }

    // Generate board with proper shared vertices/edges
    const board = generateStandardBoard();

    // Create game
    const gameId = await ctx.db.insert("games", {
      lobbyId: args.lobbyId,
      status: "setup",
      currentPlayerIndex: 0,
      turnNumber: 0,
      phase: "setup_forward",
      board,
    });

    // Create game players
    for (let i = 0; i < lobbyPlayers.length; i++) {
      const lobbyPlayer = lobbyPlayers[i];

      // Get user info for display name
      let displayName = `AI (${lobbyPlayer.aiDifficulty})`;
      if (!lobbyPlayer.isAI && lobbyPlayer.userId) {
        const user = await ctx.db.get(lobbyPlayer.userId);
        displayName =
          user?.displayName || `${user?.firstName} ${user?.lastName}`;
      }

      await ctx.db.insert("gamePlayers", {
        gameId,
        userId: lobbyPlayer.userId,
        playerIndex: i,
        isAI: lobbyPlayer.isAI,
        aiDifficulty: lobbyPlayer.aiDifficulty,
        color: lobbyPlayer.color as "red" | "blue" | "white" | "orange",
        displayName,
        resources: { brick: 0, lumber: 0, ore: 0, grain: 0, wool: 0 },
        victoryPoints: 0,
        roadsBuilt: 0,
        settlementsBuilt: 0,
        citiesBuilt: 0,
        longestRoadLength: 0,
        hasLongestRoad: false,
      });
    }

    // Update lobby status
    await ctx.db.patch(args.lobbyId, {
      status: "in_game",
      gameId,
    });

    return gameId;
  },
});
