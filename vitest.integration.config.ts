import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./integration/setup/setup.ts"],
    include: ["integration/**/*.integration.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: "forks",
    // Run all integration test files sequentially (single fork) to avoid
    // shared database state conflicts between test files.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
