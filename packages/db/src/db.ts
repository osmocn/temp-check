/// <reference types="node" />

import { getEnvVariable } from "@coco-kit/utils";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var pgClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var drizzleDb: Database | undefined;
}

function createDb() {
  const connectionString = getEnvVariable("DATABASE_URL");
  const connectionOptions = {
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 10 : 1,
  };

  if (!global.pgClient) {
    global.pgClient = postgres(connectionString, connectionOptions);
  }

  if (!global.drizzleDb) {
    global.drizzleDb = drizzle(global.pgClient, { schema });
  }

  return global.drizzleDb;
}

export function getDb() {
  return global.drizzleDb ?? createDb();
}

const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export default db;
export type DBExecutor = Database;
export type DBTransaction = Parameters<DBExecutor["transaction"]>[0] extends (
  tx: infer T,
) => unknown
  ? T
  : never;
