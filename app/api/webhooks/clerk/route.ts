/**
 * Clerk Webhook Handler
 *
 * Syncs Clerk user events to the Prisma database.
 * Handles user.created, user.updated, and user.deleted events.
 *
 * Also stores the DB user ID and role in Clerk publicMetadata
 * so client components can access them without extra API calls.
 *
 * @see https://clerk.com/docs/webhooks/overview
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { EMAIL_SUBJECTS } from "@/lib/email/config";

export async function POST(req: Request): Promise<Response> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Server configuration error", { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Handle events
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return new Response("No email address found", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    // Check if a user with this email already exists (migration from NextAuth)
    const existingUser = await prisma.user.findUnique({
      where: { email: primaryEmail },
    });

    let dbUser;
    if (existingUser) {
      // Link existing user to their Clerk account
      dbUser = await prisma.user.update({
        where: { email: primaryEmail },
        data: {
          clerkId: id,
          name: name || existingUser.name,
          image: image_url || existingUser.image,
        },
      });
    } else {
      // Create a new user record
      dbUser = await prisma.user.create({
        data: {
          clerkId: id,
          email: primaryEmail,
          name,
          image: image_url,
          role: "user",
        },
      });
    }

    // Sync role and dbUserId to Clerk publicMetadata for client-side access
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(id, {
      publicMetadata: {
        role: dbUser.role,
        dbUserId: dbUser.id,
      },
    });

    // Send welcome email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Remedi <noreply@remedi.com>",
          to: primaryEmail,
          subject: EMAIL_SUBJECTS.welcome,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10B981;">Welcome to Remedi! 🌿</h1>
              <p>Hi ${name || "there"},</p>
              <p>Thank you for joining Remedi! We're excited to help you discover natural alternatives to pharmaceutical drugs.</p>
              <p>Here's what you can do:</p>
              <ul>
                <li>Search for natural remedies by drug name</li>
                <li>Save your favorites for quick access</li>
                <li>Compare remedies side by side</li>
                <li>Read evidence-based information</li>
              </ul>
              <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://remedi-iota.vercel.app"}"
                   style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px;">
                  Start Exploring
                </a>
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 32px;">
                <em>Disclaimer: Remedi is for informational purposes only. Always consult a healthcare professional before making changes to your medication.</em>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // Don't fail the webhook if email sending fails
        console.error("Failed to send welcome email:", emailError);
      }
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || undefined;

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (dbUser) {
      const updated = await prisma.user.update({
        where: { clerkId: id },
        data: {
          name: name || undefined,
          image: image_url || undefined,
          email: primaryEmail || undefined,
        },
      });

      // Keep publicMetadata in sync
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(id, {
        publicMetadata: {
          role: updated.role,
          dbUserId: updated.id,
        },
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await prisma.user.deleteMany({
        where: { clerkId: id },
      });
    }
  }

  return new Response("OK", { status: 200 });
}
