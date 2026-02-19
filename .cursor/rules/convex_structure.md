---
description: Convex folder structure and function organization guidelines
globs: convex/**/*.ts,convex/**/*.js
alwaysApply: true
---

# Convex Folder Structure Guidelines

## Overview

This project organizes Convex code by feature folders. Each feature lives in `convex/{feature}/` with an `api.ts` entry file that wires validators and handlers into Convex runtime functions (`query`, `mutation`, `internalMutation`, `internalAction`).

## Core Structure Pattern

### 1. Feature Entry File

- **Location**: `convex/{feature}/api.ts`
- **Purpose**: The single place that calls `query`, `mutation`, `internalMutation`, `internalAction` to register Convex functions
- **Pattern**: Import `{functionName}Args` and `{functionName}Handler` from function files, then wire them

**Example**: `convex/career/api.ts`

```typescript
import { query, mutation } from '../_generated/server';
import { getCareerInsightsByUserIdArgs, getCareerInsightsByUserIdHandler } from './queries/getCareerInsightsByUserId';
import { saveCareerInsightArgs, saveCareerInsightHandler } from './mutations/saveCareerInsight';

export const getCareerInsightsByUserId = query({
  args: getCareerInsightsByUserIdArgs,
  handler: getCareerInsightsByUserIdHandler,
});

export const saveCareerInsight = mutation({
  args: saveCareerInsightArgs,
  handler: saveCareerInsightHandler,
});
```

**Example with internal functions**: `convex/users/api.ts`

```typescript
import { internalMutation, mutation, query } from '../_generated/server';
import { userCreatedArgs, userCreatedHandler, completeOnboardingArgs, completeOnboardingHandler } from './mutations';
import { getUserByClerkIdArgs, getUserByClerkIdHandler } from './queries';

export const handleUserCreated = internalMutation({
  args: userCreatedArgs,
  handler: userCreatedHandler,
});

export const completeOnboarding = mutation({
  args: completeOnboardingArgs,
  handler: completeOnboardingHandler,
});

export const getUserByClerkId = query({
  args: getUserByClerkIdArgs,
  handler: getUserByClerkIdHandler,
});
```

**Example with actions and scheduling**: `convex/generation/api.ts`

```typescript
import { mutation, internalAction, internalMutation } from '../_generated/server';
import { startGenerationArgs, startGenerationHandler } from './mutations/startGeneration';
import { updateGenerationStatusArgs, updateGenerationStatusHandler } from './mutations/updateGenerationStatus';
import { generateInsightsArgs, generateInsightsHandler } from './actions/generateInsights';

// Public mutations (called from client)
export const startGeneration = mutation({
  args: startGenerationArgs,
  handler: startGenerationHandler,
});

// Internal mutations (called from actions)
export const updateGenerationStatus = internalMutation({
  args: updateGenerationStatusArgs,
  handler: updateGenerationStatusHandler,
});

// Internal actions (scheduled background jobs)
export const generateInsights = internalAction({
  args: generateInsightsArgs,
  handler: generateInsightsHandler,
});
```

### 2. Feature Folder Structure

```
convex/{feature}/
├── api.ts                # Entry: wires handlers/args into Convex functions
├── {feature}.model.ts    # Table definitions, validators, enums for schema.ts
├── queries/
│   ├── index.ts          # Re-exports all query files via export * from './...'
│   └── {functionName}.ts # Individual query handler + args
├── mutations/
│   ├── index.ts          # Re-exports all mutation files via export * from './...'
│   └── {functionName}.ts # Individual mutation handler + args
└── actions/              # (optional, only for features with actions)
    ├── index.ts          # Re-exports all action files via export * from './...'
    └── {functionName}.ts # Individual action handler + args
```

### 3. Function File Pattern

Each function file exports two things:
- `{functionName}Args`: A `v.object({...})` validator
- `{functionName}Handler`: An async function with typed ctx and args

**Query example**: `convex/career/queries/getCareerInsightsByUserId.ts`

```typescript
import { Infer, v } from 'convex/values';
import { GenericQueryCtx } from 'convex/server';
import type { DataModel } from '../../_generated/dataModel';

export const getCareerInsightsByUserIdArgs = v.object({
  userId: v.id('users'),
});

export const getCareerInsightsByUserIdHandler = async (
  ctx: GenericQueryCtx<DataModel>,
  args: Infer<typeof getCareerInsightsByUserIdArgs>
) => {
  const { userId } = args;

  try {
    const careerInsights = await ctx.db
      .query('careerInsights')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    return careerInsights;
  } catch (error) {
    console.error('Error fetching career insights:', error);
    throw error;
  }
};
```

**Mutation example**: `convex/generation/mutations/startGeneration.ts`

```typescript
import { Infer, v } from 'convex/values';
import { MutationCtx } from '../../_generated/server';
import { internal } from '../../_generated/api';

export const startGenerationArgs = v.object({
  userId: v.id('users'),
  context: v.string(),
});

export const startGenerationHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof startGenerationArgs>
) => {
  const { userId, context } = args;

  await ctx.db.patch(userId, {
    generationStatus: 'generating',
    updatedAt: Date.now(),
  });

  await ctx.scheduler.runAfter(0, internal.generation.api.generateInsights, {
    userId,
    context,
  });

  return { success: true };
};
```

**Action example** (uses "use node" for Node.js APIs):

```typescript
"use node";

import { Infer, v } from 'convex/values';
import { ActionCtx } from '../../_generated/server';
import { api, internal } from '../../_generated/api';

export const generateInsightsArgs = v.object({
  userId: v.id('users'),
  context: v.string(),
});

export const generateInsightsHandler = async (
  ctx: ActionCtx,
  args: Infer<typeof generateInsightsArgs>
) => {
  // Actions cannot use ctx.db — use ctx.runMutation / ctx.runQuery instead
  await ctx.runMutation(api.career.api.saveCareerInsight, { ... });
};
```

### 4. Index Files (barrel exports)

Each queries/, mutations/, and actions/ folder has an index.ts that re-exports everything:

```typescript
// convex/users/mutations/index.ts
export * from './handleUserCreated';
export * from './handleUserDeleted';
export * from './handleUserUpdated';
export * from './completeOnboarding';
export * from './saveUserAnswer';
```

This allows api.ts to import from the folder directly:

```typescript
import { userCreatedArgs, userCreatedHandler } from './mutations';
```

### 5. Schema File

- **Location**: `convex/schema.ts`
- **Purpose**: Imports table definitions from each feature's {feature}.model.ts and composes the full schema

```typescript
import { defineSchema } from 'convex/server';
import { users, userAnswers, userOpportunities } from './users/user.model';
import { questions } from './questions/question.model';
import { careerInsights, careerInsightLogs } from './career/career.model';
import { opportunities } from './opportunities/opportunity.model';

export default defineSchema({
  users,
  userAnswers,
  userOpportunities,
  questions,
  careerInsights,
  careerInsightLogs,
  opportunities,
});
```

### 6. Model Files

- **Location**: `convex/{feature}/{feature}.model.ts`
- **Purpose**: Define table schemas using defineTable, validators, and shared enums
- **Exports**: Table definitions (used by schema.ts), reusable validators, enum types

## Key Conventions

### Naming
- **Feature folder**: `convex/{feature}/`
- **Entry file**: `api.ts` (NOT index.ts)
- **Args export**: `{functionName}Args` — always a `v.object({...})`
- **Handler export**: `{functionName}Handler` — async function
- **Query ctx type**: `GenericQueryCtx<DataModel>` (from convex/server + _generated/dataModel)
- **Mutation ctx type**: `MutationCtx` (from _generated/server)
- **Action ctx type**: `ActionCtx` (from _generated/server)
- **Handler args type**: `Infer<typeof {functionName}Args>` (from convex/values)

### Function Visibility
- `query` / `mutation` / `action` — **public** (callable from client)
- `internalQuery` / `internalMutation` / `internalAction` — **internal** (callable only from other Convex functions)

### Function References
- Public functions: `api.{feature}.api.{functionName}` (e.g. api.career.api.saveCareerInsight)
- Internal functions: `internal.{feature}.api.{functionName}` (e.g. internal.generation.api.generateInsights)

## Current Project Structure

```
convex/
├── schema.ts
├── http.ts
├── auth.config.ts
├── convex.config.ts
├── career/
│   ├── api.ts
│   ├── career.model.ts
│   ├── mutations/
│   │   ├── index.ts
│   │   └── saveCareerInsight.ts
│   └── queries/
│       └── getCareerInsightsByUserId.ts
├── generation/
│   ├── api.ts
│   ├── actions/
│   │   ├── index.ts
│   │   ├── generateInsights.ts
│   │   └── generateOpportunities.ts
│   └── mutations/
│       ├── index.ts
│       ├── startGeneration.ts
│       └── updateGenerationStatus.ts
├── opportunities/
│   ├── api.ts
│   ├── opportunity.model.ts
│   ├── mutations/
│   │   ├── index.ts
│   │   ├── saveOpportunity.ts
│   │   └── saveUserOpportunity.ts
│   └── queries/
│       ├── index.ts
│       ├── getAllOpportunities.ts
│       └── getUserOpportunities.ts
├── questions/
│   ├── api.ts
│   ├── question.model.ts
│   └── queries/
│       ├── index.ts
│       └── getQuestionsByUserType.ts
└── users/
    ├── api.ts
    ├── user.model.ts
    ├── mutations/
    │   ├── index.ts
    │   ├── completeOnboarding.ts
    │   ├── handleUserCreated.ts
    │   ├── handleUserDeleted.ts
    │   ├── handleUserUpdated.ts
    │   └── saveUserAnswer.ts
    └── queries/
        ├── index.ts
        ├── getCurrentAuthenticatedUser.ts
        ├── getUserByClerkId.ts
        └── getUserById.ts
```

## Implementation Checklist

### When Creating a New Feature
- [ ] Create `convex/{feature}/` folder
- [ ] Create `{feature}.model.ts` with table definitions
- [ ] Add table to `convex/schema.ts`
- [ ] Create `queries/` and/or `mutations/` folders with `index.ts`
- [ ] Create `api.ts` that wires everything together

### When Adding a New Function
- [ ] Create file in `queries/`, `mutations/`, or `actions/` named after the function
- [ ] Export `{functionName}Args` (v.object) and `{functionName}Handler` (async function)
- [ ] Add `export * from './{functionName}'` to the folder's `index.ts`
- [ ] Import args + handler into `api.ts` and register with `query`/`mutation`/`internalAction` etc.
