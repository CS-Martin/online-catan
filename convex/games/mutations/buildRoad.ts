import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const buildRoad = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    edgeId: v.number(),
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
      throw new Error("Cannot build road in current phase");
    }

    // Check if edge exists and is available
    const edge = game.board.edges.find((e) => e.id === args.edgeId);
    if (!edge) {
      throw new Error("Edge not found");
    }

    if (edge.hasRoad) {
      throw new Error("Edge already has a road");
    }

    // Validate road placement rules
    if (!canBuildRoad(game, player, args.edgeId)) {
      throw new Error("Invalid road placement");
    }

    // During setup phase, building is free
    const isSetupPhase =
      game.phase === "setup_forward" || game.phase === "setup_reverse";

    // Check if player has resources (only during trade_build phase)
    if (!isSetupPhase) {
      const cost = { brick: 1, lumber: 1, ore: 0, grain: 0, wool: 0 };
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
          grain: player.resources.grain,
          wool: player.resources.wool,
        };

    // Update board
    const newBoard = {
      ...game.board,
      edges: game.board.edges.map((e) =>
        e.id === args.edgeId
          ? { ...e, hasRoad: true, ownerId: args.playerIndex }
          : e,
      ),
    };

    // Update game state
    await ctx.db.patch(args.gameId, { board: newBoard });

    // Update player
    await ctx.db.patch(player._id, {
      resources: newResources,
      roadsBuilt: player.roadsBuilt + 1,
    });

    // Calculate longest road
    await updateLongestRoad(ctx, args.gameId);

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "build_road",
      details: {
        edgeId: args.edgeId,
        buildingType: "road",
        cost: isSetupPhase
          ? null
          : { brick: 1, lumber: 1, ore: 0, grain: 0, wool: 0 },
        isSetupPhase,
        position: `edge ${args.edgeId}`,
        vertices: edge.vertices,
        totalRoads: player.roadsBuilt + 1,
        longestRoadLength: player.roadsBuilt + 1, // Simplified - would be calculated properly
      },
      timestamp: Date.now(),
    });

    return player._id;
  },
});

function canBuildRoad(game: any, player: any, edgeId: number): boolean {
  const edge = game.board.edges.find((e: any) => e.id === edgeId);
  if (!edge || edge.hasRoad) return false;

  // Check if connected to player's settlement or existing road
  const [vertex1Id, vertex2Id] = edge.vertices;

  // Check vertices for player's buildings
  for (const vertexId of [vertex1Id, vertex2Id]) {
    const vertex = game.board.vertices.find((v: any) => v.id === vertexId);
    if (vertex && vertex.ownerId === player.playerIndex && vertex.building) {
      return true;
    }
  }

  // Check edges for player's existing roads
  for (const vertexId of [vertex1Id, vertex2Id]) {
    const adjacentEdges = game.board.edges.filter(
      (e: any) => e.vertices.includes(vertexId) && e.id !== edgeId,
    );
    for (const adjacentEdge of adjacentEdges) {
      if (adjacentEdge.hasRoad && adjacentEdge.ownerId === player.playerIndex) {
        return true;
      }
    }
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

async function updateLongestRoad(ctx: any, gameId: string) {
  // Get all players
  const players = await ctx.db
    .query("gamePlayers")
    .withIndex("by_gameId", (q: any) => q.eq("gameId", gameId))
    .collect();

  // Get game
  const game = await ctx.db.get(gameId);
  if (!game) return;

  // Calculate longest road for each player
  let maxRoadLength = 0;
  let longestRoadPlayerIndex = -1;

  for (const player of players) {
    const roadLength = calculateLongestRoad(game, player.playerIndex);
    if (roadLength > maxRoadLength) {
      maxRoadLength = roadLength;
      longestRoadPlayerIndex = player.playerIndex;
    }
  }

  // Update players with longest road info
  for (const player of players) {
    const hasLongestRoad =
      player.playerIndex === longestRoadPlayerIndex && maxRoadLength >= 5;
    const roadLength =
      player.playerIndex === longestRoadPlayerIndex ? maxRoadLength : 0;

    await ctx.db.patch(player._id, {
      hasLongestRoad,
      longestRoadLength: roadLength,
    });
  }
}

function calculateLongestRoad(game: any, playerIndex: number): number {
  // Simplified longest road calculation
  // In a real implementation, this would use graph traversal
  const playerEdges = game.board.edges.filter(
    (edge: any) => edge.hasRoad && edge.ownerId === playerIndex,
  );

  // For now, just return the count of roads
  // A proper implementation would find the longest connected path
  return playerEdges.length;
}
