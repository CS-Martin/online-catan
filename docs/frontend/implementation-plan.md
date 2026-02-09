---
description: Next.js frontend implementation plan for Online Catan game
---

# Next.js Frontend Implementation Plan

## Overview

This document outlines the phased implementation of the Next.js frontend for the Online Catan game, following the established architecture patterns and feature-driven organization.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Convex React hooks for real-time data
- **Authentication**: Clerk
- **Type Safety**: TypeScript throughout
- **UI Components**: shadcn/ui + custom components
- **Real-time**: Convex subscriptions for live updates

## Phase Structure

### Phase 1: Foundation & Authentication
**Duration**: 1-2 weeks
**Objective**: Establish core infrastructure and user authentication

#### Tasks:
1. **Setup & Configuration**
   - Configure Tailwind CSS
   - Setup shadcn/ui components
   - Configure Clerk authentication
   - Setup Convex provider
   - Create base layout structure

2. **Authentication Pages**
   - Sign in page (`/sign-in`)
   - Sign up page (`/sign-up`)
   - Authentication callbacks
   - Protected route middleware

3. **Core Components**
   - Layout wrapper with providers
   - Navigation components
   - Loading states with skeletons
   - Error boundaries

#### Deliverables:
- ✅ Working authentication system
- ✅ Protected routes
- ✅ Base layout structure
- ✅ Component library setup

#### Acceptance Criteria:
- Users can sign up/sign in with Clerk
- Protected routes redirect to sign-in
- Navigation works properly
- Loading states show during data fetching

---

### Phase 2: User Dashboard & Profile
**Duration**: 1-2 weeks
**Objective**: Create user-facing dashboard and profile management

#### Tasks:
1. **Dashboard Page** (`/dashboard`)
   - User stats overview
   - Recent games list
   - Quick actions (create lobby, find game)
   - Achievement highlights

2. **Profile Page** (`/profile`)
   - Edit profile information
   - Statistics display
   - Achievement showcase
   - Settings management

3. **User Components**
   - Stats cards with skeletons
   - Achievement badges
   - Game history table
   - Profile form components

#### Deliverables:
- ✅ User dashboard with stats
- ✅ Profile management
- ✅ Game history display
- ✅ Achievement system UI

#### Acceptance Criteria:
- Users can view their statistics
- Profile information is editable
- Game history loads correctly
- Achievements display properly

---

### Phase 3: Lobby System
**Duration**: 2-3 weeks
**Objective**: Implement complete lobby management system

#### Tasks:
1. **Lobby Browser** (`/lobbies`)
   - Available lobbies list
   - Filtering and search
   - Private lobby join with code
   - Real-time updates

2. **Lobby Creation** (`/lobbies/create`)
   - Lobby configuration form
   - Private/Public options
   - Player limits (2-4)
   - AI player settings

3. **Lobby Room** (`/lobbies/[id]`)
   - Player list with avatars
   - Color selection modal
   - Ready status management
   - AI player addition
   - Start game functionality

4. **Lobby Components**
   - Lobby cards with live updates
   - Player avatars and status
   - Color selection interface
   - Chat system (optional)

#### Deliverables:
- ✅ Complete lobby browser
- ✅ Lobby creation flow
- ✅ Interactive lobby room
- ✅ Real-time lobby updates

#### Acceptance Criteria:
- Users can create and join lobbies
- Color selection works properly
- Real-time updates show player changes
- Game starts when all players are ready

---

### Phase 4: Game Board & UI
**Duration**: 3-4 weeks
**Objective**: Create the main game interface with board rendering

#### Tasks:
1. **Game Board Component**
   - Hex grid rendering
   - Resource and number tokens
   - Vertex and edge visualization
   - Robber position display
   - Zoom and pan controls

2. **Game UI Layout**
   - Player panels with resources
   - Dice rolling interface
   - Action buttons (build, trade, end turn)
   - Game log display
   - Turn indicator

3. **Interactive Elements**
   - Click handlers for building
   - Drag and drop for trading
   - Hover states and tooltips
   - Animation transitions

4. **Board Components**
   - Hex tiles with proper styling
   - Road and settlement pieces
   - Resource indicators
   - Dice animation

#### Deliverables:
- ✅ Interactive game board
- ✅ Complete game UI
- ✅ Smooth animations
- ✅ Responsive design

#### Acceptance Criteria:
- Board renders correctly with random layout
- All game actions are accessible
- Animations are smooth and performant
- UI works on different screen sizes

---

### Phase 5: Game Mechanics
**Duration**: 3-4 weeks
**Objective**: Implement all core game mechanics and interactions

#### Tasks:
1. **Dice Rolling**
   - Dice animation component
   - Resource distribution display
   - Robber movement trigger
   - Sound effects (optional)

2. **Building System**
   - Settlement placement
   - Road building
   - City upgrades
   - Cost validation
   - Placement validation

3. **Trading System**
   - Player-to-player trades
   - Bank trades (4:1, 3:1, 2:1)
   - Port trades
   - Trade offers management

4. **Robber Mechanics**
   - Robber movement
   - Resource stealing
   - Hex blocking
   - 7-roll handling

5. **Turn Management**
   - Turn indicators
   - Phase transitions
   - End turn functionality
   - Victory point tracking

#### Deliverables:
- ✅ Complete dice system
- ✅ Building mechanics
- ✅ Trading interface
- ✅ Robber functionality
- ✅ Turn management

#### Acceptance Criteria:
- All game mechanics work correctly
- Rules are properly enforced
- User interface is intuitive
- Performance remains smooth

---

### Phase 6: Advanced Features
**Duration**: 2-3 weeks
**Objective**: Add polish and advanced features

#### Tasks:
1. **Statistics & Analytics**
   - In-game statistics
   - Performance metrics
   - Historical data
   - Charts and graphs

2. **Settings & Preferences**
   - Game settings
   - Audio controls
   - Theme selection
   - Accessibility options

3. **Social Features**
   - Friend system
   - Player profiles
   - Game invitations
   - Chat system

4. **Performance Optimization**
   - Lazy loading
   - Code splitting
   - Image optimization
   - Caching strategies

#### Deliverables:
- ✅ Statistics dashboard
- ✅ Settings panel
- ✅ Social features
- ✅ Optimized performance

#### Acceptance Criteria:
- Advanced features work seamlessly
- Performance is optimized
- User experience is polished
- Accessibility standards are met

---

### Phase 7: Mobile Responsiveness
**Duration**: 1-2 weeks
**Objective**: Ensure excellent mobile experience

#### Tasks:
1. **Mobile Layout**
   - Responsive board scaling
   - Touch-friendly controls
   - Mobile navigation
   - Optimized UI density

2. **Touch Interactions**
   - Tap gestures
   - Swipe controls
   - Pinch-to-zoom
   - Long press actions

3. **Performance**
   - Mobile optimization
   - Reduced animations
   - Efficient rendering
   - Battery usage optimization

#### Deliverables:
- ✅ Mobile-optimized interface
- ✅ Touch interactions
- ✅ Responsive design
- ✅ Mobile performance

#### Acceptance Criteria:
- App works well on mobile devices
- Touch interactions are intuitive
- Performance remains good
- No horizontal scrolling

---

### Phase 8: Testing & Polish
**Duration**: 1-2 weeks
**Objective**: Comprehensive testing and final polish

#### Tasks:
1. **Testing Suite**
   - Unit tests for components
   - Integration tests for game flow
   - E2E tests with Playwright
   - Performance testing

2. **Bug Fixes**
   - Address reported issues
   - Edge case handling
   - Error improvement
   - Accessibility fixes

3. **Documentation**
   - Component documentation
   - User guides
   - API documentation
   - Deployment guides

#### Deliverables:
- ✅ Comprehensive test suite
- ✅ Bug-free experience
- ✅ Complete documentation
- ✅ Production readiness

#### Acceptance Criteria:
- All tests pass
- No critical bugs remain
- Documentation is complete
- Ready for production deployment

---

## Component Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (authentication)/   # Auth pages
│   ├── dashboard/           # User dashboard
│   ├── lobbies/             # Lobby system
│   ├── game/                # Game pages
│   └── profile/             # User profile
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui base components
│   ├── game/                # Game-specific components
│   ├── lobby/               # Lobby components
│   └── layout/              # Layout components
├── features/                # Feature modules
│   ├── auth/                # Authentication logic
│   ├── game/                # Game logic
│   ├── lobby/               # Lobby logic
│   └── user/                # User logic
├── hooks/                   # Custom React hooks
├── lib/                    # Utilities and helpers
└── providers/              # React context providers
```

### Component Patterns

#### 1. Feature Components
```typescript
// src/components/game/GameBoard.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function GameBoard({ gameId }: { gameId: string }) {
  const game = useQuery(api.games.getGame, { gameId });
  
  if (game === undefined) {
    return <GameBoardSkeleton />;
  }

  return (
    <div className="relative w-full h-full">
      {/* Board rendering logic */}
    </div>
  );
}
```

#### 2. Layout Components
```typescript
// src/components/layout/GameLayout.tsx
export function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
      <GamePanel />
    </div>
  );
}
```

#### 3. UI Components
```typescript
// src/components/ui/Button.tsx (shadcn/ui)
export function Button({ 
  variant, 
  size, 
  className, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

### State Management Patterns

#### 1. Convex Integration
```typescript
// Real-time game state
const game = useQuery(api.games.getGame, { gameId });
const players = useQuery(api.games.getGamePlayers, { gameId });

// Mutations
const rollDice = useMutation(api.games.rollDice);
const buildRoad = useMutation(api.games.buildRoad);
```

#### 2. Local State
```typescript
// Component state with useState
const [selectedHex, setSelectedHex] = useState<number | null>(null);
const [isBuilding, setIsBuilding] = useState(false);
```

#### 3. Custom Hooks
```typescript
// src/hooks/useGameActions.ts
export function useGameActions(gameId: string) {
  const rollDice = useMutation(api.games.rollDice);
  const buildRoad = useMutation(api.games.buildRoad);
  
  const handleRollDice = async () => {
    await rollDice({ gameId, playerIndex: 0 });
  };

  return { handleRollDice };
}
```

## Performance Considerations

### 1. Code Splitting
```typescript
// Dynamic imports for heavy components
const GameBoard = dynamic(() => import('./GameBoard'), {
  loading: () => <GameBoardSkeleton />,
  ssr: false
});
```

### 2. Image Optimization
```typescript
// Next.js Image component
import Image from 'next/image';

<Image
  src="/hex-grass.png"
  alt="Grass hex"
  width={100}
  height={100}
  priority={false}
/>
```

### 3. Real-time Subscriptions
```typescript
// Efficient Convex subscriptions
const game = useQuery(api.games.getGame, { gameId }, {
  // Re-render only when specific fields change
});
```

## Testing Strategy

### 1. Unit Tests
```typescript
// __tests__/components/GameBoard.test.tsx
import { render, screen } from '@testing-library/react';
import { GameBoard } from '@/components/game/GameBoard';

test('renders game board', () => {
  render(<GameBoard gameId="test" />);
  expect(screen.getByTestId('game-board')).toBeInTheDocument();
});
```

### 2. Integration Tests
```typescript
// __tests__/integration/game-flow.test.tsx
test('complete game flow', async () => {
  // Test complete game from start to finish
});
```

### 3. E2E Tests
```typescript
// e2e/game.spec.ts
import { test, expect } from '@playwright/test';

test('player can win game', async ({ page }) => {
  await page.goto('/game/test');
  // Complete game actions
  await expect(page.getByText('You Win!')).toBeVisible();
});
```

## Deployment Strategy

### 1. Development
```bash
npm run dev
```

### 2. Production Build
```bash
npm run build
npm run start
```

### 3. Environment Variables
```env
NEXT_PUBLIC_CONVEX_URL=your-convex-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
```

## Success Metrics

### Phase Completion Criteria
- All deliverables completed
- Acceptance criteria met
- Tests passing
- Performance benchmarks met
- Code review approved

### Quality Gates
- TypeScript errors: 0
- ESLint warnings: 0
- Test coverage: >80%
- Lighthouse score: >90
- Performance: <3s initial load

This implementation plan provides a structured approach to building the Online Catan frontend while maintaining code quality, performance, and user experience standards.
