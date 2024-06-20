import { Hono } from "hono/mod.ts";
import { serveHttp } from "breeze-js/lib/runtime.ts";

const app = new Hono();

app.get("/", (c) => c.text("Hello world!"));
app.get("/greet/:name", (c) => {
  const name = c.req.param("name");
  return c.text(`Hi, ${name}`);
});
app.notFound((c) => {
  return c.text("Not found", 404);
});

serveHttp(app.fetch);
