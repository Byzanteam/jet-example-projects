import { build, type Plugin, stop } from "esbuild";
import copy from "esbuild-copy-files-plugin";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import { join } from "@std/path/join";

const BUILTIN_NODE_MODULES = new Set([
  "assert",
  "assert/strict",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "dns/promises",
  "domain",
  "events",
  "fs",
  "fs/promises",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "path/posix",
  "path/win32",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "repl",
  "readline",
  "stream",
  "stream/consumers",
  "stream/promises",
  "stream/web",
  "string_decoder",
  "sys",
  "test",
  "timers",
  "timers/promises",
  "tls",
  "tty",
  "url",
  "util",
  "util/types",
  "v8",
  "vm",
  "worker_threads",
  "zlib",
]);

const nodeModuleAliasPlugin: Plugin = {
  name: "node-module-alias",
  setup(build) {
    build.onResolve(
      {
        filter: new RegExp(`^(${Array.from(BUILTIN_NODE_MODULES).join("|")})$`),
      },
      (args) => {
        const moduleName = args.path;
        if (BUILTIN_NODE_MODULES.has(moduleName)) {
          return { path: `node:${moduleName}`, external: true };
        }
        return;
      }
    );
  },
};

const nodePolyfillPlugin: Plugin = {
  name: "node-polyfill",
  setup(build) {
    build.initialOptions.inject = [
      join(import.meta.dirname!, "./node-polyfill.js"),
    ];
  },
};

export async function buildProject({
  entryPoints,
}: {
  entryPoints: Array<string>;
}) {
  await build({
    entryPoints,
    outdir: ".jcli/functions",
    outbase: "functions",
    plugins: [
      copy({
        source: ["migrations"],
        target: ".jcli",
        copyWithFolder: true,
      }),
      nodeModuleAliasPlugin,
      nodePolyfillPlugin,
      ...denoPlugins(),
    ],
    bundle: true,
    format: "esm",
    sourcemap: "external",
    minify: true,
    treeShaking: true,
  });

  stop();
}
