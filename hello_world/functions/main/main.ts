import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

const app = new Hono();

app.get("/", (c) => c.text("Hello world!"));
app.get("/greet/:name", (c) => {
  const name = c.req.param("name");
  return c.text(`Hi, ${name}`);
});
app.notFound((c) => {
  return c.text("Not found", 404);
});

BreezeRuntime.serveHttp(app.fetch);
