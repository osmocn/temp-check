import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEnvVariable } from "@coco-kit/utils";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(packageRoot, ".env"), override: true });

const databaseUrl = getEnvVariable("DATABASE_URL");

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
