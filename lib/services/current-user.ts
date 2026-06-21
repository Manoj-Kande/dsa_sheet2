// ============================================
// Resolves the signed-in Clerk user to our internal User row.
// Used by every service that needs to scope data to a user.
// ============================================
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "UnauthorizedError";
  }
}

/**
 * Returns the internal User record for the currently signed-in Clerk user.
 * Throws UnauthorizedError if no one is signed in.
 *
 * Note: in the normal flow the user row already exists because the Clerk
 * webhook creates it on signup. The upsert here is a safety net for the
 * rare case the webhook hasn't fired yet (e.g. first request right after
 * signup in local dev without webhook tunneling configured).
 */
export async function getCurrentUser() {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) {
    throw new UnauthorizedError();
  }

  const email = `${clerkId}@placeholder.local`;

  const user = await prisma.user.upsert({
    where: { clerkId },
    create: { clerkId, email },
    update: {},
  });

  return user;
}
