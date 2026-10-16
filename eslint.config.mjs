import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Admin pages read data only through src/lib/admin-data.ts, which checks the admin first.
    files: ["src/app/admin/**", "src/components/dashboard/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{ name: "@/lib/db", message: "Read admin data through @/lib/admin-data, which checks the admin first." }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
