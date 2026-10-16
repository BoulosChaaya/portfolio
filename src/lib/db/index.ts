import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Production and previews reach Neon over its HTTP driver. A plain PostgreSQL server (the
// end-to-end tests, local development) needs node-postgres: set DATABASE_DRIVER=pg. Both expose
// the same Drizzle API; the app uses no transactions, which the HTTP driver does not support.
const url = process.env.DATABASE_URL!;

export const db: NeonHttpDatabase<typeof schema> =
  process.env.DATABASE_DRIVER === "pg"
    ? (drizzlePg(url, { schema }) as unknown as NeonHttpDatabase<typeof schema>)
    : drizzleNeon(neon(url), { schema });
