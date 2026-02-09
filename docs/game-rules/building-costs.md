# Building Costs & Resource Requirements

## Resource Types

| Resource | Color | Hex Symbol | Primary Use |
|---|---|---|---|
| **Brick** | Red | 🧱 | Roads, Settlements |
| **Lumber** | Green | 🌲 | Roads, Settlements |
| **Ore** | Gray | ⛏️ | Cities |
| **Grain** | Yellow | 🌾 | Settlements, Cities |
| **Wool** | White | 🐑 | Settlements |

## Building Costs

### Road
- **Cost**: 1 Brick + 1 Lumber
- **Victory Points**: 0
- **Maximum**: 15 per player
- **Rules**: Must connect to existing road or settlement

### Settlement
- **Cost**: 1 Brick + 1 Lumber + 1 Grain + 1 Wool
- **Victory Points**: 1 VP
- **Maximum**: 5 per player
- **Rules**: 
  - Must be at least 2 edges away from existing settlements
  - Must connect to player's road (except during setup)
  - Produces 1 resource per adjacent hex

### City
- **Cost**: 2 Grain + 3 Ore
- **Victory Points**: 2 VP (replaces settlement)
- **Maximum**: 5 per player (upgrades from settlements)
- **Rules**:
  - Must replace existing settlement
  - Produces 2 resources per adjacent hex
  - Counts as 2 VP (not 1 + 2)

## Cost Summary Table

| Structure | Brick | Lumber | Ore | Grain | Wool | VP |
|---|---|---|---|---|---|---|
| **Road** | 1 | 1 | 0 | 0 | 0 | 0 |
| **Settlement** | 1 | 1 | 0 | 1 | 1 | 1 |
| **City** | 0 | 0 | 3 | 2 | 0 | 2 |

## Resource Production

### Production Numbers
Hexes have number tokens from 2-12 (excluding 7). Production probability:

| Number | Dice Combinations | Probability |
|---|---|---|
| 2 | 1 (1+1) | 2.8% |
| 3 | 2 (1+2, 2+1) | 5.6% |
| 4 | 3 (1+3, 2+2, 3+1) | 8.3% |
| 5 | 4 (1+4, 2+3, 3+2, 4+1) | 11.1% |
| 6 | 5 (1+5, 2+4, 3+3, 4+2, 5+1) | 13.9% |
| 7 | 6 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) | 16.7% (Robber) |
| 8 | 5 (2+6, 3+5, 4+4, 5+3, 6+2) | 13.9% |
| 9 | 4 (3+6, 4+5, 5+4, 6+3) | 11.1% |
| 10 | 3 (4+6, 5+5, 6+4) | 8.3% |
| 11 | 2 (5+6, 6+5) | 5.6% |
| 12 | 1 (6+6) | 2.8% |

### Production Rules
- **Settlement**: 1 resource of each adjacent hex's type
- **City**: 2 resources of each adjacent hex's type
- **Desert**: Never produces resources
- **Robber**: Blocks production on its hex

### Example Production
```
Player has settlement on vertex touching:
- Brick hex (number 6)
- Grain hex (number 8)
- Wool hex (number 3)

Dice roll: 6
Player receives: 1 Brick

Dice roll: 8  
Player receives: 1 Grain

Dice roll: 3
Player receives: 1 Wool

If settlement was upgraded to city:
Dice roll: 6
Player receives: 2 Brick
```

## Trading Costs

### Bank Trading (4:1)
- Trade 4 identical resources for 1 of any other resource
- Available to all players at any time
- No ports required

### Port Trading (2:1 or 3:1)
- **2:1 Ports**: Trade 2 identical resources for 1 of any other resource
- **3:1 Ports**: Trade 3 identical resources for 1 of any other resource
- **Generic Port**: Trade 3 of any single resource for 1 of any other

### Port Types
| Port Type | Trade Ratio | Quantity on Board |
|---|---|---|
| Brick Port | 2:1 (Brick) | 1 |
| Lumber Port | 2:1 (Lumber) | 1 |
| Ore Port | 2:1 (Ore) | 1 |
| Grain Port | 2:1 (Grain) | 1 |
| Wool Port | 2:1 (Wool) | 1 |
| Generic Port | 3:1 (Any) | 4 |

## Resource Management Strategy

### Early Game (Setup - 3 VP)
**Priority**: Settlements and resource diversity
- Focus on building settlements to access all 5 resources
- Build roads toward new settlement locations
- Trade for missing resources to enable settlements

### Mid Game (4-7 VP)
**Priority**: Cities and longest road
- Upgrade key settlements to cities for double production
- Build road network to secure longest road
- Use ports for efficient trading

### Late Game (8-10 VP)
**Priority**: Victory points and winning
- Build final city if needed
- Secure longest road (2 VP)
- Block opponents from key resources
- Make strategic trades to reach 10 VP

## Resource Scarcity Analysis

### Common Resources
- **Grain & Wool**: Most abundant (4 hexes each)
- **Brick & Lumber**: Medium abundance (3 hexes each)
- **Ore**: Rarest (3 hexes, but crucial for cities)

### Strategic Considerations
- **Ore** becomes critical in mid-game for cities
- **Brick & Lumber** essential for early expansion
- **Grain & Wool** needed for settlements and cities
- **Desert** placement affects resource availability

## Building Validation Rules

### Settlement Placement Rules
```typescript
const validateSettlementPlacement = (
  board: Board,
  vertexId: number,
  playerIndex: number,
  isSetup: boolean = false
): boolean => {
  const vertex = board.vertices.find(v => v.id === vertexId);
  
  // Vertex must be empty
  if (vertex.building) return false;
  
  // No adjacent settlements (distance rule)
  for (const adjacentVertexId of vertex.adjacentVertices) {
    const adjacentVertex = board.vertices.find(v => v.id === adjacentVertexId);
    if (adjacentVertex.building) return false;
  }
  
  // During setup, no road connection required
  if (isSetup) return true;
  
  // During game, must connect to player's road
  return hasConnectedRoad(board, vertexId, playerIndex);
};
```

### Road Placement Rules
```typescript
const validateRoadPlacement = (
  board: Board,
  edgeId: number,
  playerIndex: number
): boolean => {
  const edge = board.edges.find(e => e.id === edgeId);
  
  // Edge must be empty
  if (edge.hasRoad) return false;
  
  // Must connect to player's settlement or existing road
  const [vertex1Id, vertex2Id] = edge.vertices;
  
  return hasPlayerSettlement(board, vertex1Id, playerIndex) ||
         hasPlayerSettlement(board, vertex2Id, playerIndex) ||
         hasConnectedRoad(board, vertex1Id, playerIndex) ||
         hasConnectedRoad(board, vertex2Id, playerIndex);
};
```

### City Upgrade Rules
```typescript
const validateCityUpgrade = (
  board: Board,
  vertexId: number,
  playerIndex: number
): boolean => {
  const vertex = board.vertices.find(v => v.id === vertexId);
  
  // Must have player's settlement
  if (!vertex.building || vertex.building !== "settlement") return false;
  if (vertex.ownerId !== playerIndex) return false;
  
  return true;
};
```

## Cost Validation Helper

```typescript
// Helper function to check if player can afford structure
export const canAfford = (
  player: GamePlayer,
  structure: "road" | "settlement" | "city"
): boolean => {
  const costs = {
    road: { brick: 1, lumber: 1, ore: 0, grain: 0, wool: 0 },
    settlement: { brick: 1, lumber: 1, ore: 0, grain: 1, wool: 1 },
    city: { brick: 0, lumber: 0, ore: 3, grain: 2, wool: 0 },
  };
  
  const cost = costs[structure];
  
  return Object.entries(cost).every(
    ([resource, amount]) => player.resources[resource] >= amount
  );
};

// Helper to deduct resources
export const deductResources = (
  player: GamePlayer,
  structure: "road" | "settlement" | "city"
): Resources => {
  const costs = {
    road: { brick: 1, lumber: 1, ore: 0, grain: 0, wool: 0 },
    settlement: { brick: 1, lumber: 1, ore: 0, grain: 1, wool: 1 },
    city: { brick: 0, lumber: 0, ore: 3, grain: 2, wool: 0 },
  };
  
  const cost = costs[structure];
  const newResources = { ...player.resources };
  
  Object.entries(cost).forEach(([resource, amount]) => {
    newResources[resource] -= amount;
  });
  
  return newResources;
};
```

This resource and cost system provides the foundation for all building and trading mechanics in Online Catan.
