# Implementation Plan

## Development Roadmap

This document outlines the phased approach to building Online Catan, from basic infrastructure to a fully-featured multiplayer game.

## Phase Overview

| Phase | Focus | Duration | Dependencies |
|---|---|---|---|
| **1** | Board Engine & Math | 2-3 days | None |
| **2** | Schema Definition | 1-2 days | Phase 1 |
| **3** | Lobby System | 3-4 days | Phase 2 |
| **4** | Game Initialization | 2-3 days | Phase 3 |
| **5** | Setup Phase | 3-4 days | Phase 4 |
| **6** | Core Game Loop | 4-5 days | Phase 5 |
| **7** | Building System | 3-4 days | Phase 6 |
| **8** | Trading System | 3-4 days | Phase 7 |
| **9** | Win Conditions | 2-3 days | Phase 8 |
| **10** | Board UI | 5-6 days | Phase 1 |
| **11** | Game UI | 4-5 days | Phase 10 |
| **12** | AI Players | 5-6 days | Phase 11 |
| **13** | Polish & Launch | 3-4 days | Phase 12 |

**Total Estimated Time**: 6-8 weeks

---

## Phase 1: Board Engine & Math

### Objectives
- Create hex coordinate system
- Implement board generation algorithm
- Build adjacency calculation utilities
- Create board validation functions

### Tasks

#### 1.1 Hex Coordinate System
```typescript
// src/features/game/lib/hex-math.ts
export interface HexCoordinate {
  row: number;
  col: number;
  x: number;  // Pixel coordinates
  y: number;
}

export class HexMath {
  static pixelToHex(x: number, y: number): HexCoordinate
  static hexToPixel(hex: HexCoordinate): { x: number, y: number }
  static getNeighbors(hex: HexCoordinate): HexCoordinate[]
  static getDistance(hex1: HexCoordinate, hex2: HexCoordinate): number
  static getHexVertices(hex: HexCoordinate): VertexCoordinate[]
  static getHexEdges(hex: HexCoordinate): EdgeCoordinate[]
}
```

#### 1.2 Board Generation
```typescript
// src/features/game/lib/board-generator.ts
export class BoardGenerator {
  static generateStandardBoard(): Board {
    // 19 hexes in standard Catan layout
    // Random resource distribution
    // Random number token placement
    // Desert placement (robber starts here)
  }
  
  static validateBoard(board: Board): boolean
  static serializeBoard(board: Board): string
  static deserializeBoard(data: string): Board
}
```

#### 1.3 Adjacency Calculations
```typescript
// src/features/game/lib/adjacency.ts
export class AdjacencyCalculator {
  static calculateVertexAdjacencies(board: Board): Vertex[]
  static calculateEdgeAdjacencies(board: Board): Edge[]
  static getConnectedVertices(vertexId: number, board: Board): number[]
  static getConnectedEdges(edgeId: number, board: Board): number[]
  static findLongestRoad(playerIndex: number, board: Board): number
}
```

### Deliverables
- ✅ Hex coordinate system with pixel conversion
- ✅ Standard board generation algorithm
- ✅ Adjacency calculation utilities
- ✅ Unit tests for board math

### Acceptance Criteria
- Board generates with correct 19-hex layout
- Hex coordinates convert accurately to/from pixels
- Adjacency calculations are mathematically correct
- All edge cases handled (board edges, etc.)

---

## Phase 2: Schema Definition

### Objectives
- Define all Convex tables and validators
- Create proper indexes for performance
- Set up relationships between tables
- Generate TypeScript types

### Tasks

#### 2.1 Core Tables
```typescript
// convex/schema.ts
export default defineSchema({
  users: usersTable,
  lobbies: lobbiesTable,
  lobbyPlayers: lobbyPlayersTable,
  games: gamesTable,
  gamePlayers: gamePlayersTable,
  tradeOffers: tradeOffersTable,
  gameLogs: gameLogsTable,
});
```

#### 2.2 Table Definitions
- Users table (extend existing)
- Lobbies and lobby players
- Games and game players
- Trade offers
- Game logs

#### 2.3 Index Strategy
- Performance-critical query indexes
- Compound indexes for common patterns
- Unique constraints where needed

### Deliverables
- ✅ Complete Convex schema
- ✅ All table validators
- ✅ Performance indexes
- ✅ Generated TypeScript types

### Acceptance Criteria
- All tables defined with proper validators
- Indexes support planned query patterns
- TypeScript types generate without errors
- Schema passes Convex validation

---

## Phase 3: Lobby System

### Objectives
- Create and manage game lobbies
- Handle player joining/leaving
- Support AI players
- Lobby discovery and browsing

### Tasks

#### 3.1 Lobby Management
```typescript
// convex/lobbies/mutations/
export const createLobby = mutation(...)
export const joinLobby = mutation(...)
export const leaveLobby = mutation(...)
export const updateLobby = mutation(...)
export const deleteLobby = mutation(...)
```

#### 3.2 Player Management
```typescript
// convex/lobbies/mutations/
export const addAIPlayer = mutation(...)
export const removeAIPlayer = mutation(...)
export const setPlayerReady = mutation(...)
export const assignPlayerColor = mutation(...)
```

#### 3.3 Lobby Discovery
```typescript
// convex/lobbies/queries/
export const getLobbies = query(...)
export const getLobby = query(...)
export const getLobbyPlayers = query(...)
export const getUserLobbies = query(...)
```

#### 3.4 Lobby UI
```typescript
// src/components/lobby/
export const LobbyCard = ({ lobby }: Props) => JSX.Element
export const LobbyRoom = ({ lobbyId }: Props) => JSX.Element
export const PlayerSlot = ({ player }: Props) => JSX.Element
export const CreateLobbyDialog = () => JSX.Element
```

### Deliverables
- ✅ Lobby CRUD operations
- ✅ Player join/leave functionality
- ✅ AI player support
- ✅ Lobby browsing UI
- ✅ Real-time lobby updates

### Acceptance Criteria
- Users can create and join lobbies
- Lobby state updates in real-time
- AI players can be added/removed
- Lobby discovery works for public lobbies

---

## Phase 4: Game Initialization

### Objectives
- Transition from lobby to game
- Generate random board
- Initialize player states
- Setup game configuration

### Tasks

#### 4.1 Game Creation
```typescript
// convex/games/mutations/
export const createGame = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    // Create game record
    // Generate board
    // Create game players
    // Update lobby status
  },
});
```

#### 4.2 Board Generation
```typescript
// convex/games/lib/board.ts
export const generateGameBoard = (): Board => {
  // Use Phase 1 board generator
  // Add game-specific initialization
  // Place robber on desert
  // Validate board integrity
};
```

#### 4.3 Player Setup
```typescript
// convex/games/lib/player-setup.ts
export const initializeGamePlayers = (
  lobbyPlayers: LobbyPlayer[],
  gameId: id<"games">
): GamePlayer[] => {
  // Convert lobby players to game players
  // Assign player indices
  // Initialize resources (empty)
  // Set starting VP (0)
};
```

### Deliverables
- ✅ Game creation from lobby
- ✅ Random board generation
- ✅ Player state initialization
- ✅ Game configuration setup

### Acceptance Criteria
- Games can be created from lobbies
- Board generates randomly but fairly
- Players transition from lobby to game
- Initial game state is correct

---

## Phase 5: Setup Phase

### Objectives
- Implement initial settlement placement
- Handle forward and reverse rounds
- Distribute initial resources
- Enforce setup rules

### Tasks

#### 5.1 Setup State Machine
```typescript
// convex/games/lib/setup-phase.ts
export class SetupPhase {
  static getCurrentPlayer(game: Game): number
  static getNextPlayer(game: Game): number
  static isSetupComplete(game: Game): boolean
  static advanceSetupPhase(game: Game): Game
}
```

#### 5.2 Placement Validation
```typescript
// convex/games/lib/setup-validation.ts
export const validateSetupPlacement = (
  board: Board,
  vertexId: number,
  edgeId: number,
  playerIndex: number
): boolean => {
  // Check vertex availability
  // Check distance rule
  // Check road connection
  // Check turn order
};
```

#### 5.3 Setup Mutations
```typescript
// convex/games/mutations/
export const placeSetupSettlement = mutation(...)
export const placeSetupRoad = mutation(...)
export const completeSetupPhase = mutation(...)
```

#### 5.4 Initial Resource Distribution
```typescript
// convex/games/lib/resource-distribution.ts
export const distributeSetupResources = (
  board: Board,
  players: GamePlayer[]
): GamePlayer[] => {
  // Second round only
  // Distribute resources from adjacent hexes
  // Update player hands
};
```

### Deliverables
- ✅ Setup phase state machine
- ✅ Placement validation
- ✅ Setup mutations
- ✅ Initial resource distribution
- ✅ Setup UI components

### Acceptance Criteria
- Setup follows correct turn order
- Placement rules are enforced
- Initial resources distributed correctly
- UI guides players through setup

---

## Phase 6: Core Game Loop

### Objectives
- Implement dice rolling
- Handle resource production
- Manage robber mechanics
- Control turn progression

### Tasks

#### 6.1 Dice System
```typescript
// convex/games/mutations/
export const rollDice = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    // Roll 2 dice
    // Update game state
    // Trigger production or robber
    // Log roll
  },
});
```

#### 6.2 Resource Production
```typescript
// convex/games/lib/production.ts
export const calculateProduction = (
  board: Board,
  diceRoll: number
): ResourceProduction[] => {
  // Find hexes with matching number
  // Calculate production for each building
  // Return production events
};
```

#### 6.3 Robber System
```typescript
// convex/games/mutations/
export const moveRobber = mutation(...)
export const stealResource = mutation(...)
export const discardResources = mutation(...)
```

#### 6.4 Turn Management
```typescript
// convex/games/mutations/
export const endTurn = mutation(...)
export const advanceTurn = internalMutation(...)
```

### Deliverables
- ✅ Dice rolling system
- ✅ Resource production
- ✅ Robber mechanics
- ✅ Turn progression
- ✅ Dice UI component

### Acceptance Criteria
- Dice roll produces correct numbers
- Resources distribute accurately
- Robber moves and steals correctly
- Turns advance properly

---

## Phase 7: Building System

### Objectives
- Implement structure building
- Validate building rules
- Update game state
- Track building limits

### Tasks

#### 7.1 Building Mutations
```typescript
// convex/games/mutations/
export const buildRoad = mutation(...)
export const buildSettlement = mutation(...)
export const buildCity = mutation(...)
```

#### 7.2 Building Validation
```typescript
// convex/games/lib/building-validation.ts
export const validateRoadPlacement = (...)
export const validateSettlementPlacement = (...)
export const validateCityUpgrade = (...)
export const canAffordStructure = (...)
```

#### 7.3 Resource Management
```typescript
// convex/games/lib/resources.ts
export const deductBuildingCost = (...)
export const refundBuildingCost = (...)
export const checkBuildingLimits = (...)
```

#### 7.4 Longest Road Calculation
```typescript
// convex/games/lib/longest-road.ts
export const calculateLongestRoad = (
  playerIndex: number,
  board: Board
): number => {
  // Graph traversal algorithm
  // Find longest connected path
  // Return road length
};
```

### Deliverables
- ✅ All building mutations
- ✅ Building validation rules
- ✅ Resource deduction
- ✅ Longest road calculation
- ✅ Building UI components

### Acceptance Criteria
- Buildings follow all rules
- Resources deducted correctly
- Longest road calculated accurately
- Building limits enforced

---

## Phase 8: Trading System

### Objectives
- Enable player-to-player trading
- Implement bank trading
- Handle trade offers
- Validate trade fairness

### Tasks

#### 8.1 Trade Offers
```typescript
// convex/trades/mutations/
export const createOffer = mutation(...)
export const acceptOffer = mutation(...)
export const declineOffer = mutation(...)
export const cancelOffer = mutation(...)
```

#### 8.2 Bank Trading
```typescript
// convex/trades/mutations/
export const bankTrade = mutation({
  args: { 
    gameId: v.id("games"),
    offering: resourceSchema,
    requesting: resourceSchema,
  },
  handler: async (ctx, args) => {
    // Validate 4:1 ratio
    // Execute trade
    // Update resources
  },
});
```

#### 8.3 Trade Validation
```typescript
// convex/trades/lib/trade-validation.ts
export const validateTradeOffer = (...)
export const validateBankTrade = (...)
export const canAffordTrade = (...)
```

#### 8.4 Trade UI
```typescript
// src/components/game/
export const TradeDialog = ({ gameId, playerIndex }: Props) => JSX.Element
export const TradeOffer = ({ offer }: Props) => JSX.Element
export const BankTradePanel = ({ player }: Props) => JSX.Element
```

### Deliverables
- ✅ Trade offer system
- ✅ Bank trading (4:1)
- ✅ Trade validation
- ✅ Trade UI components
- ✅ Real-time trade updates

### Acceptance Criteria
- Players can propose trades
- Bank trading works at 4:1 ratio
- Trade validation prevents cheating
- Trade state updates in real-time

---

## Phase 9: Win Conditions

### Objectives
- Track victory points
- Detect win conditions
- Handle game completion
- Update player statistics

### Tasks

#### 9.1 Victory Point Calculation
```typescript
// convex/games/lib/victory-points.ts
export const calculateVictoryPoints = (
  player: GamePlayer,
  board: Board
): number => {
  // Base VPs from settlements/cities
  // Longest road bonus
  // Future: development cards
  return totalVPs;
};
```

#### 9.2 Win Detection
```typescript
// convex/games/lib/win-detection.ts
export const checkWinCondition = (
  game: Game,
  players: GamePlayer[]
): { hasWinner: boolean; winnerId?: id<"users"> } => {
  // Check each player's VP total
  // Return first player to reach 10 VP
};
```

#### 9.3 Game Completion
```typescript
// convex/games/mutations/
export const finishGame = mutation({
  args: { gameId: v.id("games"), winnerId: v.id("users") },
  handler: async (ctx, args) => {
    // Update game status
    // Update player statistics
    // Log game completion
  },
});
```

### Deliverables
- ✅ Victory point tracking
- ✅ Win condition detection
- ✅ Game completion flow
- ✅ Statistics updates

### Acceptance Criteria
- Victory points calculated correctly
- Game ends when player reaches 10 VP
- Player statistics updated
- Game state marked as finished

---

## Phase 10: Board UI

### Objectives
- Render hex board with SVG
- Handle user interactions
- Show game state visually
- Support hover and click states

### Tasks

#### 10.1 Hex Board Component
```typescript
// src/components/game/HexBoard.tsx
export const HexBoard = ({ 
  board, 
  onVertexClick, 
  onEdgeClick,
  currentPlayer 
}: Props) => JSX.Element {
  // Render SVG hex grid
  // Handle interactions
  // Show game state
}
```

#### 10.2 Interactive Elements
```typescript
// src/components/game/
export const HexTile = ({ hex, onClick }: Props) => JSX.Element
export const Vertex = ({ vertex, onClick, isValid }: Props) => JSX.Element
export const Edge = ({ edge, onClick, isValid }: Props) => JSX.Element
```

#### 10.3 Visual State
```typescript
// src/components/game/lib/board-visuals.ts
export const getHexColor = (resource: Resource): string
export const getVertexColor = (building: Building): string
export const getEdgeColor = (hasRoad: boolean, playerIndex: number): string
export const isValidPlacement = (location, game, player): boolean
```

#### 10.4 Animations
```typescript
// src/components/game/lib/animations.ts
export const diceRollAnimation = (duration: number): Promise<void>
export const resourceGainAnimation = (resource: Resource): void
export const buildingPlaceAnimation = (type: string): void
```

### Deliverables
- ✅ SVG hex board renderer
- ✅ Interactive vertices and edges
- ✅ Visual game state
- ✅ Hover and click states
- ✅ Basic animations

### Acceptance Criteria
- Board renders correctly
- Interactions work smoothly
- Game state is visually clear
- Performance is acceptable

---

## Phase 11: Game UI

### Objectives
- Create comprehensive game interface
- Show player information
- Handle game actions
- Provide feedback and guidance

### Tasks

#### 11.1 Game Layout
```typescript
// src/app/game/[id]/page.tsx
export default function GamePage({ params }: { params: { id: string } }) {
  return (
    <div className="game-layout">
      <Header />
      <div className="game-main">
        <PlayerPanel />
        <HexBoard />
        <ActionBar />
      </div>
      <GameLog />
      <TradeDialog />
    </div>
  );
}
```

#### 11.2 Player Information
```typescript
// src/components/game/PlayerPanel.tsx
export const PlayerPanel = ({ players, currentPlayer }: Props) => JSX.Element {
  // Show all players' resources, VP, status
  // Highlight current player
  // Show turn order
}
```

#### 11.3 Action Controls
```typescript
// src/components/game/ActionBar.tsx
export const ActionBar = ({ 
  game, 
  player, 
  onAction 
}: Props) => JSX.Element {
  // Build buttons (road, settlement, city)
  // Trade button
  // End turn button
  // Dice roll button
}
```

#### 11.4 Resource Display
```typescript
// src/components/game/ResourceBar.tsx
export const ResourceBar = ({ resources }: Props) => JSX.Element {
  // Show player's resource hand
  // Visual resource counts
  // Trade hints
}
```

#### 11.5 Game Log
```typescript
// src/components/game/GameLog.tsx
export const GameLog = ({ logs }: Props) => JSX.Element {
  // Show recent game actions
  // Auto-scroll to latest
  // Filter by player
}
```

### Deliverables
- ✅ Complete game layout
- ✅ Player information panels
- ✅ Action controls
- ✅ Resource display
- ✅ Game log
- ✅ Responsive design

### Acceptance Criteria
- All game information visible
- Controls are intuitive
- Layout works on different screen sizes
- Real-time updates work smoothly

---

## Phase 12: AI Players

### Objectives
- Implement AI decision making
- Support multiple difficulty levels
- Ensure fair AI behavior
- Optimize AI performance

### Tasks

#### 12.1 AI Framework
```typescript
// convex/features/ai/strategies/baseStrategy.ts
export abstract class AIStrategy {
  abstract handleSetupPhase(...): Promise<void>
  abstract handleMainPhase(...): Promise<void>
  abstract handleRollPhase(...): Promise<void>
}
```

#### 12.2 Easy AI
```typescript
// convex/features/ai/strategies/easy.ts
export class EasyAIStrategy extends AIStrategy {
  // Random valid moves
  // Basic prioritization
  // Simple resource management
}
```

#### 12.3 Medium AI
```typescript
// convex/features/ai/strategies/medium.ts
export class MediumAIStrategy extends AIStrategy {
  // Weighted heuristics
  // Resource diversity focus
  // Basic trading strategy
}
```

#### 12.4 Hard AI
```typescript
// convex/features/ai/strategies/hard.ts
export class HardAIStrategy extends AIStrategy {
  // Minimax with lookahead
  // Advanced evaluation
  // Optimal trading
  // Opponent awareness
}
```

#### 12.5 AI Integration
```typescript
// convex/games/actions/aiTurn.ts
export const aiTurn = action({
  args: { gameId, playerIndex, difficulty },
  handler: async (ctx, args) => {
    // Execute AI strategy
    // Update game state
    // Add artificial delay
  },
});
```

### Deliverables
- ✅ AI framework
- ✅ Three difficulty levels
- ✅ AI decision logic
- ✅ Performance optimization
- ✅ AI testing suite

### Acceptance Criteria
- AI makes valid moves
- Difficulty levels feel different
- AI responds in reasonable time
- AI provides good challenge

---

## Phase 13: Polish & Launch

### Objectives
- Optimize performance
- Add animations and polish
- Fix bugs and edge cases
- Prepare for production

### Tasks

#### 13.1 Performance Optimization
- Profile Convex queries
- Optimize React rendering
- Add loading states
- Implement caching

#### 13.2 Visual Polish
- Add smooth animations
- Improve visual feedback
- Sound effects (optional)
- Better error states

#### 13.3 Bug Fixes
- Fix edge cases
- Improve error handling
- Add input validation
- Handle connection issues

#### 13.4 Production Preparation
- Environment configuration
- Deployment setup
- Monitoring integration
- Documentation updates

### Deliverables
- ✅ Optimized performance
- ✅ Polished UI/UX
- ✅ Comprehensive testing
- ✅ Production deployment

### Acceptance Criteria
- Game runs smoothly
- No major bugs
- Good user experience
- Ready for public use

---

## Testing Strategy

### Unit Testing
- Each phase includes unit tests
- Focus on business logic
- Test edge cases and error conditions

### Integration Testing
- Test phase transitions
- Multi-player scenarios
- End-to-end workflows

### Performance Testing
- Load testing with multiple games
- AI performance benchmarks
- Real-time subscription limits

### User Testing
- Play testing with real users
- Feedback collection
- Usability improvements

## Risk Mitigation

### Technical Risks
- Convex limitations → Workarounds and alternatives
- Real-time complexity → Simplified initial implementation
- AI performance → Time limits and fallbacks

### Schedule Risks
- Scope creep → Stick to core features first
- Technical debt → Regular refactoring
- Blocking issues → Parallel development tracks

### Quality Risks
- Bugs → Comprehensive testing
- Performance → Regular profiling
- User experience -> User feedback loops

This implementation plan provides a clear roadmap from basic infrastructure to a fully-featured Online Catan game, with built-in testing and risk mitigation strategies.
