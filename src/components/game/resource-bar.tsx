"use client";

import { motion } from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Resource card visual definitions with colors matching the hex tiles
 */
const RESOURCES = [
  {
    key: "brick",
    label: "Brick",
    icon: "🧱",
    color: "text-red-400",
    bg: "from-red-900/60 to-red-950/80",
    border: "border-red-700/50",
    glow: "hover:border-red-500/60 hover:shadow-red-500/20",
  },
  {
    key: "lumber",
    label: "Lumber",
    icon: "🌲",
    color: "text-green-400",
    bg: "from-green-900/60 to-green-950/80",
    border: "border-green-700/50",
    glow: "hover:border-green-500/60 hover:shadow-green-500/20",
  },
  {
    key: "ore",
    label: "Ore",
    icon: "⛰️",
    color: "text-gray-300",
    bg: "from-gray-800/60 to-gray-900/80",
    border: "border-gray-600/50",
    glow: "hover:border-gray-400/60 hover:shadow-gray-400/20",
  },
  {
    key: "grain",
    label: "Grain",
    icon: "🌾",
    color: "text-yellow-400",
    bg: "from-yellow-900/60 to-yellow-950/80",
    border: "border-yellow-700/50",
    glow: "hover:border-yellow-500/60 hover:shadow-yellow-500/20",
  },
  {
    key: "wool",
    label: "Wool",
    icon: "🐑",
    color: "text-emerald-400",
    bg: "from-emerald-900/60 to-emerald-950/80",
    border: "border-emerald-700/50",
    glow: "hover:border-emerald-500/60 hover:shadow-emerald-500/20",
  },
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface ResourceBarProps {
  resources: {
    brick: number;
    lumber: number;
    ore: number;
    grain: number;
    wool: number;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Bottom bar showing the current player's resource cards.
 * Each resource is displayed as a card with icon, count, and label.
 */
export function ResourceBar({ resources }: ResourceBarProps) {
  const total = Object.values(resources).reduce((s, v) => s + v, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end justify-center gap-2"
    >
      {RESOURCES.map((res, i) => {
        const count = resources[res.key];
        const hasAny = count > 0;

        return (
          <motion.div
            key={res.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -6, scale: 1.05 }}
            className={`
              relative flex flex-col items-center gap-0.5
              bg-gradient-to-b ${res.bg}
              backdrop-blur-sm border ${res.border} ${res.glow}
              rounded-xl px-4 py-2.5 min-w-[72px]
              shadow-lg transition-all duration-200
              ${hasAny ? "opacity-100" : "opacity-50"}
            `}
          >
            {/* Count badge */}
            {hasAny && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center shadow-md">
                <span className={`text-xs font-bold ${res.color}`}>
                  {count}
                </span>
              </div>
            )}

            <span className="text-2xl leading-none">{res.icon}</span>
            <span className={`text-sm font-bold tabular-nums ${res.color}`}>
              {count}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {res.label}
            </span>
          </motion.div>
        );
      })}

      {/* Total card count */}
      <div className="flex flex-col items-center justify-center ml-2 px-3 py-2 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl min-w-[50px]">
        <span className="text-xs text-slate-500 uppercase tracking-wider">
          Total
        </span>
        <span className="text-lg font-bold text-slate-300 tabular-nums">
          {total}
        </span>
      </div>
    </motion.div>
  );
}
