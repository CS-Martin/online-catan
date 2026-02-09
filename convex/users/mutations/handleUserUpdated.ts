import { Infer, v } from "convex/values";
import { mutation, MutationCtx } from "../../_generated/server";

export const userUpdatedArgs = v.object({
  clerkUser: v.any(),
});

export const userUpdatedHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof userUpdatedArgs>,
) => {
  const { clerkUser } = args;

  // Find existing user
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkUser.id))
    .first();

  if (!existingUser) {
    console.log("User not found, creating new user");

    // Extract email
    const email = clerkUser.email_addresses[0]?.email_address;
    if (!email) {
      throw new Error("User email is required");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      clerkId: clerkUser.id,
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
      email,
      imageUrl: clerkUser.image_url,
      phone: clerkUser.phone_numbers?.[0]?.phone_number,
    });

    console.log("Created user:", userId);
    return userId;
  }

  // Extract email
  const email = clerkUser.email_addresses[0]?.email_address;

  if (!email) {
    throw new Error("User email is required");
  }

  // Update user
  const updatedUser = await ctx.db.patch(existingUser._id, {
    email,
    firstName: clerkUser.first_name || existingUser.firstName,
    lastName: clerkUser.last_name || existingUser.lastName,
    imageUrl: clerkUser.image_url,
    phone: clerkUser.phone_numbers?.[0]?.phone_number,
  });

  console.log("Updated user:", updatedUser);

  return updatedUser;
};
