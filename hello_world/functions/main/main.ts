import { Hono } from "@hono/hono";
import { serve } from "@byzanteam/breeze-js";
import { getBaseUrl } from "@byzanteam/breeze-js/url";

const app = new Hono().basePath(new URL(getBaseUrl()).pathname);

app.get("/", (c) => c.text("Hello world!"));
app.get("/greet/:name", (c) => {
  const name = c.req.param("name");
  return c.text(`Hi, ${name}`);
});
app.notFound((c) => {
  return c.text("Not found", 404);
});

serve(app.fetch);
