import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const addAIPlayer = mutation({
  args: {
    clerkId: v.string(), // Host's clerkId for authorization
    lobbyId: v.id("lobbies"),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
  },
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
      throw new Error("Only host can add AI players");
    }

    // Check if lobby is still waiting
    if (lobby.status !== "waiting") {
      throw new Error("Cannot add AI players after game has started");
    }

    // Get current player count
    const currentPlayers = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
      .collect();

    if (currentPlayers.length >= lobby.maxPlayers) {
      throw new Error("Lobby is full");
    }

    // Assign available color for AI (AI can take any available color)
    const allColors: ("red" | "blue" | "white" | "orange")[] = [
      "red",
      "blue",
      "white",
      "orange",
    ];
    const usedColors = currentPlayers
      .filter((p) => p.color !== "unassigned")
      .map((p) => p.color as "red" | "blue" | "white" | "orange");
    const availableColors = allColors.filter(
      (color) => !usedColors.includes(color),
    );
    const nextColor = availableColors[0]; // AI takes first available

    if (!nextColor) {
      throw new Error("No available colors for AI player");
    }

    // Add AI player
    await ctx.db.insert("lobbyPlayers", {
      lobbyId: args.lobbyId,
      userId: undefined, // AI players have no userId
      isAI: true,
      aiDifficulty: args.difficulty,
      color: nextColor,
      isReady: true, // AI players are always ready
      joinedAt: Date.now(),
    });

    return args.lobbyId;
  },
});
