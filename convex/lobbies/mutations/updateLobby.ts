import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateLobby = mutation({
  args: {
    clerkId: v.string(),
    lobbyId: v.id("lobbies"),
    name: v.optional(v.string()),
    maxPlayers: v.optional(v.number()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get user
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

    // Check if user is the host
    if (lobby.hostId !== user._id) {
      throw new Error("Only the host can update the lobby");
    }

    // Check if game is in progress
    if (lobby.status === "in_game") {
      throw new Error("Cannot update a lobby that is in progress");
    }

    // Validate max players if provided
    if (args.maxPlayers !== undefined) {
      if (args.maxPlayers < 2 || args.maxPlayers > 4) {
        throw new Error("Max players must be between 2 and 4");
      }

      // Check if reducing max players would exceed current player count
      const currentPlayers = await ctx.db
        .query("lobbyPlayers")
        .withIndex("by_lobbyId", (q) => q.eq("lobbyId", args.lobbyId))
        .collect();

      if (args.maxPlayers < currentPlayers.length) {
        throw new Error("Cannot reduce max players below current player count");
      }
    }

    // Prepare update object
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.maxPlayers !== undefined) updates.maxPlayers = args.maxPlayers;
    if (args.isPrivate !== undefined) {
      updates.isPrivate = args.isPrivate;
      // Generate invite code if making private and no code exists
      if (args.isPrivate && !lobby.inviteCode) {
        updates.inviteCode = generateInviteCode();
      }
      // Remove invite code if making public
      if (!args.isPrivate) {
        updates.inviteCode = undefined;
      }
    }

    // Update lobby
    await ctx.db.patch(args.lobbyId, updates);

    return args.lobbyId;
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
