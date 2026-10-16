"use server";

import { signOut } from "@/lib/auth";

/**
 * Sign-out is a POST from a button, never a link: Next.js prefetches links in the background, and
 * prefetching the old /api/auth/signout link ended the session on its own, so the next save in
 * the dashboard was refused. A GET that signs out also let any other site sign the admin out.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
