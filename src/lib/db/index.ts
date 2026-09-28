import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type GlobalWithDb = typeof globalThis & {
  __bloomDb?: ReturnType<typeof createDb>;
};

function createDb() {
  const client = postgres(process.env.DATABASE_URL ?? "postgresql://invalid");
  return drizzle(client, { schema });
}

function getDb() {
  const g = globalThis as GlobalWithDb;
  if (!g.__bloomDb) g.__bloomDb = createDb();
  return g.__bloomDb;
}

export const db = getDb();
