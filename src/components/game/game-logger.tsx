"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState, useRef, useEffect } from "react";
import { Move, Maximize2, X, BookOpen, History } from "lucide-react";

interface GameLoggerProps {
  gameId: Id<"games">;
  players?: Array<{ playerIndex: number; displayName: string; color: string }>;
  currentPlayerIndex?: number;
  className?: string;
}

// Action type to human-readable text
const ACTION_LABELS: Record<string, string> = {
  roll_dice: "rolled the dice",
  build_settlement: "built a settlement",
  build_road: "built a road",
  build_city: "built a city",
  place_setup_settlement: "placed a settlement",
  end_turn: "ended their turn",
  trade_with_bank: "traded with the bank",
  create_trade_offer: "offered a trade",
  accept_trade_offer: "accepted a trade",
  move_robber: "moved the robber",
  steal_resource: "stole a resource",
  discard_resources: "discarded resources",
  gain_resources: "received resources",
  game_over: "won the game!",
};

// Resource type to emoji
const RESOURCE_EMOJI: Record<string, string> = {
  brick: "🧱",
  lumber: "🪵",
  ore: "⛏️",
  grain: "🌾",
  wool: "🐑",
};

export function GameLogger({
  gameId,
  players = [],
  currentPlayerIndex,
  className,
}: GameLoggerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 500, height: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  }>({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const loggerRef = useRef<HTMLDivElement>(null);
  const gameLogs = useQuery(api.gameLogs.api.getGameLogs, { gameId });

  // Check if mobile with responsive detection
  const [isMobile, setIsMobile] = useState(false);

  // Update mobile detection on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = typeof window !== "undefined" && window.innerWidth < 768;
      setIsMobile(mobile);

      // Set desktop position only on desktop
      if (!mobile && position.x === 0 && position.y === 0) {
        setPosition({ x: 16, y: window.innerHeight - 200 });
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [position.x, position.y]);

  const sortedLogs = useMemo(() => {
    if (!gameLogs) return [];
    return [...gameLogs].sort((a, b) => a.timestamp - b.timestamp);
  }, [gameLogs]);

  const gameStartTimestamp = sortedLogs[0]?.timestamp;

  const logsToRender = useMemo(() => {
    const maxItems = isExpanded ? 14 : 7;
    // Take the last items and reverse them so newest appears at bottom
    return sortedLogs.slice(-maxItems).reverse();
  }, [isExpanded, sortedLogs]);

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".resize-handle")) {
      setIsResizing(true);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: size.width,
        startPosY: size.height,
      };
    } else if ((e.target as HTMLElement).closest(".logger-header")) {
      setIsDragging(true);
      const rect = loggerRef.current?.getBoundingClientRect();
      if (rect) {
        dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startPosX: rect.left,
          startPosY: rect.top,
        };
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        setPosition({
          x: dragRef.current.startPosX + deltaX,
          y: dragRef.current.startPosY + deltaY,
        });
      } else if (isResizing && dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        setSize({
          width: Math.max(300, dragRef.current.startPosX + deltaX),
          height: Math.max(80, dragRef.current.startPosY + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  if (!gameLogs) {
    return null;
  }

  // Get player name by index
  const getPlayerName = (playerIndex: number) => {
    const player = players.find((p) => p.playerIndex === playerIndex);
    return player?.displayName || `Player ${playerIndex + 1}`;
  };

  // Get player color by index
  const getPlayerColor = (playerIndex: number) => {
    const player = players.find((p) => p.playerIndex === playerIndex);
    return player?.color || "gray";
  };

  // Format log entry details
  const formatDetails = (action: string, details?: any) => {
    if (!details) return "";

    switch (action) {
      case "roll_dice":
        if (Array.isArray(details.diceRoll)) {
          const total = details.diceRoll.reduce(
            (a: number, b: number) => a + b,
            0,
          );
          return `and got ${total} (${details.diceRoll.join(" + ")})`;
        }
        return "";

      case "gain_resources":
        if (details.resources) {
          const resources = Object.entries(details.resources)
            .filter(([_, amount]) => Number(amount) > 0)
            .map(([resource, amount]) => `${RESOURCE_EMOJI[resource]}${amount}`)
            .join(" ");
          return `and received ${resources}`;
        }
        return "";

      case "trade_with_bank":
        if (details.give && details.receive) {
          const give = Object.entries(details.give)
            .map(([resource, amount]) => `${RESOURCE_EMOJI[resource]}${amount}`)
            .join(" ");
          const receive = Object.entries(details.receive)
            .map(([resource, amount]) => `${RESOURCE_EMOJI[resource]}${amount}`)
            .join(" ");
          return `gave ${give} for ${receive}`;
        }
        return "";

      case "create_trade_offer":
      case "accept_trade_offer":
        if (details.offer) {
          const give = Object.entries(details.offer.give || {})
            .map(([resource, amount]) => `${RESOURCE_EMOJI[resource]}${amount}`)
            .join(" ");
          const receive = Object.entries(details.offer.receive || {})
            .map(([resource, amount]) => `${RESOURCE_EMOJI[resource]}${amount}`)
            .join(" ");
          return `${give} for ${receive}`;
        }
        return "";

      case "build_settlement":
      case "build_road":
      case "build_city":
      case "place_setup_settlement":
        if (details.vertexId !== undefined) {
          return `at position ${details.vertexId}`;
        }
        if (details.edgeId !== undefined) {
          return `at position ${details.edgeId}`;
        }
        return "";

      case "move_robber":
        if (details.hexId !== undefined) {
          return `to hex ${details.hexId}`;
        }
        return "";

      case "steal_resource":
        if (details.resource && details.targetPlayerIndex !== undefined) {
          const targetName = getPlayerName(details.targetPlayerIndex);
          return `${RESOURCE_EMOJI[details.resource]} from ${targetName}`;
        }
        return "";

      default:
        return "";
    }
  };

  // Mobile sidebar version
  if (isMobile) {
    return (
      <>
        {/* Toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed z-20 top-4 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-500/70 rounded-lg p-3 text-slate-300 hover:bg-slate-800/90 transition-all duration-200 shadow-lg ${className ?? ""}`}
        >
          <BookOpen className="h-4 w-4" />
        </button>

        {/* Sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className="fixed right-0 top-0 h-full w-80 bg-slate-950/95 backdrop-blur-sm border-l border-slate-600/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-600/50">
                <div className="flex items-center gap-2 text-amber-300/80 text-sm">
                  <History className="h-4 w-4" />
                  <span>Game Log</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
                <div className="text-[13px] leading-5 font-medium text-slate-200/90 space-y-2">
                  {logsToRender.map((log) => {
                    const playerName = getPlayerName(log.playerIndex);
                    const playerColor = getPlayerColor(log.playerIndex);
                    const actionText = ACTION_LABELS[log.action] || log.action;
                    const detailsText = formatDetails(log.action, log.details);

                    const offsetMs =
                      gameStartTimestamp === undefined
                        ? 0
                        : Math.max(0, log.timestamp - gameStartTimestamp);
                    const totalSeconds = Math.floor(offsetMs / 1000);
                    const mm = String(Math.floor(totalSeconds / 60)).padStart(
                      2,
                      "0",
                    );
                    const ss = String(totalSeconds % 60).padStart(2, "0");
                    const timestampText = `[${mm}:${ss}]`;

                    const playerColorStyle =
                      playerColor === "red"
                        ? "text-red-300"
                        : playerColor === "blue"
                          ? "text-sky-300"
                          : playerColor === "white"
                            ? "text-slate-100"
                            : playerColor === "orange"
                              ? "text-orange-300"
                              : "text-slate-200";

                    const timeAgo = formatDistanceToNow(log.timestamp, {
                      addSuffix: true,
                    });

                    return (
                      <div key={log._id} className="flex gap-2">
                        <span className="text-slate-200/80 shrink-0">
                          {timestampText}
                        </span>
                        <div className="min-w-0">
                          <span className={`${playerColorStyle}`}>
                            {playerName}
                          </span>
                          <span className="text-slate-200/90">: </span>
                          <span className="text-slate-200/90 break-words">
                            {actionText}
                            {detailsText ? ` ${detailsText}` : ""}
                          </span>
                          <div className="text-slate-200/40 text-[11px] mt-0.5">
                            {timeAgo}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop draggable version
  return (
    <div
      ref={loggerRef}
      className={`fixed z-20 select-none ${className ?? ""} ${isDragging ? "cursor-grabbing" : ""} ${isResizing ? "cursor-se-resize" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-full h-full bg-slate-950/25 backdrop-blur-[2px] rounded px-3 py-2 cursor-move overflow-hidden">
        {/* Header for dragging */}
        <div className="logger-header mb-1 flex items-center justify-between text-amber-300/80 text-xs cursor-move hover:bg-slate-800/30 rounded px-2 py-1 transition-colors">
          <div className="flex items-center gap-2">
            <Move className="h-3 w-3" />
            <span>Game Log</span>
          </div>
          <div className="text-slate-400/60 text-[10px]">Drag to move</div>
        </div>
        {/* Messages */}
        <div
          className={
            "text-[13px] leading-5 font-medium text-slate-200/90 whitespace-pre-wrap " +
            (isExpanded ? "overflow-y-auto" : "overflow-hidden")
          }
          onClick={(e) => {
            // Only expand if not dragging
            if (!isDragging && !isResizing) {
              setIsExpanded((v) => !v);
            }
          }}
        >
          {logsToRender.map((log) => {
            const playerName = getPlayerName(log.playerIndex);
            const playerColor = getPlayerColor(log.playerIndex);
            const actionText = ACTION_LABELS[log.action] || log.action;
            const detailsText = formatDetails(log.action, log.details);

            const offsetMs =
              gameStartTimestamp === undefined
                ? 0
                : Math.max(0, log.timestamp - gameStartTimestamp);
            const totalSeconds = Math.floor(offsetMs / 1000);
            const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
            const ss = String(totalSeconds % 60).padStart(2, "0");
            const timestampText = `[${mm}:${ss}]`;

            const playerColorStyle =
              playerColor === "red"
                ? "text-red-300"
                : playerColor === "blue"
                  ? "text-sky-300"
                  : playerColor === "white"
                    ? "text-slate-100"
                    : playerColor === "orange"
                      ? "text-orange-300"
                      : "text-slate-200";

            const timeAgo = formatDistanceToNow(log.timestamp, {
              addSuffix: true,
            });

            return (
              <div key={log._id} className="flex gap-2">
                <span className="text-slate-200/80 shrink-0">
                  {timestampText}
                </span>
                <div className="min-w-0">
                  <span className={`${playerColorStyle}`}>{playerName}</span>
                  <span className="text-slate-200/90">: </span>
                  <span className="text-slate-200/90">
                    {actionText}
                    {detailsText ? ` ${detailsText}` : ""}
                  </span>
                  {isExpanded && (
                    <span className="ml-2 text-slate-200/40 text-[11px]">
                      {timeAgo}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {gameLogs.length > logsToRender.length && (
          <div className="mt-1 text-[11px] text-slate-200/40">
            Click to {isExpanded ? "collapse" : "expand"}
          </div>
        )}

        {/* Resize handle */}
        <div className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-60 hover:opacity-100 bg-slate-700/50 rounded-tl-lg flex items-center justify-center transition-all hover:bg-slate-600/70">
          <Maximize2 className="h-3 w-3 text-slate-300 rotate-45" />
        </div>

        {/* Resize hint */}
        {!isDragging && !isResizing && (
          <div className="absolute bottom-2 right-2 text-[10px] text-slate-400/60 pointer-events-none">
            Drag corner to resize
          </div>
        )}
      </div>
    </div>
  );
}
