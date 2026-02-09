"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Dice5,
  Handshake,
  Hammer,
  SkipForward,
  Home,
  Route,
  Building2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type BuildMode = "settlement" | "road" | "city" | null;

interface GameActionsProps {
  phase: string;
  isMyTurn: boolean;
  diceRoll?: number[];
  buildMode: BuildMode;
  onRollDice?: () => void;
  onEndTurn?: () => void;
  onAdvanceTurn?: () => void;
  onTrade?: () => void;
  onSetBuildMode?: (mode: BuildMode) => void;
}

// ─── Dice Face SVG ───────────────────────────────────────────────────────────

/**
 * Renders a single die face with proper dot layout
 */
function DieFace({ value }: { value: number }) {
  const dotPositions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [
      [25, 25],
      [75, 75],
    ],
    3: [
      [25, 25],
      [50, 50],
      [75, 75],
    ],
    4: [
      [25, 25],
      [75, 25],
      [25, 75],
      [75, 75],
    ],
    5: [
      [25, 25],
      [75, 25],
      [50, 50],
      [25, 75],
      [75, 75],
    ],
    6: [
      [25, 25],
      [75, 25],
      [25, 50],
      [75, 50],
      [25, 75],
      [75, 75],
    ],
  };

  const dots = dotPositions[value] || [];

  return (
    <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl flex items-center justify-center shadow-lg border-2 border-amber-300 relative">
      <svg viewBox="0 0 100 100" className="w-10 h-10">
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={10} fill="#1a1a1a" />
        ))}
      </svg>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Game action panel displayed on the right side of the board.
 * Shows contextual actions: dice, build menu, trade, end turn.
 */
export function GameActions({
  phase,
  isMyTurn,
  diceRoll,
  buildMode,
  onRollDice,
  onEndTurn,
  onAdvanceTurn,
  onTrade,
  onSetBuildMode,
}: GameActionsProps) {
  const [showBuildMenu, setShowBuildMenu] = useState(false);

  const isSetup = phase === "setup_forward" || phase === "setup_reverse";
  const canBuild = phase === "trade_build" || isSetup;
  const canTrade = phase === "trade_build";
  const canEndTurn = phase === "trade_build";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center gap-3"
    >
      {/* ─── Dice Display ─── */}
      <AnimatePresence>
        {diceRoll && diceRoll.length === 2 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex items-center gap-2 mb-1"
          >
            <DieFace value={diceRoll[0]} />
            <DieFace value={diceRoll[1]} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dice total badge */}
      {diceRoll && diceRoll.length === 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-amber-300 bg-slate-800/80 rounded-full px-3 py-0.5 border border-slate-700 mb-1"
        >
          = {diceRoll[0] + diceRoll[1]}
        </motion.div>
      )}

      {/* ─── Roll Dice Button ─── */}
      {phase === "roll_dice" && isMyTurn && (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onRollDice}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black shadow-xl border-2 border-amber-300"
            size="icon"
          >
            <Dice5 className="w-8 h-8" />
          </Button>
        </motion.div>
      )}

      {/* ─── Build Menu ─── */}
      <AnimatePresence>
        {showBuildMenu && canBuild && isMyTurn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="flex flex-col gap-2 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-2 shadow-2xl"
          >
            {/* Settlement */}
            <Button
              onClick={() => {
                onSetBuildMode?.(
                  buildMode === "settlement" ? null : "settlement",
                );
                setShowBuildMenu(false);
              }}
              variant="ghost"
              className={`w-12 h-12 rounded-xl ${
                buildMode === "settlement"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              size="icon"
              title="Build Settlement"
            >
              <Home className="w-6 h-6" />
            </Button>

            {/* Road */}
            <Button
              onClick={() => {
                onSetBuildMode?.(buildMode === "road" ? null : "road");
                setShowBuildMenu(false);
              }}
              variant="ghost"
              className={`w-12 h-12 rounded-xl ${
                buildMode === "road"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              size="icon"
              title="Build Road"
            >
              <Route className="w-6 h-6" />
            </Button>

            {/* City (only in trade_build phase) */}
            {!isSetup && (
              <Button
                onClick={() => {
                  onSetBuildMode?.(buildMode === "city" ? null : "city");
                  setShowBuildMenu(false);
                }}
                variant="ghost"
                className={`w-12 h-12 rounded-xl ${
                  buildMode === "city"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
                size="icon"
                title="Upgrade to City"
              >
                <Building2 className="w-6 h-6" />
              </Button>
            )}

            {/* Close */}
            <Button
              onClick={() => {
                onSetBuildMode?.(null);
                setShowBuildMenu(false);
              }}
              variant="ghost"
              className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Build toggle button */}
      {canBuild && isMyTurn && !showBuildMenu && (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowBuildMenu(true)}
            className={`w-14 h-14 rounded-2xl shadow-xl border-2 ${
              buildMode
                ? "bg-emerald-500 hover:bg-emerald-400 border-emerald-300 text-white"
                : "bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-400 text-white"
            }`}
            size="icon"
          >
            <Hammer className="w-7 h-7" />
          </Button>
        </motion.div>
      )}

      {/* Active build mode indicator */}
      {buildMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-600/50 rounded-lg px-2.5 py-1"
        >
          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
            {buildMode}
          </span>
          <button
            onClick={() => onSetBuildMode?.(null)}
            className="text-emerald-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* ─── Trade Button ─── */}
      {canTrade && isMyTurn && (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onTrade}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-2 border-blue-400 shadow-xl"
            size="icon"
          >
            <Handshake className="w-7 h-7" />
          </Button>
        </motion.div>
      )}

      {/* ─── End Turn Button ─── */}
      {canEndTurn && isMyTurn && (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onEndTurn}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-2 border-red-400 shadow-xl"
            size="icon"
          >
            <SkipForward className="w-7 h-7" />
          </Button>
        </motion.div>
      )}

      {/* ─── Not Your Turn ─── */}
      {!isMyTurn && (
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground text-center px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/50">
            Waiting for turn...
          </div>
          {/* Testing: Advance Turn Button */}
          <Button
            onClick={onAdvanceTurn}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border-2 border-purple-400 shadow-xl"
            size="icon"
          >
            <SkipForward className="w-7 h-7" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
