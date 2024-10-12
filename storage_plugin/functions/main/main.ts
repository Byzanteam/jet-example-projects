import { Hono } from "hono";
import { html } from "hono/html";
import { wrapTransaction } from "./db.ts";

const app = new Hono();

const pluginInstance: BreezeRuntime.Plugin = BreezeRuntime.plugins["storage"];
const url = await pluginInstance.getEndpoint("/objects");

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
          <form action="https://nightly.jet.apps.jet.work/breeze/storage_plugin/development/main/create" method="post" enctype="multipart/form-data" class="flex flex-col items-center gap-2">
            <label for="uploader">
              <input id="uploader" name="file" type="file" class="hidden" />
              <div class="border rounded-md p-2 w-max">chose file</div>
            </label>

            <button type="submit" class="border rounded-md p-2 w-max">创建资源</button>
          </form>
          <ul class="flex flex-col gap-2 w-1/2">
            ${
    objects.map(
      (object) =>
        html`
                <li class="flex items-center justify-between py-4 px-5 border rounded-md">
                  <div class="flex flex-col gap-1">
                    <p>ID: ${object.id}</p>
                    <p>Key: ${object.key}</p>
                  </div>
                  <div class="flex gap-2 ml-auto">
                    <form action="https://nightly.jet.apps.jet.work/breeze/storage_plugin/development/main/show" method="get">
                      <input type="text" name="id" value="${object.id}" class="hidden" />
                      <button type="submit" class="cursor-pointer">show</button>
                    </form>
                    <form action="https://nightly.jet.apps.jet.work/breeze/storage_plugin/development/main/delete" method="get">
                      <input type="text" name="id" value="${object.id}" class="hidden" />
                      <button type="submit" class="cursor-pointer">delete</button>
                    </form>
                  </div>
                </li>
              `,
    )
  }
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.post("/create", async (ctx) => {
  const formData = await ctx.req.formData();
  const file = formData.get("file") as File;

  // 创建存储空间
  const createBaseRes = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucket: "jet-storage-plugin-example",
      key: file.name,
      max_content_length: 5242880,
      metadata: {},
      min_content_length: 1,
      post_expires_in_seconds: 3600,
    }),
  });

  if (createBaseRes.ok) {
    const createBaseData: {
      object_id: string;
      url: string;
      fields: object;
    } = await createBaseRes.json();

    const uploadFileForm = new FormData();

    Object.entries(createBaseData.fields).forEach(([key, value]) => {
      uploadFileForm.append(key, value);
    });
    uploadFileForm.set("file", file);

    const uploadRes = await fetch(createBaseData.url, {
      method: "post",
      body: uploadFileForm,
    });

    if (uploadRes.ok) {
      return ctx.redirect(
        "https://nightly.jet.apps.jet.work/breeze/storage_plugin/development/main",
      );
    }

    return ctx.text(await uploadRes.text());
  }

  return ctx.json(await createBaseRes.json());
});

app.get("/show", async (ctx) => {
  const { id } = ctx.req.query();

  const res = await fetch(`${url}/${id}`, {
    method: "get",
  });

  if (res.ok) {
    const result = await res.json();
    return ctx.redirect(result.download_url);
  } else {
    return ctx.text(await res.text());
  }
});

app.get("/delete", async (ctx) => {
  const { id } = ctx.req.query();

  const res = await fetch(`${url}/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    return ctx.redirect(
      "https://nightly.jet.apps.jet.work/breeze/storage_plugin/development/main",
    );
  } else {
    console.error("Error:", res);
    return ctx.text(await res.text());
  }
});

BreezeRuntime.serveHttp(app.fetch);
