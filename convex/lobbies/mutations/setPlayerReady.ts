import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const setPlayerReady = mutation({
  args: {
    clerkId: v.string(),
    lobbyId: v.id("lobbies"),
    isReady: v.boolean(),
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

    // Find player in lobby
    const player = await ctx.db
      .query("lobbyPlayers")
      .withIndex("by_lobbyId_and_userId", (q) => 
        q.eq("lobbyId", args.lobbyId).eq("userId", user._id)
      )
      .first();

    if (!player) {
      throw new Error("Player not found in lobby");
    }

    // Update ready status
    await ctx.db.patch(player._id, { isReady: args.isReady });

    return player._id;
  },
});
