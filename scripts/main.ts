import { parseArgs } from "@std/cli";
import { buildProject } from "./build.ts";
import { join } from "@std/path/join";

async function main() {
  const args = parseArgs(Deno.args, {
    collect: ["entry-points"],
  });

  const entryPoints = args["entry-points"] as Array<string>;
  if (!entryPoints) {
    throw new Error("args entry-points is required");
  }

  const cwd = Deno.cwd();

  await buildProject({
    entryPoints: entryPoints.map((path) => join(cwd, path)),
  });
}

await main();
