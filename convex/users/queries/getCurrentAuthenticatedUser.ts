import { Infer, v } from 'convex/values';
import { GenericQueryCtx } from 'convex/server';
import type { DataModel } from '../../_generated/dataModel';

export const getCurrentAuthenticatedUserArgs = v.object({
  clerkId: v.string(),
});

export const getCurrentAuthenticatedUserHandler = async (
  ctx: GenericQueryCtx<DataModel>,
  args: Infer<typeof getCurrentAuthenticatedUserArgs>,
) => {
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q: any) => q.eq('clerkId', args.clerkId))
    .first();
  
  return user;
};
