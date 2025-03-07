import { Hono } from "@hono/hono";
import { serve, getEnvOrThrow } from "@byzanteam/breeze-js";

const app = new Hono().basePath(getEnvOrThrow("JET_BREEZE_PATH_PREFIX"));

const sendRequest = async (method: string, url: string, body?: unknown) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  };
  return await BreezeRuntime.pluginFetch("importer", url, options);
};

app.get("/", (ctx) => {
  return ctx.text("Hello World!");
});

app.post("/api/importers", async (ctx) => {
  const body = await ctx.req.json();
  return await sendRequest("POST", "/importers", body);
});

app.patch("/api/importers/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const body = await ctx.req.json();
  return await sendRequest("PATCH", `/importers/${id}`, body);
});

app.put("/api/importers/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const body = await ctx.req.json();
  return await sendRequest("PUT", `/importers/${id}`, body);
});

app.patch("/api/importers/:id/disable", async (ctx) => {
  const id = ctx.req.param("id");
  return await sendRequest("PATCH", `/importers/${id}/disable`);
});

app.post("/api/importers/:id/importations", async (ctx) => {
  const id = ctx.req.param("id");
  const body = await ctx.req.json();
  return await sendRequest("POST", `/importers/${id}/importations`, body);
});

app.get(
  "/api/importers/:importer_id/importations/:importation_id/failed_file",
  async (ctx) => {
    const importer_id = ctx.req.param("importer_id");
    const importation_id = ctx.req.param("importation_id");
    const filename = ctx.req.query("filename");
    const url = `/importers/${importer_id}/importations/${importation_id}/failed_file?filename=${filename}`;
    return await sendRequest("GET", url);
  }
);

serve(app.fetch);
