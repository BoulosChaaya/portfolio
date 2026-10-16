import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { clearFailedSignIns, recordFailedSignIn, signInBlocked } from "./login-throttle";

const scryptAsync = promisify(scrypt);

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hashed, "hex");
  // timingSafeEqual throws on different lengths, which a damaged stored hash would cause.
  return expected.length === buf.length && timingSafeEqual(buf, expected);
}

/** Shown on the sign-in page as "too many attempts" (the page reads the code). */
class TooManyAttempts extends CredentialsSignin {
  code = "too_many_attempts";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") return null;
        const email = credentials.email;
        if (await signInBlocked(email)) throw new TooManyAttempts();
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        const valid = user ? await verifyPassword(credentials.password, user.passwordHash) : false;
        if (!user || !valid) {
          await recordFailedSignIn(email);
          return null;
        }
        await clearFailedSignIns(email);
        return { id: user.id, email: user.email };
      },
    }),
  ],
});