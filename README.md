# Portfolio

My personal site: projects, experience, a blog and a contact form, with a private dashboard where I edit all of it. Live at [bouloschaaya.vercel.app](https://bouloschaaya.vercel.app).

**Stack:** Next.js 16 (App Router, server actions) · TypeScript · Tailwind CSS · Drizzle ORM · PostgreSQL on Neon · Auth.js · Resend · Vercel. Tested with Playwright against a real PostgreSQL in CI.

## How it is built

- **Public pages** (home, about, projects, blog) are rendered once and refreshed when I change something in the dashboard (`revalidatePath`), so visitors get static pages and the database is only read when content changes.
- **The dashboard** (`/admin`) is for one account. There is no sign-up; the account is created in the database.
- **Access is checked next to the data, not only in the layout.** Next.js does not re-run a layout on client navigation, so `src/lib/dal.ts` identifies the admin and every admin read (`src/lib/admin-data.ts`), server action and export checks it itself. ESLint stops admin pages from importing the database directly. A test sends signed-out navigation requests to every admin page and checks no private data comes back.
- **Every save succeeds or says why.** Server actions validate their input (zod) and answer `{ ok }` or `{ ok: false, error }` instead of throwing; the form keeps its content and shows the reason (a slug already used, an ended session, a link that is not http(s)). Unexpected failures are logged with a short reference that the message shows.
- **Abuse limits:** 5 failed sign-ins per email (50 overall) per 15 minutes, counted in the database because serverless instances don't share memory; the contact form takes 3 messages an hour per sender; the contacts export can't carry spreadsheet formulas.
- **Sign out is a POST.** As a link, Next.js prefetched it and signed me out in the background, which is how this was found.

## Run it locally

Requires Node.js 22 and a PostgreSQL database.

```bash
npm ci
# .env.local
#   DATABASE_URL=postgres://user:pass@127.0.0.1:5432/portfolio
#   DATABASE_DRIVER=pg        # node-postgres for a plain PostgreSQL; omit for Neon
#   AUTH_SECRET=<random 32+ characters>
#   RESEND_API_KEY=<optional; messages are saved even without it>
npx drizzle-kit push        # creates the tables from src/lib/db/schema.ts
npm run dev
```

## Checks

```bash
npm run typecheck
npm run lint
DATABASE_URL=postgres://user:pass@127.0.0.1:5432/portfolio_test npm run test:e2e
```

`test:e2e` resets and seeds the test database (its name must end in `_test`), builds the site and runs the Playwright tests against it: admin access signed in and out, saving and refused saves, publishing, settings, sign-in and contact limits, the CSV export and security headers. CI runs all of them on every pull request.

## Database changes

The schema lives in `src/lib/db/schema.ts`. A change is applied to production once, with `npx drizzle-kit push` against the production `DATABASE_URL`, or with the equivalent SQL in the Neon console. Changes so far:

- `login_throttle` (sign-in limits):

  ```sql
  CREATE TABLE IF NOT EXISTS login_throttle (
    key text PRIMARY KEY,
    failures integer NOT NULL DEFAULT 0,
    window_start timestamptz NOT NULL DEFAULT now()
  );
  ```
