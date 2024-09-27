import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { serveHttp } from "https://cdn.jsdelivr.net/gh/Byzanteam/breeze-js@latest/lib/runtime.ts";

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
