import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getBankTrades = query({
  args: {
    gameId: v.id("games"),
    playerIndex: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tradesQuery = ctx.db
      .query("bankTrades")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", args.gameId));

    // Filter by player if specified
    if (args.playerIndex !== undefined) {
      tradesQuery = ctx.db
        .query("bankTrades")
        .withIndex("by_gameId_and_player", (q: any) => 
          q.eq("gameId", args.gameId).eq("playerIndex", args.playerIndex)
        );
    }

    const trades = await tradesQuery
      .order("desc")
      .take(args.limit || 20);

    return trades;
  },
});
