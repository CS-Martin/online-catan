# Feature Modules & Code Organization

## Module Structure

```
convex/
├── users/                    # User management
│   ├── user.model.ts         # User table definition
│   ├── mutations/            # User CRUD operations
│   │   ├── updateUser.ts
│   │   └── updateStats.ts
│   └── queries/              # User data fetching
│       ├── getUser.ts
│       └── getUserStats.ts
├── lobbies/                  # Multiplayer lobby system
│   ├── lobby.model.ts        # Lobby table definition
│   ├── lobbyPlayer.model.ts  # Lobby player table definition
│   ├── mutations/            # Lobby operations
│   │   ├── createLobby.ts
│   │   ├── joinLobby.ts
│   │   ├── leaveLobby.ts
│   │   ├── updateLobby.ts
│   │   ├── addAIPlayer.ts
│   │   ├── removeAIPlayer.ts
│   │   ├── setPlayerReady.ts
│   │   └── startGame.ts
│   └── queries/              # Lobby data fetching
│       ├── getLobbies.ts
│       ├── getLobby.ts
│       ├── getLobbyPlayers.ts
│       └── getUserLobbies.ts
├── games/                    # Core game logic
│   ├── game.model.ts         # Game table definition
│   ├── gamePlayer.model.ts   # Game player table definition
│   ├── mutations/            # Game state operations
│   │   ├── rollDice.ts
│   │   ├── buildRoad.ts
│   │   ├── buildSettlement.ts
│   │   ├── buildCity.ts
│   │   ├── moveRobber.ts
│   │   ├── stealResource.ts
│   │   ├── discardResources.ts
│   │   ├── endTurn.ts
│   │   └── finishGame.ts
│   ├── queries/              # Game state fetching
│   │   ├── getGame.ts
│   │   ├── getGamePlayers.ts
│   │   ├── getMyResources.ts
│   │   ├── getGameBoard.ts
│   │   └── getGameLogs.ts
│   ├── actions/              # Server-side logic
│   │   ├── aiTurn.ts         # AI decision making
│   │   ├── distributeResources.ts
│   │   └── calculateLongestRoad.ts
│   └── lib/                  # Game utilities
│       ├── board.ts          # Board generation & math
│       ├── rules.ts          # Game rule validation
│       ├── resources.ts      # Resource calculations
│       ├── longestRoad.ts    # Longest road algorithm
│       └── constants.ts      # Game constants
├── trades/                   # Trading system
│   ├── tradeOffer.model.ts   # Trade offer table definition
│   ├── mutations/            # Trade operations
│   │   ├── createOffer.ts
│   │   ├── acceptOffer.ts
│   │   ├── declineOffer.ts
│   │   ├── cancelOffer.ts
│   │   └── bankTrade.ts
│   └── queries/              # Trade data fetching
│       ├── getActiveOffers.ts
│       ├── getMyOffers.ts
│       └── getTradeHistory.ts
└── gameLogs/                 # Game history
    ├── gameLog.model.ts      # Game log table definition
    ├── mutations/            # Log operations
    │   └── addLogEntry.ts
    └── queries/              # Log fetching
        ├── getGameLogs.ts
        └── getPlayerLogs.ts
```

## Frontend Module Structure

```
src/
├── app/                      # Next.js pages
│   ├── (authentication)/     # Auth routes (existing)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (main)/               # Authenticated routes
│   │   ├── layout.tsx        # Main app layout
│   │   ├── page.tsx          # Dashboard/home
│   │   ├── lobby/
│   │   │   ├── page.tsx      # Lobby browser
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Lobby room
│   │   └── game/
│   │       └── [id]/
│   │           └── page.tsx  # Game board
├── components/               # Reusable UI components
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── skeleton.tsx
│   ├── game/                 # Game-specific components
│   │   ├── HexBoard.tsx      # Main board renderer
│   │   ├── HexTile.tsx       # Individual hex
│   │   ├── Vertex.tsx        # Settlement/city node
│   │   ├── Edge.tsx          # Road segment
│   │   ├── DiceRoll.tsx      # Dice rolling UI
│   │   ├── ResourceBar.tsx   # Player's resource hand
│   │   ├── PlayerPanel.tsx   # Player info & scores
│   │   ├── TradeDialog.tsx   # Trade interface
│   │   ├── GameLog.tsx       # Action history
│   │   ├── ActionBar.tsx     # Build/trade/end turn
│   │   ├── RobberDialog.tsx  # Robber move/steal
│   │   └── DiscardDialog.tsx # Discard cards UI
│   ├── lobby/                # Lobby components
│   │   ├── LobbyCard.tsx     # Lobby list item
│   │   ├── LobbyRoom.tsx     # Lobby waiting room
│   │   ├── PlayerSlot.tsx    # Player slot display
│   │   ├── CreateLobbyDialog.tsx
│   │   └── JoinLobbyDialog.tsx
│   └── layout/               # Layout components
│       ├── Header.tsx        # App navigation
│       ├── Sidebar.tsx        # Game navigation
│       └── Footer.tsx        # App footer
├── features/                 # Feature-specific logic
│   ├── game/
│   │   ├── lib/
│   │   │   ├── hex-math.ts    # Hex coordinate calculations
│   │   │   ├── board-utils.ts # Board rendering helpers
│   │   │   ├── game-utils.ts  # Game state helpers
│   │   │   └── constants.ts   # Game constants
│   │   ├── hooks/
│   │   │   ├── useGameState.ts # Game state subscription
│   │   │   ├── useMyPlayer.ts  # Current player data
│   │   │   ├── useBoard.ts     # Board state
│   │   │   └── useActions.ts   # Game action handlers
│   │   └── components/
│   │       ├── GameProvider.tsx # Game context provider
│   │       └── ActionHandlers.tsx # Action dispatchers
│   ├── lobby/
│   │   ├── lib/
│   │   │   ├── lobby-utils.ts # Lobby helpers
│   │   │   └── constants.ts   # Lobby constants
│   │   ├── hooks/
│   │   │   ├── useLobby.ts    # Lobby state
│   │   │   └── useLobbyList.ts # Available lobbies
│   │   └── components/
│   │       └── LobbyProvider.tsx # Lobby context
│   └── ai/
│       ├── strategies/
│       │   ├── easy.ts        # Simple AI logic
│       │   ├── medium.ts      # Weighted heuristics
│       │   └── hard.ts        # Advanced strategy
│       └── lib/
│           ├── ai-utils.ts    # AI helper functions
│           └── decision-tree.ts # AI decision logic
├── lib/                      # Shared utilities
│   ├── utils.ts              # General helpers
│   ├── constants.ts          # App constants
│   ├── types.ts              # TypeScript types
│   └── validations.ts        # Form validations
└── providers/                # React context providers
    ├── convex.provider.tsx   # Convex client (existing)
    ├── auth.provider.tsx     # Authentication context
    └── theme.provider.tsx    # Theme/styling context
```

## Module Dependencies

### Core Dependencies
```
games ←→ lobbies (games created from lobbies)
games ←→ users (players are users)
games ←→ trades (trades belong to games)
games ←→ gameLogs (logs track game actions)

lobbies ←→ users (lobby participants)
lobbies ←→ lobbyPlayers (player slots in lobbies)

trades ←→ users (players make trades)
gameLogs ←→ users (players perform actions)
```

### Frontend Dependencies
```
game/ ←→ lobby/ (transition from lobby to game)
game/ ←→ ai/ (AI player interactions)
game/ ←→ auth/ (player authentication)
lobby/ ←→ auth/ (user identification)
```

## Data Flow Patterns

### 1. Lobby Creation Flow
```typescript
// Frontend: Create lobby
const createLobby = useMutation(api.lobbies.mutations.createLobby);
await createLobby({ name, maxPlayers, isPrivate });

// Backend: Create lobby record
export const createLobby = mutation({
  args: { name: v.string(), maxPlayers: v.number(), isPrivate: v.boolean() },
  handler: async (ctx, args) => {
    const lobbyId = await ctx.db.insert("lobbies", {
      hostId: ctx.auth.userId,
      name: args.name,
      status: "waiting",
      maxPlayers: args.maxPlayers,
      isPrivate: args.isPrivate,
      inviteCode: args.isPrivate ? generateInviteCode() : undefined,
    });
    
    // Add host as first player
    await ctx.db.insert("lobbyPlayers", {
      lobbyId,
      userId: ctx.auth.userId,
      isAI: false,
      color: "red", // Assign first available color
      isReady: false,
      joinedAt: Date.now(),
    });
    
    return lobbyId;
  },
});
```

### 2. Game Action Flow
```typescript
// Frontend: Build road
const buildRoad = useMutation(api.games.mutations.buildRoad);
await buildRoad({ gameId, edgeId });

// Backend: Validate and execute
export const buildRoad = mutation({
  args: { gameId: v.id("games"), edgeId: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    const player = await getCurrentPlayer(ctx, args.gameId);
    
    // Validate rules
    if (!canBuildRoad(game, player, args.edgeId)) {
      throw new Error("Invalid road placement");
    }
    
    // Deduct resources
    await updatePlayerResources(ctx, player._id, {
      brick: player.resources.brick - 1,
      lumber: player.resources.lumber - 1,
    });
    
    // Update board
    const newBoard = { ...game.board };
    const edge = newBoard.edges.find(e => e.id === args.edgeId);
    edge.hasRoad = true;
    edge.ownerId = player.playerIndex;
    
    await ctx.db.patch(args.gameId, { board: newBoard });
    
    // Log action
    await ctx.db.insert("gameLogs", {
      gameId: args.gameId,
      turnNumber: game.turnNumber,
      playerIndex: player.playerIndex,
      action: "build_road",
      details: { edgeId: args.edgeId },
      timestamp: Date.now(),
    });
  },
});
```

### 3. Real-time Subscription Pattern
```typescript
// Frontend: Subscribe to game state
export const useGameState = (gameId: string) => {
  const game = useQuery(api.games.queries.getGame, { gameId });
  const players = useQuery(api.games.queries.getGamePlayers, { gameId });
  const logs = useQuery(api.gameLogs.queries.getGameLogs, { gameId });
  
  return {
    game,
    players,
    logs,
    isLoading: game === undefined || players === undefined,
  };
};

// Component usage
const GameBoard = ({ gameId }: { gameId: string }) => {
  const { game, players, isLoading } = useGameState(gameId);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <HexBoard board={game.board} players={players} />
      <PlayerPanel players={players} />
      <GameLog logs={logs} />
    </div>
  );
};
```

## Module Communication

### Internal Module APIs
Each module exports a consistent API:

```typescript
// Example: games module API
export const games = {
  // Queries
  getGame: query({ ... }),
  getGamePlayers: query({ ... }),
  getMyResources: query({ ... }),
  
  // Mutations
  buildRoad: mutation({ ... }),
  buildSettlement: mutation({ ... }),
  rollDice: mutation({ ... }),
  
  // Actions
  aiTurn: action({ ... }),
  distributeResources: action({ ... }),
  
  // Utilities
  canBuildRoad: (game, player, edgeId) => boolean,
  calculateVictoryPoints: (player) => number,
};
```

### Cross-Module Dependencies
- Games module depends on Users module for player identification
- Lobbies module depends on Games module for game creation
- All modules depend on core utilities for common operations

## Testing Strategy

### Unit Tests per Module
```typescript
// Example: games/lib/rules.test.ts
describe("Game Rules", () => {
  test("canBuildRoad returns true for valid placement", () => {
    const game = createTestGame();
    const player = game.players[0];
    const edgeId = 0; // Edge connected to player's settlement
    
    expect(canBuildRoad(game, player, edgeId)).toBe(true);
  });
  
  test("canBuildRoad returns false for invalid placement", () => {
    const game = createTestGame();
    const player = game.players[0];
    const edgeId = 10; // Edge not connected to player
    
    expect(canBuildRoad(game, player, edgeId)).toBe(false);
  });
});
```

### Integration Tests
```typescript
// Example: lobby-to-game flow test
describe("Lobby to Game Flow", () => {
  test("creates game when lobby starts", async () => {
    const lobbyId = await createTestLobby();
    const gameId = await startGame(lobbyId);
    
    const game = await getGame(gameId);
    expect(game.status).toBe("setup");
    expect(game.players.length).toBe(2);
  });
});
```

## Performance Optimization

### Code Splitting
- Lazy load game components
- Separate lobby and game bundles
- Dynamic AI strategy loading

### Memoization
- React.memo for expensive components
- useMemo for board calculations
- useCallback for event handlers

### Subscription Optimization
- Selective field subscriptions
- Debounced rapid updates
- Connection pooling for multiplayer

This modular structure ensures maintainability, testability, and scalability as the game grows in complexity.
