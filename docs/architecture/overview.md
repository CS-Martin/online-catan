# Architecture Overview

## System Design

Online Catan is a real-time multiplayer board game built with modern web technologies. The architecture prioritizes:

- **Real-time synchronization** - All players see game state instantly
- **Scalable multiplayer** - Support for 2-4 players (human + AI)
- **Fair AI gameplay** - Server-side AI logic prevents cheating
- **Responsive UI** - Smooth interactions with optimistic updates

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | React framework with server components |
| | React 19 | UI library with latest features |
| | Tailwind CSS | Utility-first styling |
| | shadcn/ui | Component library |
| | SVG/Canvas | Hex board rendering |
| **Backend** | Convex | Real-time database + server functions |
| | Convex Queries | Reactive data fetching |
| | Convex Mutations | Database operations |
| | Convex Actions | Server-side logic (AI, external APIs) |
| **Authentication** | Clerk | User authentication & management |
| **Real-time** | Convex Subscriptions | Automatic UI updates |
| **AI Players** | Convex Actions | Server-side AI decision making |

## Architecture Patterns

### 1. Feature-Driven Organization
```
src/
├── features/
│   ├── game/          # Game logic, board rendering, rules
│   ├── lobby/         # Multiplayer lobby system
│   ├── ai/            # AI player strategies
│   └── auth/          # Authentication utilities
├── components/        # Reusable UI components
└── app/              # Next.js pages and layouts
```

### 2. Real-Time State Management
- **Single Source of Truth**: All game state lives in Convex
- **Reactive UI**: Components automatically update when state changes
- **Optimistic Updates**: UI responds instantly, server validates
- **Conflict Resolution**: Server-side rules prevent invalid moves

### 3. Separation of Concerns
- **Frontend**: UI rendering, user interactions, real-time subscriptions
- **Backend**: Game rules, AI logic, data persistence, multiplayer coordination
- **Authentication**: User management, session handling

## Data Flow

```
User Action → Frontend Component → Convex Mutation → Game Rules Validation → State Update → Real-time Sync → All UI Updates
```

1. **User interacts** with UI (clicks hex, rolls dice, makes trade)
2. **Frontend component** calls Convex mutation
3. **Server validates** action against game rules
4. **Database updates** if action is valid
5. **Convex automatically syncs** changes to all connected clients
6. **All players see** the updated game state instantly

## Multiplayer Architecture

### Lobby System
- Players create/join lobbies before games start
- Host can add AI players with different difficulty levels
- Real-time player count and status updates

### Game Sessions
- Each game is isolated with its own state
- Players can only interact with their active game
- Spectator mode could be added later

### AI Integration
- AI players run as server-side Convex actions
- Ensures fair play (AI can't be manipulated by clients)
- Configurable difficulty levels

## Performance Considerations

### Frontend
- **Component memoization** to prevent unnecessary re-renders
- **SVG optimization** for smooth hex board rendering
- **Lazy loading** for non-critical UI components

### Backend
- **Efficient queries** with proper Convex indexes
- **Batch operations** for resource distribution
- **AI computation limits** to prevent server overload

### Real-time
- **Selective subscriptions** - only subscribe to relevant game data
- **Debounced updates** for rapid actions (dice rolling animations)
- **Connection management** for smooth multiplayer experience

## Security Model

### Authentication
- Clerk handles user authentication
- Convex enforces user permissions in all mutations
- Players can only modify their own game state

### Game Integrity
- All game rules enforced server-side
- AI logic runs on server to prevent manipulation
- Input validation on all mutations

### Data Privacy
- User profiles separated from game data
- Optional display names for privacy
- Game history could be made private/public per user preference

## Scalability Path

### Phase 1: Core Features
- 2-4 player games
- Basic AI (easy/medium/hard)
- Simple lobby system

### Phase 2: Enhanced Features
- Spectator mode
- Game replays
- Leaderboards and rankings
- Custom game variants

### Phase 3: Advanced Features
- Tournament system
- Guilds or teams
- Advanced AI with learning
- Mobile app support

## Deployment Architecture

### Development
- Local Convex development server
- Next.js development mode
- Clerk development keys

### Production
- Convex cloud deployment
- Vercel for Next.js hosting
- Clerk production authentication
- CDN for static assets

## Monitoring & Analytics

### Game Metrics
- Games played per day
- Average game duration
- Player retention rates
- AI win rates by difficulty

### Technical Metrics
- Convex function performance
- Real-time connection health
- API response times
- Error rates and types
