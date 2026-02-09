import { internalMutation, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import {
  userCreatedArgs,
  userCreatedHandler,
  userDeletedArgs,
  userDeletedHandler,
  userUpdatedArgs,
  userUpdatedHandler,
} from "./mutations";
import {
  getCurrentAuthenticatedUserArgs,
  getCurrentAuthenticatedUserHandler,
  getUserByClerkIdArgs,
  getUserByClerkIdHandler,
  getUserByIdArgs,
  getUserByIdHandler,
} from "./queries";

// Mutations
export const handleUserCreated = internalMutation({
  args: userCreatedArgs,
  handler: userCreatedHandler,
});

export const handleUserDeleted = internalMutation({
  args: userDeletedArgs,
  handler: userDeletedHandler,
});

export const handleUserUpdated = internalMutation({
  args: userUpdatedArgs,
  handler: userUpdatedHandler,
});

// Public Mutations
export const updateUserProfile = mutation({
  args: { clerkId: v.string(), displayName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {};
    if (args.displayName !== undefined) {
      updateData.displayName = args.displayName;
    }

    await ctx.db.patch(user._id, updateData);
    return user._id;
  },
});

export const updateGameStats = mutation({
  args: {
    clerkId: v.string(),
    gamesPlayed: v.optional(v.number()),
    gamesWon: v.optional(v.number()),
    elo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {};
    if (args.gamesPlayed !== undefined) {
      updateData.gamesPlayed = args.gamesPlayed;
    }
    if (args.gamesWon !== undefined) {
      updateData.gamesWon = args.gamesWon;
    }
    if (args.elo !== undefined) {
      updateData.elo = args.elo;
    }

    await ctx.db.patch(user._id, updateData);
    return user._id;
  },
});

// Queries
export const getCurrentAuthenticatedUser = query({
  args: getCurrentAuthenticatedUserArgs,
  handler: getCurrentAuthenticatedUserHandler,
});

export const getUserByClerkId = query({
  args: getUserByClerkIdArgs,
  handler: getUserByClerkIdHandler,
});

export const getUserById = query({
  args: getUserByIdArgs,
  handler: getUserByIdHandler,
});

export const getUserStats = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    return {
      gamesPlayed: user.gamesPlayed || 0,
      gamesWon: user.gamesWon || 0,
      elo: user.elo || 1000,
      winRate:
        (user.gamesPlayed || 0) > 0
          ? (user.gamesWon || 0) / (user.gamesPlayed || 0)
          : 0,
    };
  },
});

// Additional user queries
import { getUser, searchUsers } from "./queries";
export { getUser, searchUsers };
