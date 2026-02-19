"use client";

import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Hex {
  id: number;
  row: number;
  col: number;
  resource: "brick" | "lumber" | "ore" | "grain" | "wool" | "desert";
  numberToken?: number;
  hasRobber: boolean;
}

interface Vertex {
  id: number;
  building?: "settlement" | "city";
  ownerId?: number;
  adjacentHexes: number[];
  adjacentVertices: number[];
  adjacentEdges: number[];
}

interface Edge {
  id: number;
  hasRoad: boolean;
  ownerId?: number;
  vertices: number[];
}

interface GamePlayer {
  playerIndex: number;
  color: "red" | "blue" | "white" | "orange";
  displayName: string;
}

type BuildMode = "settlement" | "road" | "city" | null;

interface HexBoardProps {
  hexes: Hex[];
  vertices: Vertex[];
  edges: Edge[];
  players: GamePlayer[];
  buildMode?: BuildMode;
  selectedVertexId?: number;
  isSetupPhase?: boolean;
  onHexClick?: (hexId: number) => void;
  onVertexClick?: (vertexId: number) => void;
  onEdgeClick?: (edgeId: number) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Resource visual styles — gradient fills and icons for each terrain type
 */
const RESOURCE_STYLES: Record<
  string,
  {
    fill: string;
    fillDark: string;
    stroke: string;
    pattern: string;
    icon: string;
  }
> = {
  brick: {
    fill: "#c9613b",
    fillDark: "#a04520",
    stroke: "#8b3518",
    pattern: "brick",
    icon: "🧱",
  },
  lumber: {
    fill: "#3a7d2c",
    fillDark: "#1e5a14",
    stroke: "#164a0e",
    pattern: "lumber",
    icon: "🌲",
  },
  ore: {
    fill: "#7a7a7a",
    fillDark: "#505050",
    stroke: "#3a3a3a",
    pattern: "ore",
    icon: "⛰️",
  },
  grain: {
    fill: "#dbb42c",
    fillDark: "#b8940f",
    stroke: "#8a6e0a",
    pattern: "grain",
    icon: "🌾",
  },
  wool: {
    fill: "#8fbc5a",
    fillDark: "#6f9c3a",
    stroke: "#4f7c2a",
    pattern: "wool",
    icon: "🐑",
  },
  desert: {
    fill: "#d4c08a",
    fillDark: "#c4a86a",
    stroke: "#a08850",
    pattern: "desert",
    icon: "🏜️",
  },
};

const PLAYER_COLORS: Record<
  string,
  { fill: string; stroke: string; glow: string }
> = {
  red: { fill: "#ef4444", stroke: "#991b1b", glow: "rgba(239,68,68,0.5)" },
  blue: { fill: "#3b82f6", stroke: "#1e3a8a", glow: "rgba(59,130,246,0.5)" },
  white: { fill: "#e5e7eb", stroke: "#6b7280", glow: "rgba(229,231,235,0.5)" },
  orange: { fill: "#f97316", stroke: "#9a3412", glow: "rgba(249,115,22,0.5)" },
};

/**
 * Standard Catan board layout offsets per row
 */
const ROW_OFFSETS = [1, 0.5, 0, 0.5, 1];

/**
 * Water hex positions surrounding the land board.
 * Uses the same (row, col) + offset coordinate system as land hexes,
 * but extends one ring outward.
 */
const WATER_HEX_OFFSETS: Record<number, number> = {
  [-1]: 0.5,
  0: 1,
  1: 0.5,
  2: 0,
  3: 0.5,
  4: 1,
  5: 0.5,
};

const WATER_HEXES: { row: number; col: number }[] = [
  // Top row (above row 0, which has 3 hexes offset by 1)
  { row: -1, col: 0 },
  { row: -1, col: 1 },
  { row: -1, col: 2 },
  { row: -1, col: 3 },
  // Left and right of row 0 (3 hexes, cols 0-2)
  { row: 0, col: -1 },
  { row: 0, col: 3 },
  // Left and right of row 1 (4 hexes, cols 0-3)
  { row: 1, col: -1 },
  { row: 1, col: 4 },
  // Left and right of row 2 (5 hexes, cols 0-4)
  { row: 2, col: -1 },
  { row: 2, col: 5 },
  // Left and right of row 3 (4 hexes, cols 0-3)
  { row: 3, col: -1 },
  { row: 3, col: 4 },
  // Left and right of row 4 (3 hexes, cols 0-2)
  { row: 4, col: -1 },
  { row: 4, col: 3 },
  // Bottom row (below row 4, which has 3 hexes offset by 1)
  { row: 5, col: 0 },
  { row: 5, col: 1 },
  { row: 5, col: 2 },
  { row: 5, col: 3 },
];

/**
 * Number token probability dots
 */
const PROBABILITY_DOTS: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};

// ─── Geometry Helpers ────────────────────────────────────────────────────────

function getHexCenter(hex: Hex, hexSize: number): { x: number; y: number } {
  const offset = ROW_OFFSETS[hex.row] ?? 0;
  const horizontalSpacing = hexSize * Math.sqrt(3);
  const verticalSpacing = hexSize * 1.5;
  return {
    x: (hex.col + offset) * horizontalSpacing,
    y: hex.row * verticalSpacing,
  };
}

function getWaterHexCenter(
  row: number,
  col: number,
  hexSize: number,
): { x: number; y: number } {
  const offset = WATER_HEX_OFFSETS[row] ?? 0;
  const horizontalSpacing = hexSize * Math.sqrt(3);
  const verticalSpacing = hexSize * 1.5;
  return {
    x: (col + offset) * horizontalSpacing,
    y: row * verticalSpacing,
  };
}

/**
 * Flat-top hexagon corners. Index 0 = top, clockwise.
 */
function getHexCorners(
  cx: number,
  cy: number,
  size: number,
): { x: number; y: number }[] {
  const corners: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 90;
    const angleRad = (Math.PI / 180) * angleDeg;
    corners.push({
      x: cx + size * Math.cos(angleRad),
      y: cy + size * Math.sin(angleRad),
    });
  }
  return corners;
}

function cornersToPoints(corners: { x: number; y: number }[]): string {
  return corners.map((c) => `${c.x},${c.y}`).join(" ");
}

function posKey(x: number, y: number): string {
  return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders the hexagonal Catan game board with ocean border, resource tiles,
 * number tokens, buildings, and roads in a style inspired by Catan Universe.
 */
export function HexBoard({
  hexes,
  vertices,
  edges,
  players,
  buildMode = null,
  selectedVertexId,
  isSetupPhase = false,
  onHexClick,
  onVertexClick,
  onEdgeClick,
}: HexBoardProps) {
  const hexSize = 52;

  console.log(
    "HexBoard render - onHexClick:",
    !!onHexClick,
    "hexes count:",
    hexes.length,
  );

  // Pre-compute hex centers
  const hexCenters = useMemo(
    () => hexes.map((hex) => ({ hex, ...getHexCenter(hex, hexSize) })),
    [hexes],
  );

  // Pre-compute water hex centers
  const waterHexCenters = useMemo(
    () =>
      WATER_HEXES.map((wh) => ({
        row: wh.row,
        col: wh.col,
        ...getWaterHexCenter(wh.row, wh.col, hexSize),
      })),
    [],
  );

  // Pre-compute vertex positions by replicating the board generation algorithm.
  // Board generation iterates hexes in id-order, computes 6 corners per hex,
  // and deduplicates by rounded position key — assigning vertex IDs sequentially.
  // We replay that exact process to recover each vertex's pixel position.
  const vertexPositions = useMemo(() => {
    const vertexPosById = new Map<number, { x: number; y: number }>();
    const posToId = new Map<string, number>();
    let nextId = 0;

    // Iterate hexes in id-order (same order as board generation)
    const sortedHexCenters = [...hexCenters].sort(
      (a, b) => a.hex.id - b.hex.id,
    );

    for (const { x: cx, y: cy } of sortedHexCenters) {
      const corners = getHexCorners(cx, cy, hexSize);
      for (let i = 0; i < 6; i++) {
        const key = posKey(corners[i].x, corners[i].y);
        if (!posToId.has(key)) {
          const vId = nextId++;
          posToId.set(key, vId);
          vertexPosById.set(vId, { x: corners[i].x, y: corners[i].y });
        }
      }
    }

    return vertexPosById;
  }, [hexCenters]);

  // SVG viewBox (includes water hexes)
  const viewBox = useMemo(() => {
    if (hexCenters.length === 0) return "0 0 500 500";
    const allXs = [
      ...hexCenters.map((h) => h.x),
      ...waterHexCenters.map((w) => w.x),
    ];
    const allYs = [
      ...hexCenters.map((h) => h.y),
      ...waterHexCenters.map((w) => w.y),
    ];
    const padding = hexSize * 1.5;
    const minX = Math.min(...allXs) - padding;
    const maxX = Math.max(...allXs) + padding;
    const minY = Math.min(...allYs) - padding;
    const maxY = Math.max(...allYs) + padding;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [hexCenters, waterHexCenters]);

  // Board center for ocean background
  const boardCenter = useMemo(() => {
    if (hexCenters.length === 0) return { x: 250, y: 250 };
    const xs = hexCenters.map((h) => h.x);
    const ys = hexCenters.map((h) => h.y);
    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    };
  }, [hexCenters]);

  const getVertexPos = useCallback(
    (vertexId: number) => vertexPositions.get(vertexId) ?? { x: 0, y: 0 },
    [vertexPositions],
  );

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={viewBox}
        className="w-full h-full cursor-pointer"
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          // Log SVG click for debugging
          console.log("SVG clicked directly", e);
          if (onHexClick) {
            console.log("onHexClick is available");
          }
        }}
      >
        <defs>
          {/* Ocean gradient */}
          <radialGradient id="oceanGradient" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="60%" stopColor="#1e40af" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.7} />
          </radialGradient>

          {/* Water hex gradient */}
          <linearGradient id="grad-water" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Resource gradients */}
          {Object.entries(RESOURCE_STYLES).map(([key, style]) => (
            <linearGradient
              key={key}
              id={`grad-${key}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={style.fill} />
              <stop offset="100%" stopColor={style.fillDark} />
            </linearGradient>
          ))}

          {/* Hex shadow filter */}
          <filter id="hexShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#000"
              floodOpacity="0.3"
            />
          </filter>

          {/* Building glow filter */}
          <filter
            id="buildingGlow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Number token shadow */}
          <filter id="tokenShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              floodColor="#000"
              floodOpacity="0.4"
            />
          </filter>

          {/* Water hex shadow - elevated look on table */}
          <filter id="waterShadow" x="-15%" y="-10%" width="130%" height="130%">
            <feDropShadow
              dx="2"
              dy="4"
              stdDeviation="4"
              floodColor="#000"
              floodOpacity="0.45"
            />
          </filter>
        </defs>

        {/* ─── Water Hexes ─── */}
        {waterHexCenters.map(({ row, col, x, y }, index) => {
          const corners = getHexCorners(x, y, hexSize);
          const innerCorners = getHexCorners(x, y, hexSize * 0.92);
          return (
            <motion.g
              key={`water-${row}-${col}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.02,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              {/* Outer hex */}
              <polygon
                points={cornersToPoints(corners)}
                fill="url(#grad-water)"
                stroke="#1e40af"
                strokeWidth={2}
                opacity={0.7}
                filter="url(#waterShadow)"
              />
              {/* Inner hex border */}
              <polygon
                points={cornersToPoints(innerCorners)}
                fill="none"
                stroke="#60a5fa"
                strokeWidth={0.6}
                opacity={0.2}
              />
              {/* Wave icon */}
              <text
                x={x}
                y={y + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={16}
                opacity={0.3}
              >
                🌊
              </text>
            </motion.g>
          );
        })}

        {/* ─── Hex Tiles ─── */}
        {hexCenters.map(({ hex, x, y }, index) => {
          const style = RESOURCE_STYLES[hex.resource];
          const corners = getHexCorners(x, y, hexSize);
          const innerCorners = getHexCorners(x, y, hexSize * 0.92);
          const isHighProb = hex.numberToken === 6 || hex.numberToken === 8;

          return (
            <motion.g
              key={hex.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.025,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              onClick={() => onHexClick?.(hex.id)}
              style={{
                cursor: onHexClick ? "pointer" : "default",
                pointerEvents: "auto",
              }}
              onMouseEnter={(e) => {
                if (onHexClick) {
                  console.log("Mouse entered hex:", hex.id);
                  e.currentTarget.style.opacity = "0.8";
                }
              }}
              onMouseLeave={(e) => {
                if (onHexClick) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              {/* Outer hex (border/shadow) */}
              <polygon
                points={cornersToPoints(corners)}
                fill={`url(#grad-${hex.resource})`}
                stroke={style.stroke}
                strokeWidth={2.5}
                filter="url(#hexShadow)"
              />

              {/* Inner hex (texture overlay) */}
              <polygon
                points={cornersToPoints(innerCorners)}
                fill="none"
                stroke={style.stroke}
                strokeWidth={0.8}
                opacity={0.25}
              />

              {/* Resource icon (subtle, behind number) */}
              {hex.resource !== "desert" && !hex.hasRobber && (
                <text
                  x={x}
                  y={y - 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={14}
                  opacity={0.4}
                >
                  {style.icon}
                </text>
              )}

              {/* Number token */}
              {hex.numberToken && !hex.hasRobber && (
                <g filter="url(#tokenShadow)">
                  {/* Token circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={15}
                    fill="#fef9e7"
                    stroke={isHighProb ? "#dc2626" : "#92400e"}
                    strokeWidth={isHighProb ? 2 : 1.5}
                  />

                  {/* Number */}
                  <text
                    x={x}
                    y={y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isHighProb ? 16 : 13}
                    fontWeight="bold"
                    fontFamily="serif"
                    fill={isHighProb ? "#dc2626" : "#1f2937"}
                  >
                    {hex.numberToken}
                  </text>

                  {/* Probability dots */}
                  {PROBABILITY_DOTS[hex.numberToken] && (
                    <text
                      x={x}
                      y={y + 11}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={4}
                      fill={isHighProb ? "#dc2626" : "#78716c"}
                    >
                      {"●".repeat(PROBABILITY_DOTS[hex.numberToken])}
                    </text>
                  )}
                </g>
              )}

              {/* Robber */}
              {hex.hasRobber && (
                <g>
                  <circle cx={x} cy={y} r={14} fill="#1f2937" opacity={0.85} />
                  <text
                    x={x}
                    y={y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={18}
                  >
                    🏴‍☠️
                  </text>
                </g>
              )}
            </motion.g>
          );
        })}

        {/* ─── Roads (edges) ─── */}
        {edges.map((edge) => {
          if (!edge.hasRoad || edge.ownerId === undefined) return null;

          const player = players.find((p) => p.playerIndex === edge.ownerId);
          if (!player) return null;

          const colors = PLAYER_COLORS[player.color];
          const p1 = getVertexPos(edge.vertices[0]);
          const p2 = getVertexPos(edge.vertices[1]);

          return (
            <motion.g key={`e-${edge.id}`}>
              {/* Road shadow */}
              <line
                x1={p1.x}
                y1={p1.y + 1.5}
                x2={p2.x}
                y2={p2.y + 1.5}
                stroke="#000"
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.3}
              />
              {/* Road */}
              <motion.line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={colors.fill}
                strokeWidth={5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4 }}
              />
              {/* Road highlight */}
              <line
                x1={p1.x}
                y1={p1.y - 1}
                x2={p2.x}
                y2={p2.y - 1}
                stroke="#fff"
                strokeWidth={1.5}
                strokeLinecap="round"
                opacity={0.2}
              />
            </motion.g>
          );
        })}

        {/* ─── Clickable edge targets (build mode) ─── */}
        {(buildMode === "road" || selectedVertexId !== undefined) &&
          edges
            .filter((e) => !e.hasRoad)
            .map((edge) => {
              const p1 = getVertexPos(edge.vertices[0]);
              const p2 = getVertexPos(edge.vertices[1]);
              if (p1.x === 0 && p1.y === 0) return null;

              // During setup, only show edges connected to selected vertex
              const isSetupEdge =
                selectedVertexId !== undefined &&
                edge.vertices.includes(selectedVertexId);

              // During normal build mode, show all edges
              const isBuildEdge = buildMode === "road";

              if (!isSetupEdge && !isBuildEdge) return null;

              console.log(
                "Rendering edge target:",
                edge.id,
                "vertices:",
                edge.vertices,
                "selectedVertexId:",
                selectedVertexId,
                "isSetupEdge:",
                isSetupEdge,
              );

              return (
                <line
                  key={`ec-${edge.id}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isSetupEdge ? "#3b82f6" : "#22c55e"}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={isSetupEdge ? 0.25 : 0.15}
                  className="cursor-pointer hover:opacity-60 transition-opacity"
                  onClick={() => onEdgeClick?.(edge.id)}
                />
              );
            })}

        {/* ─── Buildings (vertices) ─── */}
        {vertices.map((vertex) => {
          if (!vertex.building || vertex.ownerId === undefined) return null;

          const player = players.find((p) => p.playerIndex === vertex.ownerId);
          if (!player) return null;

          const colors = PLAYER_COLORS[player.color];
          const pos = getVertexPos(vertex.id);

          if (vertex.building === "settlement") {
            return (
              <motion.g
                key={`v-${vertex.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                filter="url(#buildingGlow)"
              >
                {/* Settlement shadow */}
                <polygon
                  points={`${pos.x},${pos.y - 9} ${pos.x - 8},${pos.y - 2} ${pos.x - 8},${pos.y + 8} ${pos.x + 8},${pos.y + 8} ${pos.x + 8},${pos.y - 2}`}
                  fill="#000"
                  opacity={0.3}
                  transform={`translate(1, 1.5)`}
                />
                {/* Settlement body */}
                <polygon
                  points={`${pos.x},${pos.y - 10} ${pos.x - 8},${pos.y - 3} ${pos.x - 8},${pos.y + 7} ${pos.x + 8},${pos.y + 7} ${pos.x + 8},${pos.y - 3}`}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={1.5}
                />
                {/* Settlement highlight */}
                <line
                  x1={pos.x - 6}
                  y1={pos.y - 1}
                  x2={pos.x - 6}
                  y2={pos.y + 5}
                  stroke="#fff"
                  strokeWidth={1.5}
                  opacity={0.3}
                />
              </motion.g>
            );
          }

          if (vertex.building === "city") {
            return (
              <motion.g
                key={`v-${vertex.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                filter="url(#buildingGlow)"
              >
                {/* City shadow */}
                <rect
                  x={pos.x - 10}
                  y={pos.y - 8}
                  width={20}
                  height={18}
                  rx={2}
                  fill="#000"
                  opacity={0.3}
                  transform="translate(1, 1.5)"
                />
                {/* City base */}
                <rect
                  x={pos.x - 10}
                  y={pos.y - 8}
                  width={20}
                  height={18}
                  rx={2}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={1.5}
                />
                {/* City tower */}
                <polygon
                  points={`${pos.x - 4},${pos.y - 8} ${pos.x},${pos.y - 16} ${pos.x + 4},${pos.y - 8}`}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={1.5}
                />
                {/* City highlight */}
                <line
                  x1={pos.x - 8}
                  y1={pos.y - 5}
                  x2={pos.x - 8}
                  y2={pos.y + 7}
                  stroke="#fff"
                  strokeWidth={1.5}
                  opacity={0.3}
                />
              </motion.g>
            );
          }

          return null;
        })}

        {/* ─── Clickable vertex targets (build mode) ─── */}
        {(buildMode === "settlement" ||
          buildMode === "city" ||
          selectedVertexId !== undefined ||
          isSetupPhase) &&
          vertices
            .filter((v) => {
              if (buildMode === "settlement" || isSetupPhase) {
                // Must be empty
                if (v.building) return false;
                // Distance rule: no adjacent vertex can have a building
                for (const adjId of v.adjacentVertices) {
                  const adj = vertices.find((u) => u.id === adjId);
                  if (adj && adj.building) return false;
                }
                return true;
              }
              if (buildMode === "city") return v.building === "settlement";
              // When vertex is selected (edge selection step), only show empty vertices
              return !v.building;
            })
            .map((vertex) => {
              const pos = getVertexPos(vertex.id);
              if (pos.x === 0 && pos.y === 0) {
                console.log("Skipping vertex with no position:", vertex.id);
                return null;
              }

              const isSelected = vertex.id === selectedVertexId;

              return (
                <motion.circle
                  key={`vc-${vertex.id}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={10}
                  fill={isSelected ? "#3b82f6" : "#22c55e"}
                  opacity={isSelected ? 0.4 : 0.2}
                  className="cursor-pointer hover:opacity-60 transition-opacity"
                  onClick={() => onVertexClick?.(vertex.id)}
                  animate={{
                    scale: isSelected ? [1, 1.3, 1] : [1, 1.2, 1],
                    opacity: isSelected ? [0.4, 0.6, 0.4] : [0.2, 0.3, 0.2],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              );
            })}
      </svg>
    </div>
  );
}
