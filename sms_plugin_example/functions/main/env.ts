import { getEnvOrThrow } from "@byzanteam/breeze-js";

export function getDBUrl(): string {
  return getEnvOrThrow("JET_DATABASE_URL");
}
