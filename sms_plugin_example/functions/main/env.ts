export {
  getEnv,
  getEnvOrThrow,
  serveHttp,
} from "https://cdn.jsdelivr.net/gh/byzanteam/breeze-js@v0.2.1/lib/runtime.ts";

export function getDBUrl(): string {
  return getEnvOrThrow("JET_DATABASE_URL");
}
