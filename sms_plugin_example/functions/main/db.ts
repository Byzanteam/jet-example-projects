import { getEnvOrThrow } from "@byzanteam/breeze-js";
import { Kysely } from "kysely/index.js";
import {
  PostgresJSDialect,
  setup,
  wrapTransaction as wrapTransactionFn,
} from "kysely-deno-postgres-dialect/mod.ts";
import postgres from "postgresjs/mod.js";

export interface UserTable {
  name: string;
}
export interface LogTable {
  id: string;
  phone_number: string;
}
export interface Database {
  users: UserTable;
  logs: LogTable;
}

setup(() => {
  const dialect = new PostgresJSDialect({
    postgres: postgres(getEnvOrThrow("JET_DATABASE_URL"), {
      keep_alive: 600,
      max: 10,
    }),
  });

  return new Kysely<Database>({
    // Database is defined by Kysely orm
    dialect,
  });
});

export async function wrapTransaction<T>(
  callback: Parameters<typeof wrapTransactionFn<Database, T>>[0]
): Promise<T> {
  return await wrapTransactionFn<Database, T>(callback);
}
