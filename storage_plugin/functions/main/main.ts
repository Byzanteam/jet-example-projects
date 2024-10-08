import { Hono } from "https://deno.land/x/hono@v4.3.3/mod.ts";
import { html } from "https://deno.land/x/hono@v4.3.3/helper.ts";
import { wrapTransaction } from "./db.ts";

const app = new Hono();

const pluginInstance: BreezeRuntime.Plugin = BreezeRuntime.plugins["storage"];
const url = await pluginInstance.getEndpoint("/objects");

app.get("/", async (ctx) => {
  const objects: { id: string; key: string }[] = await wrapTransaction(
    async (trx) => {
      return await trx
        .withSchema("storage_plugin")
        .selectFrom("objects")
        .selectAll()
        .execute();
    },
  );

  return ctx.html(
    html`<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>show objects</title>
              <style>
                  body {
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                      margin: 0;
                      font-family: Arial, sans-serif;
                  }
      
                  .data-container {
                      list-style-type: none;
                      padding: 0;
                      width: 50%;
                  }
      
                  .data-item {
                      border: 1px solid #ddd;
                      padding: 10px;
                      margin: 10px 0;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                  }
      
                  .data-item h2, .data-item p {
                      margin: 0;
                  }
      
                  .data-item h2 {
                      font-size: 1.2em;
                  }
      
                  .data-item p {
                      color: #555;
                  }
              </style>
          </head>
          <body>
              <ul id="data-container" class="data-container">
                  ${
      objects.map((item) =>
        html`
                      <li class="data-item">
                          <h2>ID: ${item.id}</h2>
                          <p>Key: ${item.key}</p>
                      </li>
                  `
      )
    }
              </ul>
          </body>
          </html>`,
  );
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
      mimetype: "text/plain",
      key: "hello.txt",
      max_content_length: 5242880,
      metadata: {},
      method: "PUT",
      min_content_length: 1,
      post_expires_in_seconds: 3600,
    }),
  });

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

  const result = await res.json();

  if (res.ok) {
    console.log("StorageResponse:", result.data);
  } else {
    console.error("Error:", result.errors);
  }
  return ctx.json(result);
});

app.get("/delete", async (ctx) => {
  const id = ctx.req.param("id");
  const res = await fetch(`${url}/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    console.log("StorageResponse:", res);
    return ctx.text("deleted");
  } else {
    console.error("Error:", res);
    return ctx.text("error");
  }
});

BreezeRuntime.serveHttp(app.fetch);
