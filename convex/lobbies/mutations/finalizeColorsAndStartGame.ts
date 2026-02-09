import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { generateStandardBoard } from "../../games/lib/boardGeneration";

export const finalizeColorsAndStartGame = mutation({
  args: {
    clerkId: v.string(), // Host's clerkId for authorization
    lobbyId: v.id("lobbies"),
  },
  returns: v.id("games"),
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

    // Verify user is the host
    if (lobby.hostId !== user._id) {
      throw new Error("Only the host can finalize colors and start the game");
    }

    // Verify lobby is in color_selection phase
    if (lobby.status !== "color_selection") {
      throw new Error("Game is not in color selection phase");
    }

    // Get all players in lobby
    const players = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    // Assign random colors to any players without colors
    const allColors = ["red", "blue", "white", "orange"] as const;
    const usedColors = players
      .filter((p) => p.color && p.color !== "unassigned")
      .map((p) => p.color as (typeof allColors)[number]);

    const availableColors = allColors.filter((c) => !usedColors.includes(c));

    for (const player of players) {
      if (!player.color || player.color === "unassigned") {
        if (availableColors.length === 0) {
          throw new Error("No available colors to assign");
        }
        const randomColor = availableColors.splice(
          Math.floor(Math.random() * availableColors.length),
          1,
        )[0];
        await ctx.db.patch(player._id, { color: randomColor });
      }
    }

    // Generate board
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
    for (let i = 0; i < players.length; i++) {
      const lobbyPlayer = players[i];

      let displayName = `AI (${lobbyPlayer.aiDifficulty})`;
      if (!lobbyPlayer.isAI && lobbyPlayer.userId) {
        const playerUser = await ctx.db.get(lobbyPlayer.userId);
        displayName =
          playerUser?.displayName ||
          `${playerUser?.firstName} ${playerUser?.lastName}`;
      }

      // Ensure we have a valid color (not "unassigned")
      let playerColor = lobbyPlayer.color;
      if (!playerColor || playerColor === "unassigned") {
        // This should not happen since we assigned colors above, but as a fallback
        const allColors = ["red", "blue", "white", "orange"] as const;
        const usedColors = players
          .filter((p) => p.color && p.color !== "unassigned")
          .map((p) => p.color as (typeof allColors)[number]);
        const availableColors = allColors.filter(
          (c) => !usedColors.includes(c),
        );
        playerColor = availableColors[0] || "red";
      }

      await ctx.db.insert("gamePlayers", {
        gameId,
        userId: lobbyPlayer.userId,
        playerIndex: i,
        isAI: lobbyPlayer.isAI,
        aiDifficulty: lobbyPlayer.aiDifficulty,
        color: playerColor as "red" | "blue" | "white" | "orange",
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

    // Update lobby to in_game
    await ctx.db.patch(args.lobbyId, {
      status: "in_game",
      gameId,
    });

    return gameId;
  },
});
