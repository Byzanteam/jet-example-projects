import { Hono } from "hono/mod.ts";
import { serveHttp } from "breeze-js/lib/runtime.ts";

// {
//   "#/": "./",
//   "#functions/": "../"
// };
// cwd: ?
// entryfile: ?

import log from "#functions/api/log.ts";

const app = new Hono();

app.get("/", (c) => c.text("Hello world!"));
app.get("/greet/:name", (c) => {
  log("greet", c.req.param("name"));
  const name = c.req.param("name");
  return c.text(`Hi, ${name}`);
});
app.notFound((c) => {
  return c.text("Not found", 404);
});

serveHttp(app.fetch);
