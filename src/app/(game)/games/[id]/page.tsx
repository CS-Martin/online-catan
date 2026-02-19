"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";

import { HexBoard } from "@/components/game/hex-board";
import { PlayerPanelsBar } from "@/components/game/player-panel";
import { ResourceBar } from "@/components/game/resource-bar";
import { GameActions } from "@/components/game/game-actions";
import { GameLogger } from "@/components/game/game-logger";
import { DiscardDialog } from "@/components/game/discard-dialog";
import { RobberMoveDialog } from "@/components/game/robber-move-dialog";
import { StealResourceDialog } from "@/components/game/steal-resource-dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

type BuildMode = "settlement" | "road" | "city" | null;

// ─── Phase Labels ────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  setup_forward: "Setup Phase (Round 1)",
  setup_reverse: "Setup Phase (Round 2)",
  roll_dice: "Roll Dice",
  discard: "Discard Cards",
  robber_move: "Move the Robber",
  robber_steal: "Steal a Resource",
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
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [playerDialogStates, setPlayerDialogStates] = useState<
    Record<number, boolean>
  >({});
  const [showRobberDialog, setShowRobberDialog] = useState(false);
  const [selectedHexId, setSelectedHexId] = useState<number | null>(null);
  const [showStealDialog, setShowStealDialog] = useState(false);

  // ─── Queries ───────────────────────────────────────────────────────────────
  const game = useQuery(api.games.api.getGame, {
    gameId: gameId as Id<"games">,
  });
  const gamePlayers = useQuery(api.games.api.getGamePlayers, {
    gameId: gameId as Id<"games">,
  });

  // Get game logs for real-time notifications
  const gameLogs = useQuery(api.gameLogs.api.getGameLogs, {
    gameId: gameId as Id<"games">,
  });

  console.log("Game logs updated:", {
    count: gameLogs?.length,
    latestAction: gameLogs?.[gameLogs.length - 1]?.action,
    latestTimestamp: gameLogs?.[gameLogs.length - 1]?.timestamp,
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

  // ─── Real-time Notifications ─────────────────────────────────────────────────
  // Listen for steal events and show victim notifications
  useEffect(() => {
    if (!gameLogs || !currentUserPlayer) return;

    console.log("Checking for theft notifications:", {
      totalLogs: gameLogs.length,
      currentPlayerIndex: currentUserPlayer.playerIndex,
    });

    // Check ALL logs for steal events (not just the latest)
    const stealLogs = gameLogs.filter((log) => log.action === "steal_resource");
    console.log("Found steal logs:", stealLogs.length, stealLogs);

    // Find the most recent steal where current player is victim
    const victimSteal = stealLogs.find(
      (log) => log.details?.targetPlayerIndex === currentUserPlayer.playerIndex,
    );

    if (victimSteal) {
      console.log("Current player is the victim!", victimSteal);

      // This player was the victim of theft
      const resourceEmoji: Record<string, string> = {
        brick: "",
        lumber: "",
        ore: "",
        grain: "",
        wool: "",
      };

      const stolenResource = victimSteal.details.stolenResource;
      const thiefPlayerIndex = victimSteal.playerIndex;
      const thief = gamePlayers?.find(
        (p) => p.playerIndex === thiefPlayerIndex,
      );

      toast.error(
        `${thief?.displayName || `Player ${thiefPlayerIndex + 1}`} stole ${resourceEmoji[stolenResource]} ${stolenResource} from you!`,
        {
          description: "Your resources were stolen by the robber!",
        },
      );
    }
  }, [gameLogs, currentUserPlayer, gamePlayers]);

  // ─── Discard Logic ─────────────────────────────────────────────────────────--
  // Show discard dialog when in discard phase and player needs to discard
  useEffect(() => {
    if (game?.phase === "discard" && currentUserPlayer) {
      const playerIndex = currentUserPlayer.playerIndex;
      if (!playerDialogStates[playerIndex]) {
        setPlayerDialogStates((prev) => ({ ...prev, [playerIndex]: true }));
      }
    }
  }, [game?.phase, currentUserPlayer, playerDialogStates]);

  // Close individual player dialogs when game moves to robber phase
  useEffect(() => {
    if (game?.phase === "robber_move") {
      setPlayerDialogStates({});
      // Show robber dialog to current player if it's their turn
      if (isMyTurn) {
        setShowRobberDialog(true);
      }
    }
  }, [game?.phase, isMyTurn]);

  // Close robber dialog when phase moves to robber_steal
  useEffect(() => {
    if (game?.phase === "robber_steal") {
      setShowRobberDialog(false);
      // Show steal dialog to current player if it's their turn
      if (isMyTurn) {
        setShowStealDialog(true);
      }
    }
  }, [game?.phase, isMyTurn]);

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

  const handleHexClick = useCallback(
    (hexId: number) => {
      console.log("Hex clicked:", hexId, {
        phase: game?.phase,
        isMyTurn,
        showRobberDialog,
      });

      // Handle hex clicks during robber move phase
      if (game?.phase === "robber_move" && isMyTurn && showRobberDialog) {
        console.log("Setting selected hex ID to:", hexId);
        // Directly update the selected hex in the dialog
        setSelectedHexId(hexId);
        return;
      }

      console.log("Hex click ignored - conditions not met");
      // Handle hex clicks during other phases (if needed)
      // For now, we don't have other hex-based interactions
    },
    [game, isMyTurn, showRobberDialog, selectedHexId],
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
        perspective: "1200px",
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
        <div
          className="w-full max-w-[900px] h-full max-h-[700px]"
          style={{
            transform: "rotateX(30deg)",
            transformStyle: "preserve-3d",
          }}
        >
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
            onHexClick={handleHexClick}
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

      {/* Discard Dialog */}
      {currentUserPlayer && (
        <DiscardDialog
          gameId={game._id}
          playerIndex={currentUserPlayer.playerIndex}
          isOpen={playerDialogStates[currentUserPlayer.playerIndex] || false}
          onClose={() => {
            setPlayerDialogStates((prev) => ({
              ...prev,
              [currentUserPlayer.playerIndex]: false,
            }));
          }}
        />
      )}

      {/* Robber Move Dialog */}
      {currentUserPlayer && (
        <RobberMoveDialog
          gameId={game._id}
          playerIndex={currentUserPlayer.playerIndex}
          isOpen={showRobberDialog}
          onClose={() => setShowRobberDialog(false)}
          selectedHexId={selectedHexId}
          setSelectedHexId={setSelectedHexId}
        />
      )}

      {/* Steal Resource Dialog */}
      {currentUserPlayer && (
        <StealResourceDialog
          gameId={game._id}
          playerIndex={currentUserPlayer.playerIndex}
          isOpen={showStealDialog}
          onClose={() => setShowStealDialog(false)}
        />
      )}
    </div>
  );
}
