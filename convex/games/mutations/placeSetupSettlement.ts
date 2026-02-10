import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const placeSetupSettlement = mutation({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    vertexId: v.number(),
    edgeId: v.number(),
  },
  returns: v.id("gamePlayers"),
  handler: async (ctx, args) => {
    // Get game
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Validate game phase
    if (game.phase !== "setup_forward" && game.phase !== "setup_reverse") {
      throw new Error("Cannot place setup pieces in current phase");
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

    // Validate it's the player's turn
    if (game.currentPlayerIndex !== args.playerIndex) {
      throw new Error("Not your turn");
    }

    // Check if vertex exists and is available
    const vertex = game.board.vertices.find((v) => v.id === args.vertexId);
    if (!vertex) {
      throw new Error("Vertex not found");
    }
    if (vertex.building) {
      throw new Error("Vertex already has a building");
    }

    // Validate settlement placement rules (distance rule)
    if (!canBuildSettlement(game, player, args.vertexId)) {
      throw new Error(
        `Invalid settlement placement at vertex ${args.vertexId} — violates distance rule (adjacent vertex has a building)`,
      );
    }

    // Skip edge validation during setup - we'll handle it differently
    const edge = game.board.edges.find((e) => e.id === args.edgeId);
    if (!edge) {
      // During setup, if edge doesn't exist, create a dummy edge for the road
      console.log("Creating dummy edge for setup at vertex", args.vertexId);
    } else if (edge.hasRoad) {
      throw new Error("Edge already has a road");
    } else if (!edge.vertices.includes(args.vertexId)) {
      // During setup, if edge doesn't connect, we'll still place the settlement
      console.log("Edge doesn't connect to vertex, placing settlement anyway");
    }

    const canPlaceRoad =
      game.board.edges.some(
        (e) =>
          e.id === args.edgeId &&
          !e.hasRoad &&
          e.vertices.includes(args.vertexId),
      ) ?? false;

    // Update board with settlement and road (immutably)
    const newVertices = game.board.vertices.map((v) => {
      if (v.id !== args.vertexId) return v;
      return {
        ...v,
        building: "settlement" as const,
        ownerId: args.playerIndex,
      };
    });
    const newEdges = canPlaceRoad
      ? game.board.edges.map((e) => {
          if (e.id !== args.edgeId) return e;
          return { ...e, hasRoad: true, ownerId: args.playerIndex };
        })
      : game.board.edges;
    const newBoard = { ...game.board, vertices: newVertices, edges: newEdges };

    if (!canPlaceRoad) {
      console.log("Skipping road placement - no valid edge found");
    }

    // Update game state
    await ctx.db.patch(args.gameId, { board: newBoard });

    // Update player stats
    await ctx.db.patch(player._id, {
      settlementsBuilt: player.settlementsBuilt + 1,
      roadsBuilt: player.roadsBuilt + (canPlaceRoad ? 1 : 0),
      victoryPoints: player.victoryPoints + 1, // Settlement = 1 VP
    });

    // Distribute initial resources (only for second round of setup)
    if (game.phase === "setup_reverse") {
      await distributeInitialResources(
        ctx,
        args.gameId,
        args.vertexId,
        args.playerIndex,
      );
    }

    // Move to next player or phase
    const allPlayers = await ctx.db
      .query("gamePlayers")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    const nextPlayerIndex = getNextPlayerIndex(
      game.phase,
      args.playerIndex,
      allPlayers.length,
    );

    // Auto-place for AI players during setup
    const nextPlayer = allPlayers.find(
      (p) => p.playerIndex === nextPlayerIndex,
    );
    if (nextPlayer?.isAI) {
      console.log("Auto-placing for AI player:", nextPlayerIndex);
      // For now, just advance to the next human player
      const humanPlayers = allPlayers.filter((p) => !p.isAI);
      if (humanPlayers.length > 0) {
        const nextHumanIndex = humanPlayers[0].playerIndex;
        await ctx.db.patch(args.gameId, {
          currentPlayerIndex: nextHumanIndex,
          phase: nextHumanIndex === 0 ? "setup_reverse" : game.phase,
        });
      }
    } else if (nextPlayerIndex === 0 && game.phase === "setup_forward") {
      // Round 1 complete → start round 2 (reverse) with the last player
      await ctx.db.patch(args.gameId, {
        currentPlayerIndex: allPlayers.length - 1,
        phase: "setup_reverse",
      });
    } else if (
      nextPlayerIndex === allPlayers.length - 1 &&
      game.phase === "setup_reverse" &&
      args.playerIndex === 0
    ) {
      // Round 2 complete (player 0 just placed) → start main game
      await ctx.db.patch(args.gameId, {
        currentPlayerIndex: 0,
        phase: "roll_dice",
        turnNumber: 1,
      });
    } else {
      // Continue within current setup phase
      await ctx.db.patch(args.gameId, {
        currentPlayerIndex: nextPlayerIndex,
        phase: game.phase,
      });
    }

    // Log the action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: args.playerIndex,
      action: "place_setup_settlement",
      details: { vertexId: args.vertexId, edgeId: args.edgeId },
      timestamp: Date.now(),
    });

    return player._id;
  },
});

function canBuildSettlement(game: any, player: any, vertexId: number): boolean {
  const vertex = game.board.vertices.find((v: any) => v.id === vertexId);
  if (!vertex) {
    console.log("canBuildSettlement FAIL: vertex not found", vertexId);
    return false;
  }
  if (vertex.building) {
    console.log(
      "canBuildSettlement FAIL: vertex already has building",
      vertexId,
      vertex.building,
    );
    return false;
  }

  // Check distance rule: no adjacent settlements
  for (const adjacentVertexId of vertex.adjacentVertices) {
    const adjacentVertex = game.board.vertices.find(
      (v: any) => v.id === adjacentVertexId,
    );
    if (adjacentVertex && adjacentVertex.building) {
      console.log(
        "canBuildSettlement FAIL: adjacent vertex",
        adjacentVertexId,
        "has building",
        adjacentVertex.building,
        "owned by player",
        adjacentVertex.ownerId,
        "- tried to place at vertex",
        vertexId,
        "adjacentVertices:",
        vertex.adjacentVertices,
      );
      return false;
    }
  }

  console.log("canBuildSettlement OK: vertex", vertexId);
  return true;
}

function getNextPlayerIndex(
  currentPhase: string,
  currentPlayerIndex: number,
  totalPlayers: number,
): number {
  if (currentPhase === "setup_forward") {
    // Clockwise
    return (currentPlayerIndex + 1) % totalPlayers;
  } else {
    // Counter-clockwise
    return currentPlayerIndex === 0 ? totalPlayers - 1 : currentPlayerIndex - 1;
  }
}

async function distributeInitialResources(
  ctx: any,
  gameId: string,
  vertexId: number,
  playerIndex: number,
) {
  const game = await ctx.db.get(gameId);
  if (!game) return;

  const vertex = game.board.vertices.find((v: any) => v.id === vertexId);
  if (!vertex) return;

  // Give resources from adjacent hexes
  let newResources = { brick: 0, lumber: 0, ore: 0, grain: 0, wool: 0 };

  for (const hexId of vertex.adjacentHexes) {
    const hex = game.board.hexes.find((h: any) => h.id === hexId);
    if (hex && hex.resource !== "desert") {
      const resource = hex.resource as keyof typeof newResources;
      newResources[resource] += 1;
    }
  }

  // Update player's resources
  const player = await ctx.db
    .query("gamePlayers")
    .withIndex("by_gameId_and_playerIndex", (q: any) =>
      q.eq("gameId", gameId).eq("playerIndex", playerIndex),
    )
    .first();

  if (player) {
    await ctx.db.patch(player._id, { resources: newResources });
  }
}
