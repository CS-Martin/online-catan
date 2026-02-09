# Online Catan Documentation

This folder contains the complete architecture, design, and implementation documentation for the Online Catan game.

## 📋 Table of Contents

- [Architecture Overview](./architecture/overview.md) - High-level system design and tech stack
- [Domain Model](./architecture/domain-model.md) - Entities, relationships, and data flow
- [Convex Schema](./architecture/convex-schema.md) - Complete database schema with tables and indexes
- [Game Flow](./architecture/game-flow.md) - State machine and turn sequence
- [Feature Modules](./architecture/feature-modules.md) - Code organization and module structure
- [AI Design](./architecture/ai-design.md) - AI player strategies and implementation
- [Building Costs](./game-rules/building-costs.md) - Resource costs for all structures
- [Implementation Plan](./implementation/implementation-plan.md) - Phased development roadmap

## 🎯 Game Scope (Core Catan)

- **2–4 players** (human or AI)
- **Hex board** with 19 land tiles + ocean border
- **Resources**: Brick, Lumber, Ore, Grain, Wool
- **Structures**: Roads, Settlements, Cities
- **Mechanics**: Dice rolling, resource production, robber, trading (player-to-player & bank 4:1), building, victory points
- **Win condition**: First to 10 victory points

## 🚀 Quick Start

1. Read the [Architecture Overview](./architecture/overview.md) to understand the system design
2. Review the [Implementation Plan](./implementation/implementation-plan.md) for the development roadmap
3. Start with Phase 1: Board Engine and Phase 2: Schema Definition

## 📁 Documentation Structure

```
docs/
├── README.md                    # This file
├── architecture/                # System architecture docs
│   ├── overview.md              # High-level design & tech stack
│   ├── domain-model.md          # Entities & relationships
│   ├── convex-schema.md         # Database schema
│   ├── game-flow.md             # State machine & turn sequence
│   ├── feature-modules.md       # Code organization
│   └── ai-design.md             # AI player design
├── game-rules/                  # Game mechanics documentation
│   ├── building-costs.md        # Resource costs
│   ├── victory-points.md        # Scoring system
│   └── trading-rules.md         # Trading mechanics
├── implementation/              # Development guides
│   ├── implementation-plan.md   # Phased roadmap
│   ├── board-engine.md          # Hex grid implementation
│   ├── lobby-system.md          # Multiplayer lobby
│   └── real-time-updates.md     # Convex reactivity
└── api/                         # API documentation
    ├── convex-mutations.md      # Database operations
    ├── convex-queries.md        # Data fetching
    └── convex-actions.md        # Server-side logic
```

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui |
| **Backend** | Convex (real-time DB, mutations, queries, actions) |
| **Auth** | Clerk (already set up) |
| **Real-time** | Convex subscriptions (built-in reactivity) |
| **AI Players** | Convex actions (server-side AI logic) |
| **Board Rendering** | SVG or Canvas (hex grid) |

## 📖 Development Notes

- All game state is managed through Convex for real-time synchronization
- UI components use Convex React hooks for automatic updates
- AI players run as Convex actions to ensure fair play
- The hex board uses a coordinate system for efficient adjacency calculations
