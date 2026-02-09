import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getGame = query({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    return game;
  },
});
