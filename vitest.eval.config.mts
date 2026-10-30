import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

/** Real Groq calls, run by hand with `pnpm eval:agent`. Never part of CI. */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["evals/**/*.eval.ts"],
    silent: false,
    testTimeout: 180_000,
  },
});
