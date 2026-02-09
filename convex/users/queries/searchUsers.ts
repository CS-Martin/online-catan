import { query } from "../../_generated/server";
import { v } from "convex/values";

export const searchUsers = query({
  args: {
    displayName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Search for users by display name (partial match)
    const users = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.neq(q.field("displayName"), undefined),
          q.gte(q.field("displayName"), args.displayName),
          q.lt(q.field("displayName"), args.displayName + "\uffff")
        )
      )
      .take(limit);
    
    return users.map(user => ({
      _id: user._id,
      displayName: user.displayName || `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      gamesPlayed: user.gamesPlayed || 0,
      gamesWon: user.gamesWon || 0,
      elo: user.elo || 1000,
    }));
  },
});
