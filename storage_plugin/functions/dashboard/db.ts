import { getEnvOrThrow } from "@byzanteam/breeze-js";

import { Kysely } from "kysely";
import {
  PostgresJSDialect,
  setup,
  wrapTransaction as wrapTransactionFn,
} from "kysely-deno-postgres-dialect";
import postgres from "postgresjs";

export interface UserTable {
  name: string;
}
export interface LogTable {
  id: string;
  phone_number: string;
}
export interface ObjectTable {
  id: string;
  key: string;
}
export interface Database {
  users: UserTable;
  logs: LogTable;
  objects: ObjectTable;
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
