"use client";

import { motion } from "framer-motion";
import { Shield, Route, User } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GamePlayer {
  _id: string;
  playerIndex: number;
  color: "red" | "blue" | "white" | "orange";
  displayName: string;
  victoryPoints: number;
  resources: {
    brick: number;
    lumber: number;
    ore: number;
    grain: number;
    wool: number;
  };
  roadsBuilt: number;
  settlementsBuilt: number;
  citiesBuilt: number;
  longestRoadLength: number;
  hasLongestRoad: boolean;
  isAI: boolean;
}

interface PlayerPanelProps {
  player: GamePlayer;
  isCurrentTurn: boolean;
  isYou: boolean;
}

interface PlayerPanelsBarProps {
  players: GamePlayer[];
  currentPlayerIndex: number;
  currentUserId?: string;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

/**
 * Catan Universe–inspired color styles per player
 */
const PANEL_STYLES: Record<
  string,
  {
    banner: string;
    bannerBorder: string;
    bg: string;
    border: string;
    text: string;
    vpBg: string;
    vpBorder: string;
    avatarBg: string;
  }
> = {
  red: {
    banner: "bg-gradient-to-r from-red-700 to-red-600",
    bannerBorder: "border-red-400",
    bg: "bg-red-950/70",
    border: "border-red-600/60",
    text: "text-red-100",
    vpBg: "bg-red-600",
    vpBorder: "border-red-400",
    avatarBg: "bg-red-800",
  },
  blue: {
    banner: "bg-gradient-to-r from-cyan-700 to-cyan-600",
    bannerBorder: "border-cyan-400",
    bg: "bg-cyan-950/70",
    border: "border-cyan-600/60",
    text: "text-cyan-100",
    vpBg: "bg-cyan-600",
    vpBorder: "border-cyan-400",
    avatarBg: "bg-cyan-800",
  },
  white: {
    banner: "bg-gradient-to-r from-gray-500 to-gray-400",
    bannerBorder: "border-gray-300",
    bg: "bg-gray-900/70",
    border: "border-gray-500/60",
    text: "text-gray-100",
    vpBg: "bg-gray-500",
    vpBorder: "border-gray-300",
    avatarBg: "bg-gray-700",
  },
  orange: {
    banner: "bg-gradient-to-r from-amber-700 to-amber-600",
    bannerBorder: "border-amber-400",
    bg: "bg-amber-950/70",
    border: "border-amber-600/60",
    text: "text-amber-100",
    vpBg: "bg-amber-600",
    vpBorder: "border-amber-400",
    avatarBg: "bg-amber-800",
  },
};

// ─── Components ──────────────────────────────────────────────────────────────

/**
 * Single player panel — Catan Universe style with colored banner,
 * VP badge, avatar placeholder, and stat counters.
 */
export function PlayerPanel({
  player,
  isCurrentTurn,
  isYou,
}: PlayerPanelProps) {
  const s = PANEL_STYLES[player.color];
  const totalResources = Object.values(player.resources).reduce(
    (sum, val) => sum + val,
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col items-center ${
        isCurrentTurn ? "z-10 scale-105" : ""
      } transition-transform duration-300`}
    >
      {/* VP Badge — floats above the panel */}
      <div
        className={`absolute -top-3 -left-2 z-20 w-8 h-8 rounded-full ${s.vpBg} border-2 ${s.vpBorder} flex items-center justify-center shadow-lg`}
      >
        <span className="text-white text-sm font-extrabold leading-none">
          {player.victoryPoints}
        </span>
      </div>

      {/* Main card */}
      <div
        className={`rounded-lg border ${s.border} ${s.bg} backdrop-blur-sm overflow-hidden min-w-[170px] max-w-[200px] shadow-xl ${
          isCurrentTurn
            ? "ring-2 ring-yellow-400/80 ring-offset-1 ring-offset-black"
            : ""
        }`}
      >
        {/* Name banner */}
        <div
          className={`${s.banner} border-b ${s.bannerBorder} px-3 py-1.5 flex items-center gap-2`}
        >
          {/* Avatar circle */}
          <div
            className={`w-7 h-7 rounded-full ${s.avatarBg} border border-white/20 flex items-center justify-center shrink-0`}
          >
            {player.isAI ? (
              <span className="text-xs">🤖</span>
            ) : (
              <User className="w-3.5 h-3.5 text-white/80" />
            )}
          </div>

          <span className="text-white text-xs font-bold truncate">
            {player.displayName}
            {isYou && (
              <span className="text-white/60 font-normal ml-1">(You)</span>
            )}
          </span>
        </div>

        {/* Stats body */}
        <div className="px-3 py-2 space-y-1.5">
          {/* Resource & dev card counts */}
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1 ${s.text}`}>
              <span className="opacity-70">🃏</span>
              <span className="font-semibold">{totalResources}</span>
            </div>
            <div className={`flex items-center gap-1 ${s.text}`}>
              <span className="opacity-70">📜</span>
              <span className="font-semibold">0</span>
            </div>
          </div>

          {/* Building stats row */}
          <div className="flex items-center justify-between text-xs">
            {/* Roads */}
            <div className={`flex items-center gap-0.5 ${s.text} opacity-80`}>
              <Route className="w-3 h-3" />
              <span className="font-medium">{player.roadsBuilt}</span>
            </div>

            {/* Settlements */}
            <div className={`flex items-center gap-0.5 ${s.text} opacity-80`}>
              <span className="text-[10px]">🏠</span>
              <span className="font-medium">{player.settlementsBuilt}</span>
            </div>

            {/* Cities */}
            <div className={`flex items-center gap-0.5 ${s.text} opacity-80`}>
              <span className="text-[10px]">🏰</span>
              <span className="font-medium">{player.citiesBuilt}</span>
            </div>

            {/* Longest Road badge */}
            {player.hasLongestRoad && (
              <div className="flex items-center gap-0.5 text-yellow-400">
                <Shield className="w-3 h-3" />
                <span className="font-bold">LR</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current turn indicator bar */}
      {isCurrentTurn && (
        <motion.div
          className="mt-1 h-1 w-3/4 rounded-full bg-yellow-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/**
 * Renders the top bar with all player panels in a horizontal row
 */
export function PlayerPanelsBar({
  players,
  currentPlayerIndex,
  currentUserId,
}: PlayerPanelsBarProps) {
  return (
    <div className="flex items-start justify-center gap-4 flex-wrap pt-4">
      {players.map((player) => (
        <PlayerPanel
          key={player._id}
          player={player}
          isCurrentTurn={player.playerIndex === currentPlayerIndex}
          isYou={!player.isAI && !!currentUserId}
        />
      ))}
    </div>
  );
}
