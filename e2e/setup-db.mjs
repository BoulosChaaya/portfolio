// Prepares the end-to-end test database: an empty schema, the app's tables (drizzle-kit push from
// src/lib/db/schema.ts) and a small known data set. Refuses anything but a database whose name
// ends in "_test", so it can never be pointed at the real one.
import { execFileSync } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required (a local PostgreSQL test database).");
const name = new URL(url).pathname.slice(1);
if (!/_test$/.test(name)) throw new Error(`Refusing to reset "${name}": the test database name must end in _test.`);

const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
await client.end();

execFileSync("npx", ["drizzle-kit", "push", "--force"], { stdio: "inherit", env: process.env });

export const ADMIN = { email: "admin@e2e.test", password: "e2e-admin-password" };
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(ADMIN.password, salt, 64).toString("hex") + "." + salt;

const seed = new pg.Client({ connectionString: url });
await seed.connect();
await seed.query("INSERT INTO users (id, email, password_hash) VALUES ('admin', $1, $2)", [ADMIN.email, hash]);
// Never public: a visitor's message, an unpublished post and an unpublished project.
await seed.query("INSERT INTO contacts (name, email, subject, message) VALUES ('Private Visitor', 'visitor@private.test', 'Hello', 'PRIVATE-MESSAGE-123')");
await seed.query("INSERT INTO posts (slug, title, excerpt, content, category, published) VALUES ('secret-draft', 'Secret draft post', 'Not yet', 'Draft body', 'Notes', false)");
await seed.query("INSERT INTO projects (slug, title, excerpt, published, \"order\") VALUES ('unlisted', 'Unlisted project', 'Hidden', false, 2)");
await seed.query("INSERT INTO projects (slug, title, excerpt, published, \"order\") VALUES ('listed', 'Listed project', 'Shown', true, 1)");
await seed.end();
console.log(`Test database ${name} is ready.`);
