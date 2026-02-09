import { Infer, v } from 'convex/values';
import { GenericQueryCtx } from 'convex/server';
import type { DataModel } from '../../_generated/dataModel';

export const getUserByClerkIdArgs = v.object({
  clerkId: v.string(),
});

export const getUserByClerkIdHandler = async (ctx: GenericQueryCtx<DataModel>, args: Infer<typeof getUserByClerkIdArgs>) => {
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q: any) => q.eq('clerkId', args.clerkId))
    .first();
    
  return user;
};
