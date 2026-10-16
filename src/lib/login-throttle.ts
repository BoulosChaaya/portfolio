import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// Limits password guessing. Per email: 5 failures in 15 minutes, then that email is refused until
// the window passes. Overall: 50 failures in 15 minutes, so trying many emails does not help.
// Counting happens in single SQL statements, so concurrent attempts cannot undercount.
const PER_EMAIL = 5;
const OVERALL = 50;
const GLOBAL = "global";
const key = (email: string) => `email:${email.trim().toLowerCase()}`;

/** A missing table must not lock the owner out: allow, and say why in the log. */
function missingTable(error: unknown): boolean {
  for (let current = error, depth = 0; current && depth < 5; current = (current as { cause?: unknown }).cause, depth++) {
    if ((current as { code?: unknown }).code === "42P01") {
      console.error("login_throttle table is missing: sign-in attempts are not being limited. Create it (see README).");
      return true;
    }
  }
  return false;
}

export async function signInBlocked(email: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT 1 FROM login_throttle
      WHERE window_start > now() - interval '15 minutes'
        AND ((key = ${key(email)} AND failures >= ${PER_EMAIL}) OR (key = ${GLOBAL} AND failures >= ${OVERALL}))
      LIMIT 1`);
    return result.rows.length > 0;
  } catch (error) {
    if (missingTable(error)) return false;
    throw error;
  }
}

export async function recordFailedSignIn(email: string): Promise<void> {
  try {
    for (const k of [key(email), GLOBAL]) {
      await db.execute(sql`
        INSERT INTO login_throttle (key, failures, window_start) VALUES (${k}, 1, now())
        ON CONFLICT (key) DO UPDATE SET
          failures = CASE WHEN login_throttle.window_start <= now() - interval '15 minutes' THEN 1 ELSE login_throttle.failures + 1 END,
          window_start = CASE WHEN login_throttle.window_start <= now() - interval '15 minutes' THEN now() ELSE login_throttle.window_start END`);
    }
  } catch (error) {
    if (!missingTable(error)) throw error;
  }
}

export async function clearFailedSignIns(email: string): Promise<void> {
  try {
    await db.execute(sql`DELETE FROM login_throttle WHERE key = ${key(email)}`);
  } catch (error) {
    if (!missingTable(error)) throw error;
  }
}
