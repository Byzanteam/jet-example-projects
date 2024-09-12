import { Hono } from "https://deno.land/x/hono@v4.3.3/mod.ts";

const app = new Hono();

const pluginInstance: BreezeRuntime.Plugin = BreezeRuntime.plugins["storage"];
const url = await pluginInstance.getEndpoint("/api/objects");

app.get("/", (ctx) => {
  return ctx.text(`endpoint: ${url}`);
});

app.get("/create", async (ctx) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucket: "jet-storage-plugin-example",
      content_types: "text/plain",
      key: "hello.txt",
      max_content_length: 5242880,
      metadata: {},
      method: "PUT",
      min_content_length: 1,
      post_expires_in_seconds: 3600,
    }),
  });
  console.log(res);

  const result = await res.json();

  if (res.ok) {
    console.log("StorageResponse:", result.data);
  } else {
    console.error("Error:", result.errors);
  }
  return ctx.json(result);
});

app.get("/show", async (ctx) => {
  const id = ctx.req.param("id");
  const res = await fetch(`${url}/${id}`);

  console.log(res);

  const result = await res.json();

  if (res.ok) {
    console.log("StorageResponse:", result.data);
  } else {
    console.error("Error:", result.errors);
  }
  return ctx.json(result);
});

BreezeRuntime.serveHttp(app.fetch);
