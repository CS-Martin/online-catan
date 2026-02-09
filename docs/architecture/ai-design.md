# AI Player Design

## AI Architecture Overview

AI players are implemented as **Convex actions** that run server-side, ensuring:

- **Fair play** - AI logic cannot be manipulated by clients
- **Consistent performance** - All AI calculations happen on the server
- **Real-time integration** - AI actions update game state like human players
- **Scalable difficulty** - Easy to add new AI strategies

## AI Difficulty Levels

### 1. Easy AI
**Strategy**: Random valid moves with basic prioritization

**Characteristics**:
- Chooses randomly from all valid moves
- Minimal strategic planning
- Occasional suboptimal trades
- Simple resource management

**Decision Tree**:
```
1. Can build settlement? (30% chance)
2. Can build road? (25% chance)
3. Can build city? (20% chance)
4. Make random trade? (15% chance)
5. End turn (10% chance)
```

### 2. Medium AI
**Strategy**: Weighted heuristics based on game state

**Characteristics**:
- Prioritizes resource diversity
- Expands toward scarce resources
- Basic trading strategy
- Considers opponent positions

**Heuristic Weights**:
```typescript
const mediumWeights = {
  settlement: 0.4,      // High priority for expansion
  road: 0.3,           // Connect to new resources
  city: 0.2,           // Upgrade when resources available
  trade: 0.1,          // Trade when beneficial
};
```

### 3. Hard AI
**Strategy**: Advanced evaluation with lookahead

**Characteristics**:
- Minimax-lite with 2-turn lookahead
- Resource scarcity analysis
- Opponent position awareness
- Optimal trading strategies
- Longest road competition

**Evaluation Factors**:
```typescript
const evaluationFactors = {
  victoryPoints: 10,      // Primary goal
  resourceDiversity: 3,   # Access to all 5 resources
  expansionPotential: 2,  # Available building spots
  longestRoad: 2,         # Road network control
  opponentBlocking: 1,    # Strategic positioning
  tradeEfficiency: 1,     # Favorable trade ratios
};
```

## AI Decision Framework

### Core AI Action
```typescript
// convex/games/actions/aiTurn.ts
export const aiTurn = action({
  args: {
    gameId: v.id("games"),
    playerIndex: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  },
  handler: async (ctx, { gameId, playerIndex, difficulty }) => {
    // Get current game state
    const game = await ctx.runQuery(api.games.queries.getGame, { gameId });
    const player = await ctx.runQuery(api.games.queries.getGamePlayer, 
      { gameId, playerIndex }
    );

    // Select AI strategy based on difficulty
    const strategy = AIStrategyFactory.create(difficulty);
    
    // Make decisions based on current game phase
    switch (game.phase) {
      case "setup_forward":
      case "setup_reverse":
        return await strategy.handleSetupPhase(ctx, game, player);
      
      case "roll_dice":
        return await strategy.handleRollPhase(ctx, game, player);
      
      case "trade_build":
        return await strategy.handleMainPhase(ctx, game, player);
      
      default:
        throw new Error(`AI cannot handle phase: ${game.phase}`);
    }
  },
});
```

### Strategy Factory
```typescript
// convex/features/ai/strategies/strategyFactory.ts
export class AIStrategyFactory {
  static create(difficulty: string): AIStrategy {
    switch (difficulty) {
      case "easy":
        return new EasyAIStrategy();
      case "medium":
        return new MediumAIStrategy();
      case "hard":
        return new HardAIStrategy();
      default:
        throw new Error(`Unknown AI difficulty: ${difficulty}`);
    }
  }
}
```

### Base Strategy Interface
```typescript
// convex/features/ai/strategies/baseStrategy.ts
export abstract class AIStrategy {
  abstract handleSetupPhase(
    ctx: ActionCtx, 
    game: Game, 
    player: GamePlayer
  ): Promise<void>;
  
  abstract handleRollPhase(
    ctx: ActionCtx, 
    game: Game, 
    player: GamePlayer
  ): Promise<void>;
  
  abstract handleMainPhase(
    ctx: ActionCtx, 
    game: Game, 
    player: GamePlayer
  ): Promise<void>;
  
  protected async rollDice(ctx: ActionCtx, gameId: id<"games">): Promise<void> {
    await ctx.runMutation(api.games.mutations.rollDice, { gameId });
  }
  
  protected async endTurn(ctx: ActionCtx, gameId: id<"games">): Promise<void> {
    await ctx.runMutation(api.games.mutations.endTurn, { gameId });
  }
}
```

## Easy AI Implementation

### Setup Phase Strategy
```typescript
// convex/features/ai/strategies/easy.ts
export class EasyAIStrategy extends AIStrategy {
  async handleSetupPhase(ctx: ActionCtx, game: Game, player: GamePlayer) {
    // Find all valid settlement locations
    const validVertices = findValidSettlementLocations(game.board);
    
    // Choose randomly
    const settlementVertex = validVertices[Math.floor(Math.random() * validVertices.length)];
    
    // Find adjacent valid road locations
    const validEdges = findValidRoadLocations(game.board, settlementVertex);
    const roadEdge = validEdges[Math.floor(Math.random() * validEdges.length)];
    
    // Place settlement and road
    await ctx.runMutation(api.games.mutations.buildSettlement, {
      gameId: game._id,
      vertexId: settlementVertex,
    });
    
    await ctx.runMutation(api.games.mutations.buildRoad, {
      gameId: game._id,
      edgeId: roadEdge,
    });
  }
  
  async handleRollPhase(ctx: ActionCtx, game: Game, player: GamePlayer) {
    // Always roll dice
    await this.rollDice(ctx, game._id);
    
    // Small delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  async handleMainPhase(ctx: ActionCtx, game: Game, player: GamePlayer) {
    // Random decision making
    const rand = Math.random();
    
    if (rand < 0.3 && canBuildSettlement(game, player)) {
      await this.buildRandomSettlement(ctx, game, player);
    } else if (rand < 0.6 && canBuildRoad(game, player)) {
      await this.buildRandomRoad(ctx, game, player);
    } else if (rand < 0.8 && canBuildCity(game, player)) {
      await this.buildRandomCity(ctx, game, player);
    } else {
      await this.endTurn(ctx, game._id);
    }
  }
}
```

## Medium AI Implementation

### Resource Analysis
```typescript
// convex/features/ai/lib/resourceAnalysis.ts
export class ResourceAnalyzer {
  static analyzeResources(player: GamePlayer): ResourceAnalysis {
    const total = Object.values(player.resources).reduce((a, b) => a + b, 0);
    const diversity = Object.values(player.resources).filter(r => r > 0).length;
    
    return {
      total,
      diversity,
      scarcity: this.calculateScarcity(player.resources),
      production: this.estimateProduction(player),
    };
  }
  
  private static calculateScarcity(resources: Resources): ResourcePriority[] {
    // Resources with 0 cards are highest priority
    return Object.entries(resources)
      .filter(([_, amount]) => amount === 0)
      .map(([resource, _]) => resource as Resource)
      .sort((a, b) => this.getResourceValue(a) - this.getResourceValue(b));
  }
  
  private static getResourceValue(resource: Resource): number {
    // Higher value for resources needed for settlements
    const values = {
      brick: 3, lumber: 3,  // Road + settlement
      grain: 2, wool: 2,    // Settlement
      ore: 1,               // City (later game)
    };
    return values[resource];
  }
}
```

### Strategic Decision Making
```typescript
// convex/features/ai/strategies/medium.ts
export class MediumAIStrategy extends AIStrategy {
  async handleMainPhase(ctx: ActionCtx, game: Game, player: GamePlayer) {
    const analysis = ResourceAnalyzer.analyzeResources(player);
    const opportunities = this.findOpportunities(game, player, analysis);
    
    // Sort opportunities by score
    opportunities.sort((a, b) => b.score - a.score);
    
    // Execute best opportunity
    const best = opportunities[0];
    if (best.score > 0.5) { // Threshold for taking action
      await this.executeOpportunity(ctx, game, player, best);
    } else {
      // Consider trading
      await this.handleTrading(ctx, game, player, analysis);
    }
  }
  
  private findOpportunities(
    game: Game, 
    player: GamePlayer, 
    analysis: ResourceAnalysis
  ): Opportunity[] {
    const opportunities: Opportunity[] = [];
    
    // Check settlement opportunities
    const settlementSpots = this.findSettlementSpots(game, player);
    settlementSpots.forEach(spot => {
      opportunities.push({
        type: "settlement",
        location: spot.vertexId,
        score: this.scoreSettlement(spot, analysis),
      });
    });
    
    // Check road opportunities
    const roadSpots = this.findRoadSpots(game, player);
    roadSpots.forEach(spot => {
      opportunities.push({
        type: "road",
        location: spot.edgeId,
        score: this.scoreRoad(spot, analysis),
      });
    });
    
    // Check city opportunities
    if (player.settlementsBuilt > 0) {
      const citySpots = this.findCitySpots(game, player);
      citySpots.forEach(spot => {
        opportunities.push({
          type: "city",
          location: spot.vertexId,
          score: this.scoreCity(spot, analysis),
        });
      });
    }
    
    return opportunities;
  }
}
```

## Hard AI Implementation

### Board Evaluation
```typescript
// convex/features/ai/lib/boardEvaluation.ts
export class BoardEvaluator {
  static evaluatePosition(
    game: Game, 
    player: GamePlayer, 
    depth: number = 2
  ): EvaluationResult {
    if (depth === 0 || game.status === "finished") {
      return this.evaluateTerminalState(game, player);
    }
    
    const possibleActions = this.getPossibleActions(game, player);
    const evaluations: EvaluationResult[] = [];
    
    for (const action of possibleActions) {
      const simulatedGame = this.simulateAction(game, player, action);
      const evaluation = this.evaluatePosition(
        simulatedGame.game, 
        simulatedGame.player, 
        depth - 1
      );
      
      evaluations.push({
        score: evaluation.score * 0.9, // Discount future moves
        action,
        depth,
      });
    }
    
    // Return best evaluation
    return evaluations.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }
  
  private static evaluateTerminalState(game: Game, player: GamePlayer): EvaluationResult {
    let score = player.victoryPoints * 100; // Base VP score
    
    // Bonus for longest road
    if (player.hasLongestRoad) score += 20;
    
    // Resource diversity bonus
    const diversity = Object.values(player.resources).filter(r => r > 0).length;
    score += diversity * 5;
    
    // Expansion potential
    const expansionSpots = this.countExpansionSpots(game, player);
    score += expansionSpots * 3;
    
    // Subtract opponent progress
    const opponents = game.gamePlayers.filter(p => p.playerIndex !== player.playerIndex);
    opponents.forEach(opponent => {
      score -= opponent.victoryPoints * 10;
    });
    
    return { score, action: null, depth: 0 };
  }
}
```

### Advanced Trading Strategy
```typescript
// convex/features/ai/lib/tradingStrategy.ts
export class TradingStrategy {
  static findOptimalTrade(
    game: Game, 
    player: GamePlayer, 
    target: Resource
  ): TradeOffer | null {
    const currentResources = player.resources;
    
    // Check if we already have the target
    if (currentResources[target] > 0) return null;
    
    // Find best trade ratio
    const bestTrade = this.calculateBestTrade(currentResources, target);
    
    if (bestTrade && this.isTradeFavorable(bestTrade, game, player)) {
      return bestTrade;
    }
    
    return null;
  }
  
  private static calculateBestTrade(
    resources: Resources, 
    target: Resource
  ): TradeOffer | null {
    // Try 1:1 trades first (player trades)
    for (const [resource, amount] of Object.entries(resources)) {
      if (amount >= 1 && resource !== target) {
        return {
          offering: { [resource]: 1 },
          requesting: { [target]: 1 },
        };
      }
    }
    
    // Try 2:1 trades (port trades if available)
    // ... port logic here
    
    // Try 4:1 bank trades
    for (const [resource, amount] of Object.entries(resources)) {
      if (amount >= 4 && resource !== target) {
        return {
          offering: { [resource]: 4 },
          requesting: { [target]: 1 },
        };
      }
    }
    
    return null;
  }
}
```

## AI Performance Optimization

### Decision Caching
```typescript
// Cache expensive calculations
const decisionCache = new Map<string, Decision>();

export class CachedAI extends AIStrategy {
  async handleMainPhase(ctx: ActionCtx, game: Game, player: GamePlayer) {
    const cacheKey = this.generateCacheKey(game, player);
    
    if (decisionCache.has(cacheKey)) {
      const cachedDecision = decisionCache.get(cacheKey)!;
      return await this.executeDecision(ctx, cachedDecision);
    }
    
    const decision = await this.calculateDecision(game, player);
    decisionCache.set(cacheKey, decision);
    
    return await this.executeDecision(ctx, decision);
  }
}
```

### Time Limits
```typescript
// Prevent AI from taking too long
export class TimeLimitedAI extends AIStrategy {
  async handleMainPhase(ctx: ActionCtx, game: Game, player: GamePlayer) {
    const startTime = Date.now();
    const timeLimit = 3000; // 3 seconds max
    
    try {
      return await this.makeDecision(game, player, timeLimit);
    } catch (error) {
      if (error instanceof TimeoutError) {
        // Fall back to simpler strategy
        return await this.makeQuickDecision(game, player);
      }
      throw error;
    }
  }
}
```

## Testing AI Strategies

### Unit Tests
```typescript
describe("Easy AI", () => {
  test("makes valid moves during setup", () => {
    const game = createTestGame();
    const player = game.players[0];
    const ai = new EasyAIStrategy();
    
    const moves = ai.getSetupMoves(game, player);
    
    expect(moves.settlement).toBeDefined();
    expect(moves.road).toBeDefined();
    expect(isValidSetupPlacement(game, moves)).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe("AI Game Integration", () => {
  test("AI completes full turn", async () => {
    const gameId = await createTestGameWithAI();
    
    // Trigger AI turn
    await aiTurn({ gameId, playerIndex: 1, difficulty: "medium" });
    
    // Verify AI took valid actions
    const game = await getGame(gameId);
    expect(game.turnNumber).toBe(2);
    expect(game.currentPlayerIndex).toBe(2);
  });
});
```

### Performance Benchmarks
```typescript
describe("AI Performance", () => {
  test("Easy AI completes turn in <1 second", async () => {
    const start = Date.now();
    await runAITurn("easy");
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000);
  });
  
  test("Hard AI completes turn in <5 seconds", async () => {
    const start = Date.now();
    await runAITurn("hard");
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000);
  });
});
```

This AI design provides a solid foundation that can be extended with more sophisticated strategies, machine learning approaches, or adaptive difficulty systems as the game evolves.
