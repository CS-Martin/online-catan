/**
 * Standard Catan board generation with proper shared vertices and edges.
 *
 * The board uses an axial coordinate system for hexes (row, col) with rows 0-4
 * having 3, 4, 5, 4, 3 hexes respectively. Vertices and edges are deduplicated
 * so that adjacent hexes share the same vertex/edge objects.
 *
 * Hex orientation: flat-top hexagons.
 * Vertex numbering per hex: 0=top, going clockwise (1=top-right, 2=bottom-right, 3=bottom, 4=bottom-left, 5=top-left).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

interface HexDef {
  id: number;
  row: number;
  col: number;
  resource: "brick" | "lumber" | "ore" | "grain" | "wool" | "desert";
  numberToken?: number;
  hasRobber: boolean;
}

interface VertexDef {
  id: number;
  building: undefined;
  ownerId: undefined;
  adjacentHexes: number[];
  adjacentVertices: number[];
  adjacentEdges: number[];
}

interface EdgeDef {
  id: number;
  hasRoad: false;
  ownerId: undefined;
  vertices: number[];
}

interface Board {
  hexes: HexDef[];
  vertices: VertexDef[];
  edges: EdgeDef[];
}

// ─── Layout Constants ────────────────────────────────────────────────────────

const ROW_SIZES = [3, 4, 5, 4, 3];

const HEX_LAYOUT: { row: number; col: number }[] = [];
for (let row = 0; row < ROW_SIZES.length; row++) {
  for (let col = 0; col < ROW_SIZES[row]; col++) {
    HEX_LAYOUT.push({ row, col });
  }
}

// ─── Coordinate Helpers ──────────────────────────────────────────────────────

/**
 * For a flat-top hex at (row, col), compute the pixel center.
 * We use these pixel positions to identify shared vertices by rounding.
 */
function hexCenter(
  row: number,
  col: number,
  size: number,
): { x: number; y: number } {
  const offsets = [1, 0.5, 0, 0.5, 1];
  const horizontalSpacing = size * Math.sqrt(3);
  const verticalSpacing = size * 1.5;
  const x = (col + offsets[row]) * horizontalSpacing;
  const y = row * verticalSpacing;
  return { x, y };
}

/**
 * Get the 6 corner positions of a flat-top hex centered at (cx, cy).
 * Index 0 = top, going clockwise.
 */
function hexCorners(
  cx: number,
  cy: number,
  size: number,
): { x: number; y: number }[] {
  const corners: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    // Start at top (i=0 → -90°), go clockwise
    const angleDeg = 60 * i - 90;
    const angleRad = (Math.PI / 180) * angleDeg;
    corners.push({
      x: cx + size * Math.cos(angleRad),
      y: cy + size * Math.sin(angleRad),
    });
  }
  return corners;
}

/**
 * Round a coordinate to a string key for deduplication.
 * We round to 1 decimal place to handle floating point imprecision.
 */
function posKey(x: number, y: number): string {
  return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
}

function edgeKey(vId1: number, vId2: number): string {
  const a = Math.min(vId1, vId2);
  const b = Math.max(vId1, vId2);
  return `${a}-${b}`;
}

// ─── Board Generation ────────────────────────────────────────────────────────

/**
 * Generates a complete standard Catan board with properly shared vertices and edges.
 */
export function generateStandardBoard() {
  console.log("=== NEW BOARD GENERATION VERSION 2 ===");
  const hexSize = 52; // Arbitrary, only used for topology computation

  // 1. Shuffle resources and number tokens
  const resources = shuffleArray([
    ...Array(4).fill("brick"),
    ...Array(4).fill("lumber"),
    ...Array(3).fill("ore"),
    ...Array(4).fill("grain"),
    ...Array(4).fill("wool"),
    "desert",
  ]) as HexDef["resource"][];

  const numbers = shuffleArray([
    2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12,
  ]);

  // 2. Create hex definitions
  let numberIdx = 0;
  const hexes: HexDef[] = HEX_LAYOUT.map((pos, index) => {
    const resource = resources[index];
    const numberToken =
      resource === "desert" ? undefined : numbers[numberIdx++];
    return {
      id: index,
      row: pos.row,
      col: pos.col,
      resource,
      numberToken,
      hasRobber: resource === "desert",
    };
  });

  // 3. Build vertex map by position deduplication
  const vertexByPos = new Map<string, number>(); // posKey → vertexId
  const vertices: VertexDef[] = [];
  // hexVertexIds[hexId][cornerIndex] = vertexId
  const hexVertexIds: number[][] = [];

  for (const hex of hexes) {
    const center = hexCenter(hex.row, hex.col, hexSize);
    const corners = hexCorners(center.x, center.y, hexSize);
    const vertexIds: number[] = [];

    for (let i = 0; i < 6; i++) {
      const key = posKey(corners[i].x, corners[i].y);
      let vId = vertexByPos.get(key);

      if (vId === undefined) {
        vId = vertices.length;
        vertexByPos.set(key, vId);
        vertices.push({
          id: vId,
          building: undefined,
          ownerId: undefined,
          adjacentHexes: [hex.id],
          adjacentVertices: [],
          adjacentEdges: [],
        });
      } else {
        // Vertex already exists from a neighboring hex — add this hex as adjacent
        if (!vertices[vId].adjacentHexes.includes(hex.id)) {
          vertices[vId].adjacentHexes.push(hex.id);
        }
      }

      vertexIds.push(vId);
    }

    hexVertexIds.push(vertexIds);
  }

  // 4. Build edge map by vertex-pair deduplication
  const edgeByVertices = new Map<string, number>(); // edgeKey → edgeId
  const edges: EdgeDef[] = [];

  for (let hexIdx = 0; hexIdx < hexes.length; hexIdx++) {
    const vIds = hexVertexIds[hexIdx];
    for (let i = 0; i < 6; i++) {
      const v1 = vIds[i];
      const v2 = vIds[(i + 1) % 6];
      const key = edgeKey(v1, v2);

      if (!edgeByVertices.has(key)) {
        const eId = edges.length;
        edgeByVertices.set(key, eId);
        edges.push({
          id: eId,
          hasRoad: false,
          ownerId: undefined,
          vertices: [v1, v2],
        });
      }
    }
  }

  // 5. Compute adjacentVertices and adjacentEdges for each vertex
  for (const edge of edges) {
    const [v1, v2] = edge.vertices;

    // Adjacent vertices
    if (!vertices[v1].adjacentVertices.includes(v2)) {
      vertices[v1].adjacentVertices.push(v2);
    }
    if (!vertices[v2].adjacentVertices.includes(v1)) {
      vertices[v2].adjacentVertices.push(v1);
    }

    // Adjacent edges
    if (!vertices[v1].adjacentEdges.includes(edge.id)) {
      vertices[v1].adjacentEdges.push(edge.id);
    }
    if (!vertices[v2].adjacentEdges.includes(edge.id)) {
      vertices[v2].adjacentEdges.push(edge.id);
    }
  }

  // Debug: Log the final state
  console.log("=== BOARD GENERATION COMPLETE ===");
  console.log("Vertices:", vertices.length);
  console.log("Edges:", edges.length);
  console.log("Sample vertex adjacentEdges:", vertices[0]?.adjacentEdges);
  console.log("Sample edge vertices:", edges[0]?.vertices);
  console.log(
    "All vertex adjacentEdges lengths:",
    vertices.map((v) => v.adjacentEdges.length),
  );
  console.log("===================================");

  return { hexes, vertices, edges };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
