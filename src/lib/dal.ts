import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Every admin read and write goes through this file. A check in the admin layout is not enough:
// Next.js renders a page's data even when its layout redirects (Partial Rendering), so a
// signed-out request for a client navigation received the page's data with the redirect.

/**
 * The signed-in admin, or null. The email is checked explicitly instead of "a session object
 * exists": Auth.js can return an object that carries an error and no user (GHSA-8fpg-xm3f-6cx3).
 */
export const currentAdmin = cache(async (): Promise<{ email: string } | null> => {
  const session = await auth();
  const email = session?.user?.email;
  return typeof email === "string" && email.length > 0 ? { email } : null;
});

/** For pages and the admin data they read: no admin, no data. */
export async function requireAdmin(): Promise<{ email: string }> {
  const admin = await currentAdmin();
  if (!admin) redirect("/login");
  return admin;
}

export class NotSignedIn extends Error {
  constructor() {
    super("Your session has ended. Sign in again.");
    this.name = "NotSignedIn";
  }
}

/** For server actions and route handlers, which answer instead of redirecting. */
export async function assertAdmin(): Promise<{ email: string }> {
  const admin = await currentAdmin();
  if (!admin) throw new NotSignedIn();
  return admin;
}
