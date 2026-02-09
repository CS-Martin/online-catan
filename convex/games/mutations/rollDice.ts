import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const rollDice = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Validate it's the player's turn
    if (game.currentPlayerIndex !== args.playerIndex) {
      throw new Error("Not your turn");
    }

    // Validate game phase
    if (game.phase !== "roll_dice") {
      throw new Error("Cannot roll dice in current phase");
    }

    // Roll dice
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const rollTotal = die1 + die2;

    // Update game state
    await ctx.db.patch(args.gameId, {
      diceRoll: [die1, die2],
      phase: rollTotal === 7 ? "robber_move" : "trade_build",
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "roll_dice",
      details: { roll: [die1, die2], total: rollTotal },
      timestamp: Date.now(),
    });

    // If not a 7, distribute resources
    if (rollTotal !== 7) {
      await distributeResources(ctx, args.gameId, rollTotal);
    }

    return { die1, die2, total: rollTotal };
  },
});

async function distributeResources(
  ctx: any,
  gameId: string,
  rollTotal: number,
) {
  // Get game
  const game = await ctx.db.get(gameId);
  if (!game) return;

  // Get game players
  const players = await ctx.db
    .query("gamePlayers")
    .withIndex("by_gameId", (q: any) => q.eq("gameId", gameId))
    .collect();

  // Find hexes with matching number token
  const producingHexes = game.board.hexes.filter(
    (hex: any) => hex.numberToken === rollTotal && !hex.hasRobber,
  );

  // Distribute resources to players with buildings on producing hexes
  for (const player of players) {
    let newResources = { ...player.resources };

    // Check each vertex for player's settlements/cities
    for (const vertex of game.board.vertices) {
      if (vertex.ownerId === player.playerIndex && vertex.building) {
        // Check adjacent hexes for production
        for (const hexId of vertex.adjacentHexes) {
          const hex = game.board.hexes.find((h: any) => h.id === hexId);
          if (hex && producingHexes.includes(hex)) {
            const multiplier = vertex.building === "city" ? 2 : 1;
            const resource = hex.resource as keyof typeof newResources;
            newResources[resource] += multiplier;
          }
        }
      }
    }

    // Update player's resources if changed
    if (JSON.stringify(newResources) !== JSON.stringify(player.resources)) {
      await ctx.db.patch(player._id, { resources: newResources });

      // Log resource gain
      await ctx.db.insert("gameLogs", {
        gameId,
        turnNumber: game.turnNumber,
        playerIndex: player.playerIndex,
        action: "gain_resources",
        details: { resources: newResources },
        timestamp: Date.now(),
      });
    }
  }
}
