import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const acceptOffer = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    tradeId: v.id("tradeOffers"),
  },
  handler: async (ctx, args) => {
    // Get trade offer
    const tradeOffer = await ctx.db.get(args.tradeId);
    if (!tradeOffer) {
      throw new Error("Trade offer not found");
    }

    // Validate trade is open
    if (tradeOffer.status !== "open") {
      throw new Error("Trade is no longer available");
    }

    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Get accepting player
    const player = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId_and_playerIndex", (q) =>
        q.eq("gameId", args.gameId).eq("playerIndex", args.playerIndex),
      )
      .first();

    if (!player) {
      throw new Error("Player not found");
    }

    // Validate target player (if specified)
    if (
      tradeOffer.targetPlayerIndex !== null &&
      tradeOffer.targetPlayerIndex !== args.playerIndex
    ) {
      throw new Error("This trade is not available to you");
    }

    // Check if player has enough resources to offer
    if (!hasEnoughResources(player.resources, tradeOffer.requesting)) {
      throw new Error("Not enough resources to complete trade");
    }

    // Get offering player
    const offeringPlayer = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId_and_playerIndex", (q) =>
        q
          .eq("gameId", args.gameId)
          .eq("playerIndex", tradeOffer.offeredByIndex),
      )
      .first();

    if (!offeringPlayer) {
      throw new Error("Offering player not found");
    }

    // Check if offering player has enough resources
    if (!hasEnoughResources(offeringPlayer.resources, tradeOffer.offering)) {
      throw new Error("Offering player does not have enough resources");
    }

    // Execute trade
    const newPlayerResources = {
      brick:
        player.resources.brick -
        tradeOffer.requesting.brick +
        tradeOffer.offering.brick,
      lumber:
        player.resources.lumber -
        tradeOffer.requesting.lumber +
        tradeOffer.offering.lumber,
      ore:
        player.resources.ore -
        tradeOffer.requesting.ore +
        tradeOffer.offering.ore,
      grain:
        player.resources.grain -
        tradeOffer.requesting.grain +
        tradeOffer.offering.grain,
      wool:
        player.resources.wool -
        tradeOffer.requesting.wool +
        tradeOffer.offering.wool,
    };

    const newOfferingPlayerResources = {
      brick:
        offeringPlayer.resources.brick -
        tradeOffer.offering.brick +
        tradeOffer.requesting.brick,
      lumber:
        offeringPlayer.resources.lumber -
        tradeOffer.offering.lumber +
        tradeOffer.requesting.lumber,
      ore:
        offeringPlayer.resources.ore -
        tradeOffer.offering.ore +
        tradeOffer.requesting.ore,
      grain:
        offeringPlayer.resources.grain -
        tradeOffer.offering.grain +
        tradeOffer.requesting.grain,
      wool:
        offeringPlayer.resources.wool -
        tradeOffer.offering.wool +
        tradeOffer.requesting.wool,
    };

    // Update players
    await ctx.db.patch(player._id, { resources: newPlayerResources });
    await ctx.db.patch(offeringPlayer._id, {
      resources: newOfferingPlayerResources,
    });

    // Update trade status
    await ctx.db.patch(args.tradeId, {
      status: "accepted",
      respondedByIndex: args.playerIndex,
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "accept_trade",
      details: {
        tradeId: args.tradeId,
        offeringPlayer: tradeOffer.offeredByIndex,
      },
      timestamp: Date.now(),
    });

    return args.tradeId;
  },
});

function hasEnoughResources(resources: any, cost: any): boolean {
  return (
    resources.brick >= cost.brick &&
    resources.lumber >= cost.lumber &&
    resources.ore >= cost.ore &&
    resources.grain >= cost.grain &&
    resources.wool >= cost.wool
  );
}
