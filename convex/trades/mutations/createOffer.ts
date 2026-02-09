import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createOffer = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    offering: v.object({
      brick: v.number(),
      lumber: v.number(),
      ore: v.number(),
      grain: v.number(),
      wool: v.number(),
    }),
    requesting: v.object({
      brick: v.number(),
      lumber: v.number(),
      ore: v.number(),
      grain: v.number(),
      wool: v.number(),
    }),
    targetPlayerIndex: v.optional(v.number()), // null = open to all
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Get player
    const player = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId_and_playerIndex", (q) =>
        q.eq("gameId", args.gameId).eq("playerIndex", args.playerIndex),
      )
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    // Validate game phase
    if (game.phase !== "trade_build") {
      throw new Error("Cannot trade in current phase");
    }

    // Validate trade
    if (!isValidTrade(args.offering, args.requesting)) {
      throw new Error("Invalid trade");
    }

    // Check if player has enough resources to offer
    if (!hasEnoughResources(player.resources, args.offering)) {
      throw new Error("Not enough resources to offer");
    }

    // Create trade offer
    const tradeId = await ctx.db.insert("tradeOffers", {
      gameId: args.gameId,
      offeredByIndex: args.playerIndex,
      offering: args.offering,
      requesting: args.requesting,
      status: "open",
      targetPlayerIndex: args.targetPlayerIndex,
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "create_trade_offer",
      details: {
        tradeId,
        offering: args.offering,
        requesting: args.requesting,
      },
      timestamp: Date.now(),
    });

    return tradeId;
  },
});

function isValidTrade(offering: any, requesting: any): boolean {
  // Must offer at least one resource
  const totalOffered = Object.values(offering).reduce(
    (sum: number, val: unknown) => sum + (val as number),
    0,
  );
  if (totalOffered === 0) return false;

  // Must request at least one resource
  const totalRequested = Object.values(requesting).reduce(
    (sum: number, val: unknown) => sum + (val as number),
    0,
  );
  if (totalRequested === 0) return false;

  // Cannot offer and request the same resource type
  for (const [resource, amount] of Object.entries(offering)) {
    if ((amount as number) > 0 && (requesting as any)[resource] > 0) {
      return false;
    }
  }

  return true;
}

function hasEnoughResources(resources: any, cost: any): boolean {
  return (
    resources.brick >= cost.brick &&
    resources.lumber >= cost.lumber &&
    resources.ore >= cost.ore &&
    resources.grain >= cost.grain &&
    resources.wool >= cost.wool
  );
}
