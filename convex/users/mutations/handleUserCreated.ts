import { Infer, v } from "convex/values";
import { MutationCtx } from "../../_generated/server";

export const userCreatedArgs = v.object({
  clerkUser: v.any(),
});

export const userCreatedHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof userCreatedArgs>,
) => {
  const { clerkUser } = args;

  try {
    console.log("Creating User from Clerk Webhook:", clerkUser);

    const email = clerkUser.email_addresses?.[0]?.email_address;
    if (!email) {
      throw new Error("User email is required");
    }

    // Extract user data from Clerk user object
    const userData = {
      clerkId: clerkUser.id,
      firstName: clerkUser.first_name || "",
      lastName: clerkUser.last_name || "",
      email,
      imageUrl: clerkUser.image_url,
      phone: clerkUser.phone_numbers?.[0]?.phone_number,
    };

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userData.clerkId))
      .first();

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return;
    }

    // Create new user
    const userId = await ctx.db.insert("users", userData);

    console.log("User created successfully:", userId);

    return userId;
  } catch (error) {
    console.error("Error handling user created:", error);
    throw error;
  }
};
