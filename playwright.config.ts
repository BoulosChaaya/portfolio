import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run a production build against a local PostgreSQL test database.
//   DATABASE_URL=postgres://user:pass@127.0.0.1:5432/portfolio_test npm run test:e2e
// `test:e2e` resets and seeds that database first (e2e/setup-db.mjs); the build reads it for the
// statically rendered public pages.
const PORT = 3200;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/login`,
    timeout: 300_000,
    reuseExistingServer: false,
    env: {
      DATABASE_DRIVER: "pg",
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      AUTH_SECRET: "e2e-only-secret-not-used-anywhere-else-0123456789",
      AUTH_TRUST_HOST: "true",
      RESEND_API_KEY: "re_e2e_not_a_real_key",
    },
  },
});
