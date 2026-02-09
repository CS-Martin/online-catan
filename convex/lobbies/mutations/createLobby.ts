import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createLobby = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    maxPlayers: v.number(),
    isPrivate: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate max players
    if (args.maxPlayers < 2 || args.maxPlayers > 4) {
      throw new Error("Max players must be between 2 and 4");
    }

    // Get user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Generate invite code for private lobbies
    let inviteCode = undefined;
    if (args.isPrivate) {
      inviteCode = generateInviteCode();
    }

    // Create lobby
    const lobbyId = await ctx.db.insert("lobbies", {
      hostId: user._id,
      name: args.name,
      status: "waiting",
      maxPlayers: args.maxPlayers,
      isPrivate: args.isPrivate,
      inviteCode,
    });

    // Add host as first player (no color assigned yet)
    await ctx.db.insert("lobbyPlayers", {
      lobbyId,
      userId: user._id,
      isAI: false,
      color: "unassigned", // Will be selected by user
      isReady: false,
      joinedAt: Date.now(),
    });

    return lobbyId;
  },
});

// Helper function to generate 6-character invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
