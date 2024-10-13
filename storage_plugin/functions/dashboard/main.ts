import { Hono } from "hono";
import { html } from "hono/html";
import { wrapTransaction } from "./db.ts";
import { methodOverride } from "hono/method-override";
import { buildUrl, getBaseUrl } from "breeze-js/storagePluginApi";

const app = new Hono();
const pluginInstance: BreezeRuntime.Plugin = BreezeRuntime.plugins["storage"];
const storagePluginApi = await pluginInstance.getEndpoint("/objects");
const exampleBaseUrl = getBaseUrl();

// 测试存储空间
const testBucket = "jet-storage-plugin-example";

app.use("*", methodOverride({ app }));

app.get("/", async (ctx) => {
  const objects = await wrapTransaction(async (trx) => {
    return await trx.withSchema("storage_plugin_schema").selectFrom("objects")
      .selectAll().execute();
  });

  return ctx.html(html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="py-5">
        <div class="flex flex-col items-center gap-3 w-full">
          <form action="${
    buildUrl("/objects")
  }" method="post" enctype="multipart/form-data" class="flex flex-col items-center gap-2">
            <label for="uploader">
              <input id="uploader" name="file" type="file" class="hidden" />
              <div class="border rounded-md p-2 w-max">选择文件</div>
            </label>
            <button type="submit" class="border rounded-md p-2 w-max">上传</button>
          </form>
          <ul class="flex flex-col gap-2 w-1/2">
            ${
    objects.map((object) => {
      const objectUrl = buildUrl(`/objects/${object.id}`);
      return html`
                  <li class="flex items-center justify-between py-4 px-5 border rounded-md">
                    <div class="flex flex-col gap-1">
                      <p>ID: ${object.id}</p>
                      <p>Key: ${object.key}</p>
                    </div>
                    <div class="flex gap-2 ml-auto">
                      <form action="${objectUrl}" method="get">
                        <button type="submit" class="cursor-pointer">show</button>
                      </form>
                      <form action="${objectUrl}" method="post">
                        <input type="text" name="_method" value="DELETE" class="hidden" />
                        <button type="submit" class="cursor-pointer">delete</button>
                      </form>
                    </div>
                  </li>
                `;
    }).join("")
  }
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.post("/objects", async (ctx) => {
  const formData = await ctx.req.formData();
  const file = formData.get("file") as File;

  const createBaseRes = await fetch(storagePluginApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucket: testBucket,
      key: file.name,
      max_content_length: 5242880,
      metadata: {},
      min_content_length: 1,
      post_expires_in_seconds: 3600,
    }),
  });

  if (!createBaseRes.ok) {
    console.error("Error:", createBaseRes);
    return ctx.json(await createBaseRes.json());
  }

  const createBaseData = await createBaseRes.json();
  const uploadFileForm = new FormData();
  Object.entries(createBaseData.fields).forEach(([key, value]) => {
    uploadFileForm.append(key, value);
  });
  uploadFileForm.set("file", file);

  const uploadRes = await fetch(createBaseData.storagePluginApi, {
    method: "POST",
    body: uploadFileForm,
  });

  if (uploadRes.ok) {
    return ctx.redirect(exampleBaseUrl);
  }
  console.error("Error:", uploadRes);
  return ctx.text(await uploadRes.text());
});

app.get("/objects/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const res = await fetch(buildUrl(`/objects/${id}`), { method: "GET" });

  if (res.ok) {
    const result = await res.json();
    return ctx.redirect(result.download_url);
  } else {
    console.error("Error:", res);
    return ctx.text(await res.text());
  }
});

app.delete("/objects/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const res = await fetch(buildUrl(`/objects/${id}`), { method: "DELETE" });

  if (res.ok) {
    return ctx.redirect(exampleBaseUrl);
  } else {
    console.error("Error:", res);
    return ctx.text(await res.text());
  }
});

BreezeRuntime.serveHttp(app.fetch);
