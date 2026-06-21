// ============================================
// POST /api/webhooks/clerk
// Keeps our User table in sync with Clerk.
// Configure this URL in the Clerk dashboard: Webhooks → Add Endpoint
//   https://yourdomain.com/api/webhooks/clerk
// Subscribe to: user.created, user.updated, user.deleted
// ============================================
import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { id: string; email_address: string }[];
    primary_email_address_id: string;
    username: string | null;
    image_url: string | null;
  };
};

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("CLERK_WEBHOOK_SECRET is not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = event;

  try {
    if (type === "user.created" || type === "user.updated") {
      const primaryEmail = data.email_addresses.find(
        (e) => e.id === data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        return new Response("No primary email on user", { status: 400 });
      }

      await prisma.user.upsert({
        where: { clerkId: data.id },
        create: {
          clerkId: data.id,
          email: primaryEmail,
          username: data.username,
          avatarUrl: data.image_url,
        },
        update: {
          email: primaryEmail,
          username: data.username,
          avatarUrl: data.image_url,
        },
      });
    }

    if (type === "user.deleted") {
      await prisma.user.deleteMany({ where: { clerkId: data.id } });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Failed to sync Clerk user to DB", err);
    return new Response("Internal error", { status: 500 });
  }
}
