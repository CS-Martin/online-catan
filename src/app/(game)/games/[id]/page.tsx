"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Id } from "@convex/_generated/dataModel";

import { HexBoard } from "@/components/game/hex-board";
import { PlayerPanelsBar } from "@/components/game/player-panel";
import { ResourceBar } from "@/components/game/resource-bar";
import { GameActions } from "@/components/game/game-actions";
import { GameLogger } from "@/components/game/game-logger";

// ─── Types ───────────────────────────────────────────────────────────────────

type BuildMode = "settlement" | "road" | "city" | null;

// ─── Phase Labels ────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  setup_forward: "Setup Phase (Round 1)",
  setup_reverse: "Setup Phase (Round 2)",
  roll_dice: "Roll Dice",
  robber_move: "Move the Robber",
  robber_steal: "Steal a Resource",
  discard: "Discard Resources",
  trade_build: "Trade & Build",
  game_over: "Game Over!",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function GamePage() {
  const params = useParams();
  const { user } = useUser();
  const gameId = params.id as string;

  // ─── State ─────────────────────────────────────────────────────────────────
  const [buildMode, setBuildMode] = useState<BuildMode>(null);
  const [setupSelection, setSetupSelection] = useState<{
    vertexId?: number;
    edgeId?: number;
  }>({});

  // ─── Queries ───────────────────────────────────────────────────────────────
  const game = useQuery(api.games.api.getGame, {
    gameId: gameId as Id<"games">,
  });
  const gamePlayers = useQuery(api.games.api.getGamePlayers, {
    gameId: gameId as Id<"games">,
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const rollDice = useMutation(api.games.api.rollDice);
  const buildSettlement = useMutation(api.games.api.buildSettlement);
  const buildRoad = useMutation(api.games.api.buildRoad);
  const placeSetupSettlement = useMutation(api.games.api.placeSetupSettlement);
  const endTurn = useMutation(api.games.api.endTurn);
  const advanceTurn = useMutation(api.games.api.advanceTurn);

  const isLoading = game === undefined || gamePlayers === undefined;

  // Look up the Convex user by Clerk ID to match against gamePlayers.userId
  const convexUser = useQuery(
    api.users.api.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip",
  );

  // Find the gamePlayer that belongs to the logged-in user
  const currentUserPlayer = (() => {
    if (!gamePlayers || !convexUser) return undefined;
    return gamePlayers.find((p) => p.userId === convexUser._id);
  })();

  const isMyTurn = currentUserPlayer?.playerIndex === game?.currentPlayerIndex;

  // Debug: Log turn state
  console.log("Turn state debug:", {
    currentPlayerIndex: game?.currentPlayerIndex,
    currentUserPlayerIndex: currentUserPlayer?.playerIndex,
    isMyTurn,
    phase: game?.phase,
    currentUserPlayer: currentUserPlayer?.displayName,
    allPlayers: gamePlayers?.map((p) => ({
      index: p.playerIndex,
      name: p.displayName,
      isAI: p.isAI,
    })),
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleRollDice = useCallback(async () => {
    if (!game || !currentUserPlayer) return;
    try {
      await rollDice({
        gameId: game._id,
        playerIndex: currentUserPlayer.playerIndex,
      });
    } catch (err) {
      console.error("Failed to roll dice:", err);
    }
  }, [game, currentUserPlayer, rollDice]);

  const handleEndTurn = useCallback(async () => {
    if (!game) return;

    // Allow manual turn advancement for testing
    try {
      await endTurn({
        gameId: game._id,
        playerIndex: game.currentPlayerIndex, // Use current player index
      });
      setBuildMode(null);
    } catch (err) {
      console.error("Failed to end turn:", err);
    }
  }, [game, endTurn]);

  const handleAdvanceTurn = useCallback(async () => {
    if (!game) return;

    try {
      await advanceTurn({
        gameId: game._id,
      });
    } catch (err) {
      console.error("Failed to advance turn:", err);
    }
  }, [game, advanceTurn]);

  const handleVertexClick = useCallback(
    async (vertexId: number) => {
      console.log("Vertex clicked:", vertexId, {
        phase: game?.phase,
        isMyTurn,
        buildMode,
        setupSelection,
      });

      if (!game || !currentUserPlayer || !isMyTurn) return;

      const clickedVertex = game.board.vertices.find((v) => v.id === vertexId);
      if (!clickedVertex) return;

      if (clickedVertex.building) {
        setBuildMode(null);
        setSetupSelection({});
        return;
      }

      const isSetup =
        game.phase === "setup_forward" || game.phase === "setup_reverse";

      if (isSetup) {
        // During setup, step 1: select vertex, then wait for edge click
        console.log("Setup phase - selecting vertex:", vertexId);
        setSetupSelection({ vertexId });
      } else if (buildMode === "settlement") {
        try {
          setBuildMode(null);
          await buildSettlement({
            gameId: game._id,
            playerIndex: currentUserPlayer.playerIndex,
            vertexId,
          });
        } catch (err) {
          console.error("Failed to build settlement:", err);
        }
      }
    },
    [
      game,
      currentUserPlayer,
      isMyTurn,
      buildMode,
      buildSettlement,
      setupSelection,
    ],
  );

  const handleEdgeClick = useCallback(
    async (edgeId: number) => {
      if (!game || !currentUserPlayer || !isMyTurn) return;

      const clickedEdge = game.board.edges.find((e) => e.id === edgeId);
      if (!clickedEdge) return;

      if (clickedEdge.hasRoad) {
        setBuildMode(null);
        setSetupSelection({});
        return;
      }

      const isSetup =
        game.phase === "setup_forward" || game.phase === "setup_reverse";

      if (isSetup && setupSelection.vertexId) {
        // During setup, place both settlement and road
        try {
          setBuildMode(null);
          setSetupSelection({});
          await placeSetupSettlement({
            gameId: game._id,
            playerIndex: currentUserPlayer.playerIndex,
            vertexId: setupSelection.vertexId,
            edgeId,
          });
        } catch (err) {
          console.error("Failed to place setup pieces:", err);
        }
      } else if (buildMode === "road") {
        try {
          setBuildMode(null);
          await buildRoad({
            gameId: game._id,
            playerIndex: currentUserPlayer.playerIndex,
            edgeId,
          });
        } catch (err) {
          console.error("Failed to build road:", err);
        }
      }
    },
    [
      game,
      currentUserPlayer,
      isMyTurn,
      buildMode,
      buildRoad,
      placeSetupSettlement,
      setupSelection,
    ],
  );

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-[400px] w-[600px] rounded-2xl" />
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-[72px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Button variant="outline" asChild>
          <Link href="/lobbies">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobbies
          </Link>
        </Button>
        <div className="text-center py-20">
          <div className="text-lg font-semibold">Game not found</div>
          <div className="text-sm text-muted-foreground mt-1">
            This game may have been deleted.
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: `
          repeating-linear-gradient(
            90deg,
            transparent,
            rgba(0,0,0,0.03) 1px,
            transparent 2px,
            transparent 20px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.02) 3px,
            transparent 4px,
            transparent 40px
          ),
          linear-gradient(180deg, #5c3a1e 0%, #7a4f2e 15%, #8b5e3c 30%, #6b4226 50%, #7a4f2e 70%, #8b5e3c 85%, #5c3a1e 100%)
        `,
      }}
    >
      {/* Vignette overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-1"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      {/* Top: Player Panels */}
      <div className="shrink-0 px-4 pt-1 pb-1">
        <PlayerPanelsBar
          players={gamePlayers || []}
          currentPlayerIndex={game.currentPlayerIndex}
          currentUserId={user?.id}
        />
      </div>

      {/* Middle: Game Board + Actions */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4">
        {/* Back button */}
        <div className="absolute top-2 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            asChild
          >
            <Link href={`/lobbies/${game.lobbyId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Leave
            </Link>
          </Button>
        </div>

        {/* Phase indicator */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-1.5 text-sm text-slate-300 font-medium">
            {PHASE_LABELS[game.phase] ?? game.phase}
            {isMyTurn && (
              <span className="ml-2 text-yellow-400 text-xs font-bold">
                — Your Turn
              </span>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className="w-full max-w-[900px] h-full max-h-[700px]">
          <HexBoard
            hexes={game.board.hexes}
            vertices={game.board.vertices}
            edges={game.board.edges}
            players={(gamePlayers || []).map((p) => ({
              playerIndex: p.playerIndex,
              color: p.color,
              displayName: p.displayName,
            }))}
            buildMode={buildMode}
            selectedVertexId={setupSelection.vertexId}
            isSetupPhase={
              game.phase === "setup_forward" || game.phase === "setup_reverse"
            }
            onVertexClick={handleVertexClick}
            onEdgeClick={handleEdgeClick}
          />
        </div>

        {/* Right side: Game Actions */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <GameActions
            phase={game.phase}
            isMyTurn={isMyTurn || false}
            diceRoll={game.diceRoll}
            buildMode={buildMode}
            onRollDice={handleRollDice}
            onSetBuildMode={setBuildMode}
            onEndTurn={handleEndTurn}
            onAdvanceTurn={handleAdvanceTurn}
          />
        </div>
      </div>

      {/* Bottom: Resource Bar */}
      <div className="shrink-0 px-4 pb-3 pt-1">
        {currentUserPlayer ? (
          <ResourceBar resources={currentUserPlayer.resources} />
        ) : (
          <div className="text-center text-sm text-slate-500 py-2">
            Spectating
          </div>
        )}
      </div>

      {/* Game Logger - shows as draggable on desktop, sidebar on mobile */}
      <GameLogger
        gameId={game._id}
        players={(gamePlayers || []).map((p) => ({
          playerIndex: p.playerIndex,
          displayName: p.displayName,
          color: p.color,
        }))}
      />
    </div>
  );
}
