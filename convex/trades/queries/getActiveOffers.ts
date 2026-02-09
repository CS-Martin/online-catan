import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getActiveOffers = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("tradeOffers")
      .withIndex("by_gameId_and_status", (q) => 
        q.eq("gameId", args.gameId).eq("status", "open")
      )
      .collect();

    // Sort by creation time (newest first)
    return offers.sort((a, b) => b._creationTime - a._creationTime);
  },
});
