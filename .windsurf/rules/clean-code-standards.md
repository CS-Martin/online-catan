---
description: Clean code standards and architecture guidelines for maintainable, componentized code
trigger: always_on
globs: src/**/*.tsx,src/**/*.ts,src/**/*.jsx,src/**/*.js
---

# Clean Code Standards & Architecture Guidelines

## Core Principles

### 1. Single Responsibility Principle

- Each function/component has one, well-defined responsibility
- Functions do one thing and do it well
- Components focus on a single UI concern or business logic

### 2. Don't Repeat Yourself (DRY)

- Extract common patterns into reusable functions
- Create utility functions for repeated logic
- Use composition over inheritance

### 3. Keep It Simple & Stupid (KISS)

- Favor simple solutions over complex ones
- Avoid over-engineering
- Write code that's easy to understand

### 4. Documentation First

- Document complex functions with JSDoc
- Comment business logic and algorithms
- Explain "why" not just "what"

## Function Guidelines

### Function Structure

````typescript
/**
 * Brief description of what the function does
 *
 * @param {Type} paramName - Description of parameter
 * @param {Type} paramTwo - Description of parameter
 * @returns {Type} Description of return value
 *
 * @example
 * ```typescript
 * const result = calculateWinRate(5, 3); // Returns 0.6
 * ```
 */
export const calculateWinRate = (
  gamesWon: number,
  gamesPlayed: number,
): number => {
  // Validate inputs
  if (gamesPlayed === 0) return 0;

  // Calculate win rate
  return gamesWon / gamesPlayed;
};
````

### Function Naming Conventions

```typescript
// ✅ Good - Clear, descriptive names
const calculatePlayerElo = (
  currentElo: number,
  gameResult: "win" | "loss",
): number => {};
const isValidBuildingPlacement = (vertex: Vertex, board: Board): boolean => {};
const formatGameDuration = (seconds: number): string => {};

// ❌ Bad - Vague or abbreviated names
const calc = (elo: number, res: string): number => {};
const check = (v: Vertex, b: Board): boolean => {};
const fmt = (s: number): string => {};
```

### Pure Functions

```typescript
// ✅ Good - Pure function, no side effects
export const calculateResourceCost = (
  buildingType: "settlement" | "city" | "road",
): ResourceCost => {
  const costs = {
    settlement: { brick: 1, lumber: 1, grain: 1, wool: 1, ore: 0 },
    city: { brick: 0, lumber: 0, grain: 2, wool: 2, ore: 3 },
    road: { brick: 1, lumber: 1, grain: 0, wool: 0, ore: 0 },
  };

  return costs[buildingType];
};

// ❌ Bad - Function with side effects
export const deductResources = (player: Player, cost: ResourceCost): void => {
  player.resources.brick -= cost.brick; // Mutates input
  // Side effects should be handled by the caller
};
```

## Component Architecture

### Component Structure

```typescript
// components/game/GameBoard.tsx
interface GameBoardProps {
  gameId: string;
  onHexClick?: (hexId: number) => void;
  className?: string;
}

/**
 * Renders the interactive game board with hexagonal tiles
 * Handles user interactions and visual feedback
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  gameId,
  onHexClick,
  className
}) => {
  // Custom hooks for component logic
  const { board, currentPlayer } = useGameState(gameId);
  const { selectedHex, handleHexClick } = useHexSelection(onHexClick);

  // Event handlers
  const handleHexClick = (hexId: number) => {
    handleHexClick(hexId);
  };

  // Render logic
  return (
    <div className={cn("game-board", className)}>
      {board.hexes.map(hex => (
        <HexTile
          key={hex.id}
          hex={hex}
          isSelected={selectedHex === hex.id}
          onClick={() => handleHexClick(hex.id)}
        />
      ))}
    </div>
  );
};
```

### Custom Hooks for Logic Extraction

```typescript
// hooks/useGameState.ts
/**
 * Manages game state and provides game-related utilities
 */
export const useGameState = (gameId: string) => {
  const game = useQuery(api.games.getGame, { gameId });
  const players = useQuery(api.games.getGamePlayers, { gameId });

  const currentPlayer = useMemo(
    () => players?.find((p) => p.playerIndex === game.currentPlayerIndex),
    [game, players],
  );

  return {
    game,
    players,
    currentPlayer,
    isLoading: game === undefined || players === undefined,
  };
};

// hooks/useHexSelection.ts
/**
 * Manages hex selection state and interactions
 */
export const useHexSelection = (onHexClick?: (hexId: number) => void) => {
  const [selectedHex, setSelectedHex] = useState<number | null>(null);

  const handleHexClick = useCallback(
    (hexId: number) => {
      setSelectedHex(hexId);
      onHexClick?.(hexId);
    },
    [onHexClick],
  );

  const clearSelection = useCallback(() => {
    setSelectedHex(null);
  }, []);

  return {
    selectedHex,
    handleHexClick,
    clearSelection,
  };
};
```

### Utility Functions

```typescript
// lib/game/calculations.ts
/**
 * Game calculation utilities
 */

/**
 * Calculates the longest road length for a player
 * @param {Board} board - The game board
 * @param {number} playerIndex - Player's index
 * @returns {number} Length of longest road
 */
export const calculateLongestRoad = (
  board: Board,
  playerIndex: number,
): number => {
  const playerRoads = board.edges.filter(
    (edge) => edge.hasRoad && edge.ownerId === playerIndex,
  );

  // Use graph traversal to find longest connected path
  return findLongestPath(playerRoads);
};

/**
 * Determines if a settlement can be built at a vertex
 * @param {Board} board - The game board
 * @param {number} vertexId - Vertex to check
 * @param {number} playerIndex - Player's index
 * @returns {boolean} Whether settlement can be built
 */
export const canBuildSettlement = (
  board: Board,
  vertexId: number,
  playerIndex: number,
): boolean => {
  const vertex = board.vertices.find((v) => v.id === vertexId);
  if (!vertex || vertex.building) return false;

  // Check distance rule: no adjacent settlements
  return !hasAdjacentSettlements(board, vertexId);
};
```

## File Organization

### Directory Structure

```
src/
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components (shadcn/ui)
│   ├── game/                # Game-specific components
│   │   ├── GameBoard.tsx
│   │   ├── PlayerPanel.tsx
│   │   └── DiceRoller.tsx
│   ├── lobby/               # Lobby components
│   └── layout/              # Layout components
├── features/                # Feature modules
│   ├── game/                # Game logic and hooks
│   │   ├── hooks/           # Game-related hooks
│   │   ├── lib/             # Game utilities
│   │   └── components/      # Game feature components
│   ├── lobby/               # Lobby logic
│   └── user/                # User logic
├── hooks/                   # Global custom hooks
├── lib/                    # Shared utilities
│   ├── game/                # Game utilities
│   ├── validation/          # Validation functions
│   └── formatting/          # Formatting utilities
├── types/                   # TypeScript type definitions
└── constants/              # Application constants
```

## Reusable Patterns

### 1. Data Fetching Pattern

```typescript
// features/game/hooks/useGame.ts
export const useGame = (gameId: string) => {
  const game = useQuery(api.games.getGame, { gameId });
  const updateGame = useMutation(api.games.updateGame);

  const isLoading = game === undefined;
  const error = game === null;

  return {
    game,
    updateGame,
    isLoading,
    error,
  };
};
```

### 2. Form Validation Pattern

```typescript
// lib/validation/gameValidation.ts
export const validateLobbyCreation = (data: CreateLobbyData) => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "Lobby name is required";
  }

  if (data.maxPlayers < 2 || data.maxPlayers > 4) {
    errors.maxPlayers = "Must be between 2 and 4 players";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

### 3. Error Handling Pattern

```typescript
// lib/errorHandling/errorBoundary.tsx
export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GameError';
  }
}

// Usage in components
const GameComponent = () => {
  const { game, error } = useGameState(gameId);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return <GameBoard game={game} />;
};
```

## Documentation Standards

### JSDoc Comments

````typescript
/**
 * Calculates the victory points for a player including bonuses
 *
 * This function takes into account:
 * - Settlements and cities (1 VP and 2 VP respectively)
 * - Longest road bonus (2 VP)
 * - Largest army bonus (2 VP)
 * - Victory point development cards
 *
 * @param {GamePlayer} player - The player to calculate VPs for
 * @param {Game} game - The current game state
 * @returns {number} Total victory points
 *
 * @throws {Error} When player data is invalid
 *
 * @example
 * ```typescript
 * const player = { victoryPoints: 8, hasLongestRoad: true };
 * const game = { /* game state */ };
 * const totalVP = calculateVictoryPoints(player, game); // Returns 10
 * ```
 */
export const calculateVictoryPoints = (
  player: GamePlayer,
  game: Game
): number => {
  // Implementation
};
````

### Component Documentation

````typescript
/**
 * Interactive dice rolling component with animation
 *
 * Renders two dice with 3D animation effects and handles
 * the rolling logic. Displays the result and updates the game state.
 *
 * @component
 * @example
 * ```tsx
 * <DiceRoller
 *   gameId="game_123"
 *   onRoll={(result) => console.log(result)}
 * />
 * ```
 */
export const DiceRoller: React.FC<DiceRollerProps> = ({ gameId, onRoll }) => {
  // Component implementation
};
````

### Code Comments

```typescript
// Complex algorithm with comments
export const findLongestPath = (edges: Edge[]): number => {
  // Build adjacency list for graph traversal
  const adjacencyList = buildAdjacencyList(edges);

  // Use DFS to find longest path from each node
  let maxLength = 0;
  const visited = new Set<string>();

  for (const edge of edges) {
    // Start DFS from each unvisited edge
    if (!visited.has(edge.id)) {
      const length = dfs(edge.id, adjacencyList, visited);
      maxLength = Math.max(maxLength, length);
    }
  }

  return maxLength;
};
```

## Code Quality Standards

### 1. Function Length

- Functions should be under 50 lines when possible
- Break down complex functions into smaller, focused functions
- Use descriptive function names that explain their purpose

### 2. Cyclomatic Complexity

- Keep complexity low (< 10)
- Use early returns to reduce nesting
- Extract complex conditions into well-named functions

### 3. Parameter Count

- Limit to 3-4 parameters when possible
- Use parameter objects for complex functions
- Consider using options pattern for optional parameters

### 4. Variable Naming

```typescript
// ✅ Good - Descriptive and clear
const currentPlayerIndex = 0;
const isValidBuildingPlacement = true;
const resourceCosts = { brick: 1, lumber: 1 };

// ❌ Bad - Vague or abbreviated
const idx = 0;
const valid = true;
const costs = { b: 1, l: 1 };
```

## Testing Guidelines

### 1. Unit Tests

```typescript
// __tests__/lib/game/calculations.test.ts
describe("calculateVictoryPoints", () => {
  it("should calculate base victory points", () => {
    const player = {
      victoryPoints: 5,
      settlementsBuilt: 2,
      citiesBuilt: 1,
      hasLongestRoad: false,
      hasLargestArmy: false,
    };

    const result = calculateVictoryPoints(player, mockGame);
    expect(result).toBe(8); // 5 + 2 + 1
  });

  it("should include longest road bonus", () => {
    const player = {
      victoryPoints: 6,
      hasLongestRoad: true,
      // ... other properties
    };

    const result = calculateVictoryPoints(player, mockGame);
    expect(result).toBe(8); // 6 + 2 (longest road bonus)
  });
});
```

### 2. Component Tests

```typescript
// __tests__/components/game/GameBoard.test.tsx
describe('GameBoard', () => {
  it('renders hex grid correctly', () => {
    render(<GameBoard gameId="test" />);
    expect(screen.getAllByTestId('hex-tile')).toHaveLength(19);
  });

  it('handles hex click events', async () => {
    const onHexClick = jest.fn();
    render(<GameBoard gameId="test" onHexClick={onHexClick} />);

    fireEvent.click(screen.getByTestId('hex-tile-0'));
    expect(onHexClick).toHaveBeenCalledWith(0);
  });
});
```

## Performance Guidelines

### 1. React Optimization

```typescript
// ✅ Good - Use useMemo for expensive calculations
const processedBoard = useMemo(() => {
  return processBoardData(board);
}, [board]);

// ✅ Good - Use useCallback for event handlers
const handleHexClick = useCallback((hexId: number) => {
  setSelectedHex(hexId);
  onHexClick?.(hexId);
}, [onHexClick]);

// ✅ Good - Use React.memo for pure components
export const HexTile = React.memo<HexTileProps>(({ hex, onClick }) => {
  return (
    <div onClick={() => onClick(hex.id)}>
      {/* Hex content */}
    </div>
  );
});
```

### 2. Bundle Optimization

```typescript
// Dynamic imports for large components
const GameBoard = dynamic(() => import('./GameBoard'), {
  loading: () => <GameBoardSkeleton />,
  ssr: false
});

// Code splitting by routes
const GamePage = lazy(() => import('./GamePage'));
const LobbyPage = lazy(() => import('./LobbyPage'));
```

## Review Checklist

### Before Submitting Code

- [ ] Functions have clear, descriptive names
- [ ] Complex functions have JSDoc comments
- [ ] Code follows DRY principle
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] Performance optimizations are applied
- [ ] Tests are written for critical functions
- [ ] Code is formatted consistently

### Code Review Questions

- Is this code easy to understand?
- Can this be simplified?
- Are there any duplicated patterns?
- Is the documentation clear?
- Are there any potential bugs?
- Is this performant?

These standards ensure maintainable, readable, and efficient code throughout the application.
