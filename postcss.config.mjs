import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: [
    [
      "@tailwindcss/postcss",
      {
        // Pin scanning/resolution to this repo to avoid parent workspace cwd drift.
        base: configDir,
      },
    ],
  ],
};

export default config;
