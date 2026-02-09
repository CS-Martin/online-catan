# Convex Schema Definition

## Complete Database Schema

This document contains the full Convex schema for Online Catan with all tables, fields, validators, and indexes.

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Import table definitions
import { users } from "./users/user.model";
import { lobbies } from "./lobbies/lobby.model";
import { lobbyPlayers } from "./lobbies/lobbyPlayer.model";
import { games } from "./games/game.model";
import { gamePlayers } from "./games/gamePlayer.model";
import { tradeOffers } from "./trades/tradeOffer.model";
import { gameLogs } from "./gameLogs/gameLog.model";

export default defineSchema({
  users,
  lobbies,
  lobbyPlayers,
  games,
  gamePlayers,
  tradeOffers,
  gameLogs,
});
```

## Table Definitions

### Users Table

```typescript
// convex/users/user.model.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const users = defineTable({
  clerkId: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  imageUrl: v.optional(v.string()),
  phone: v.optional(v.string()),
  // Game-specific fields
  displayName: v.optional(v.string()),
  gamesPlayed: v.optional(v.number()),
  gamesWon: v.optional(v.number()),
  elo: v.optional(v.number()),
})
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"])
  .index("by_displayName", ["displayName"]);
```

### Lobbies Table

```typescript
// convex/lobbies/lobby.model.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const lobbies = defineTable({
  hostId: v.id("users"),
  name: v.string(),
  status: v.union(
    v.literal("waiting"),
    v.literal("starting"),
    v.literal("in_game"),
    v.literal("closed"),
  ),
  maxPlayers: v.number(), // 2–4
  isPrivate: v.boolean(),
  inviteCode: v.optional(v.string()),
  gameId: v.optional(v.id("games")),
})
  .index("by_status", ["status"])
  .index("by_hostId", ["hostId"])
  .index("by_inviteCode", ["inviteCode"]);
```

### Lobby Players Table

```typescript
// convex/lobbies/lobbyPlayer.model.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const lobbyPlayers = defineTable({
  lobbyId: v.id("lobbies"),
  userId: v.optional(v.id("users")), // null for AI
  isAI: v.boolean(),
  aiDifficulty: v.optional(
    v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  ),
  color: v.string(), // "red", "blue", "white", "orange"
  isReady: v.boolean(),
  joinedAt: v.number(),
})
  .index("by_lobbyId", ["lobbyId"])
  .index("by_userId", ["userId"])
  .index("by_lobbyId_and_userId", ["lobbyId", "userId"]);
```

### Games Table

```typescript
// convex/games/game.model.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const games = defineTable({
  lobbyId: v.id("lobbies"),
  status: v.union(
    v.literal("setup"), // initial placement phase
    v.literal("active"), // main game loop
    v.literal("finished"),
  ),
  currentPlayerIndex: v.number(),
  turnNumber: v.number(),
  phase: v.union(
    v.literal("setup_forward"), // 1st round placement (clockwise)
    v.literal("setup_reverse"), // 2nd round placement (counter-clockwise)
    v.literal("roll_dice"),
    v.literal("robber_move"), // when 7 is rolled
    v.literal("robber_steal"),
    v.literal("discard"), // players with >7 cards discard
    v.literal("trade_build"), // main action phase
    v.literal("game_over"),
  ),
  diceRoll: v.optional(v.array(v.number())), // [die1, die2]
  winnerId: v.optional(v.id("users")),
  board: v.object({
    hexes: v.array(
      v.object({
        id: v.number(),
        row: v.number(),
        col: v.number(),
        resource: v.union(
          v.literal("brick"),
          v.literal("lumber"),
          v.literal("ore"),
          v.literal("grain"),
          v.literal("wool"),
          v.literal("desert"),
        ),
        numberToken: v.optional(v.number()), // 2–12, null for desert
        hasRobber: v.boolean(),
      }),
    ),
    vertices: v.array(
      v.object({
        id: v.number(),
        building: v.optional(
          v.union(v.literal("settlement"), v.literal("city")),
        ),
        ownerId: v.optional(v.number()), // playerIndex
        adjacentHexes: v.array(v.number()), // hex ids
        adjacentVertices: v.array(v.number()),
        adjacentEdges: v.array(v.number()),
      }),
    ),
    edges: v.array(
      v.object({
        id: v.number(),
        hasRoad: v.boolean(),
        ownerId: v.optional(v.number()), // playerIndex
        vertices: v.array(v.number()), // [vertexId1, vertexId2]
      }),
    ),
  }),
})
  .index("by_lobbyId", ["lobbyId"])
  .index("by_status", ["status"])
  .index("by_currentPlayer", ["currentPlayerIndex"]);
```

### Game Players Table

```typescript
// convex/games/gamePlayer.model.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const gamePlayers = defineTable({
  gameId: v.id("games"),
  userId: v.optional(v.id("users")),
  playerIndex: v.number(), // 0–3, determines turn order
  isAI: v.boolean(),
  aiDifficulty: v.optional(v.string()),
  color: v.string(),
  displayName: v.string(),
  resources: v.object({
    brick: v.number(),
    lumber: v.number(),
    ore: v.number(),
    grain: v.number(),
    wool: v.number(),
  }),
  victoryPoints: v.number(),
  roadsBuilt: v.number(),
  settlementsBuilt: v.number(),
  citiesBuilt: v.number(),
  longestRoadLength: v.number(),
  hasLongestRoad: v.boolean(),
})
  .index("by_gameId", ["gameId"])
  .index("by_gameId_and_playerIndex", ["gameId", "playerIndex"])
  .index("by_userId", ["userId"]);
```

### Trade Offers Table

```typescript
// convex/trades/tradeOffer.model.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tradeOffers = defineTable({
  gameId: v.id("games"),
  offeredByIndex: v.number(),
  offering: v.object({
    brick: v.number(),
    lumber: v.number(),
    ore: v.number(),
    grain: v.number(),
    wool: v.number(),
  }),
  requesting: v.object({
    brick: v.number(),
    lumber: v.number(),
    ore: v.number(),
    grain: v.number(),
    wool: v.number(),
  }),
  status: v.union(
    v.literal("open"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("cancelled"),
  ),
  targetPlayerIndex: v.optional(v.number()), // null = open to all
  respondedByIndex: v.optional(v.number()),
})
  .index("by_gameId", ["gameId"])
  .index("by_gameId_and_status", ["gameId", "status"])
  .index("by_offeredBy", ["offeredByIndex"]);
```

### Game Logs Table

```typescript
// convex/gameLogs/gameLog.model.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const gameLogs = defineTable({
  gameId: v.id("games"),
  turnNumber: v.number(),
  playerIndex: v.number(),
  action: v.string(), // "roll_dice", "build_road", "trade", etc.
  details: v.optional(v.any()),
  timestamp: v.number(),
})
  .index("by_gameId", ["gameId"])
  .index("by_gameId_and_turn", ["gameId", "turnNumber"])
  .index("by_timestamp", ["timestamp"]);
```

## Index Strategy

### Performance-Critical Queries

#### Game State Queries

```typescript
// Get current game state
ctx.db
  .query("games")
  .filter((q) => q.eq(q.field("gameId"), gameId))
  .first();

// Get all players in a game
ctx.db
  .query("gamePlayers")
  .filter((q) => q.eq(q.field("gameId"), gameId))
  .collect();

// Get current player's resources
ctx.db
  .query("gamePlayers")
  .filter((q) => q.eq(q.field("gameId"), gameId))
  .filter((q) => q.eq(q.field("playerIndex"), playerIndex))
  .first();
```

#### Lobby System Queries

```typescript
// Get available lobbies
ctx.db
  .query("lobbies")
  .filter((q) => q.eq(q.field("status"), "waiting"))
  .collect();

// Get players in a lobby
ctx.db
  .query("lobbyPlayers")
  .filter((q) => q.eq(q.field("lobbyId"), lobbyId))
  .collect();

// Check if user is in lobby
ctx.db
  .query("lobbyPlayers")
  .filter((q) => q.eq(q.field("lobbyId"), lobbyId))
  .filter((q) => q.eq(q.field("userId"), userId))
  .first();
```

#### Trade System Queries

```typescript
// Get active trade offers
ctx.db
  .query("tradeOffers")
  .filter((q) => q.eq(q.field("gameId"), gameId))
  .filter((q) => q.eq(q.field("status"), "open"))
  .collect();

// Get trades offered by specific player
ctx.db
  .query("tradeOffers")
  .filter((q) => q.eq(q.field("gameId"), gameId))
  .filter((q) => q.eq(q.field("offeredByIndex"), playerIndex))
  .collect();
```

### Index Optimization Guidelines

1. **Compound Indexes**: For frequently queried field combinations
2. **Selectivity**: Most selective fields first in compound indexes
3. **Query Patterns**: Index based on actual query patterns, not theoretical ones
4. **Write Performance**: Balance read optimization with write overhead

## Data Validation

### Resource Validation

```typescript
const resourceSchema = v.object({
  brick: v.number(),
  lumber: v.number(),
  ore: v.number(),
  grain: v.number(),
  wool: v.number(),
});

// Custom validation for non-negative resources
const validateResources = (resources: any) => {
  return Object.values(resources).every((val) => val >= 0);
};
```

### Board Validation

```typescript
// Hex coordinates must be valid
const validateHexCoordinates = (hex: any) => {
  return (
    typeof hex.id === "number" &&
    typeof hex.row === "number" &&
    typeof hex.col === "number"
  );
};

// Number tokens must be 2-12 (excluding 7)
const validateNumberToken = (token: any) => {
  return token === null || (token >= 2 && token <= 12 && token !== 7);
};
```

### Game State Validation

```typescript
// Player indices must be 0-3
const validatePlayerIndex = (index: number) => {
  return index >= 0 && index <= 3;
};

// Game phases must be valid
const validateGamePhase = (phase: string) => {
  const validPhases = [
    "setup_forward",
    "setup_reverse",
    "roll_dice",
    "robber_move",
    "robber_steal",
    "discard",
    "trade_build",
    "game_over",
  ];
  return validPhases.includes(phase);
};
```

## Migration Strategy

### Schema Evolution

```typescript
// Version 1: Initial schema
// Version 2: Add elo rating to users
// Version 3: Add game variants
// Version 4: Add achievements

// Migration example: Add elo field
export const migrateUsersAddElo = async (ctx: MutationCtx) => {
  const users = await ctx.db.query("users").collect();
  for (const user of users) {
    await ctx.db.patch(user._id, { elo: 1000 }); // Default elo
  }
};
```

### Backward Compatibility

- New fields should be optional when possible
- Enum values should only be added, never removed
- Index changes should be additive
- Data migrations should be idempotent

## Performance Considerations

### Query Optimization

- Use specific indexes for common query patterns
- Limit result sets with pagination for large collections
- Use `first()` instead of `collect()` when expecting single results
- Filter early to reduce data transfer

### Memory Usage

- Board data is embedded in game documents (acceptable for 19 hexes)
- Game logs could grow large - consider archival for old games
- Trade offers are short-lived - automatic cleanup needed

### Real-time Subscriptions

- Subscribe only to relevant game data
- Use field-level subscriptions when available
- Implement connection pooling for high-traffic scenarios
