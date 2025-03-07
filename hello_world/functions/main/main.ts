import { Hono } from "@hono/hono";
import { getEnvOrThrow, serve } from "@byzanteam/breeze-js";

const app = new Hono().basePath(getEnvOrThrow("JET_BREEZE_PATH_PREFIX"));

app.get("/", (c) => c.text("Hello world!"));
app.get("/greet/:name", (c) => {
  const name = c.req.param("name");
  return c.text(`Hi, ${name}`);
});
app.notFound((c) => {
  return c.text("Not found", 404);
});

serve(app.fetch);
