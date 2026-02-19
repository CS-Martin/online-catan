import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const buildSettlement = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    vertexId: v.number(),
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
    if (
      game.phase !== "trade_build" &&
      game.phase !== "setup_forward" &&
      game.phase !== "setup_reverse"
    ) {
      throw new Error("Cannot build settlement in current phase");
    }

    // Check if vertex exists and is available
    const vertex = game.board.vertices.find((v) => v.id === args.vertexId);
    if (!vertex) {
      throw new Error("Vertex not found");
    }

    if (vertex.building) {
      throw new Error("Vertex already has a building");
    }

    // Validate settlement placement rules
    if (!canBuildSettlement(game, player, args.vertexId)) {
      throw new Error("Invalid settlement placement");
    }

    // During setup phase, building is free
    const isSetupPhase =
      game.phase === "setup_forward" || game.phase === "setup_reverse";

    // Check if player has resources (only during trade_build phase)
    if (!isSetupPhase) {
      const cost = { brick: 1, lumber: 1, ore: 0, grain: 1, wool: 1 };
      if (!hasEnoughResources(player.resources, cost)) {
        throw new Error("Not enough resources");
      }
    }

    // Deduct resources (only during trade_build phase)
    const newResources = isSetupPhase
      ? player.resources
      : {
          brick: player.resources.brick - 1,
          lumber: player.resources.lumber - 1,
          ore: player.resources.ore,
          grain: player.resources.grain - 1,
          wool: player.resources.wool - 1,
        };

    // Update board
    const newVertices = game.board.vertices.map((v) =>
      v.id !== args.vertexId
        ? v
        : {
            ...v,
            building: "settlement" as const,
            ownerId: args.playerIndex as number | undefined,
          },
    );
    const newBoard = {
      ...game.board,
      vertices: newVertices as typeof game.board.vertices,
    };

    // Update game state
    await ctx.db.patch(args.gameId, { board: newBoard });

    // Update player
    await ctx.db.patch(player._id, {
      resources: newResources,
      settlementsBuilt: player.settlementsBuilt + 1,
      victoryPoints: player.victoryPoints + 1, // Settlement = 1 VP
    });

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "build_settlement",
      details: {
        vertexId: args.vertexId,
        buildingType: "settlement",
        cost: isSetupPhase
          ? null
          : { brick: 1, lumber: 1, ore: 0, grain: 1, wool: 1 },
        isSetupPhase,
        victoryPoints: 1,
        position: `vertex ${args.vertexId}`,
        totalSettlements: player.settlementsBuilt + 1,
        totalVictoryPoints: player.victoryPoints + 1,
      },
      timestamp: Date.now(),
    });

    return player._id;
  },
});

function canBuildSettlement(game: any, player: any, vertexId: number): boolean {
  const vertex = game.board.vertices.find((v: any) => v.id === vertexId);
  if (!vertex || vertex.building) return false;

  // Check distance rule: no adjacent settlements
  for (const adjacentVertexId of vertex.adjacentVertices) {
    const adjacentVertex = game.board.vertices.find(
      (v: any) => v.id === adjacentVertexId,
    );
    if (adjacentVertex && adjacentVertex.building) {
      return false;
    }
  }

  // Check if connected to player's road or settlement
  const adjacentEdges = game.board.edges.filter((e: any) =>
    e.vertices.includes(vertexId),
  );

  for (const edge of adjacentEdges) {
    if (edge.hasRoad && edge.ownerId === player.playerIndex) {
      return true;
    }
  }

  // Check if this is setup phase (no road connection required)
  if (game.phase === "setup_forward" || game.phase === "setup_reverse") {
    return true;
  }

  return false;
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
