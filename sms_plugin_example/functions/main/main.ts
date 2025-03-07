import { Hono } from "@hono/hono";
import { wrapTransaction } from "./db.ts";
import { serve } from "@byzanteam/breeze-js";
import { getBaseUrl } from "@byzanteam/breeze-js/url";

const app = new Hono().basePath(new URL(getBaseUrl()).pathname);

app.get("/", (ctx) => {
  return ctx.text("Hello World!");
});

app.get("/sms", async (ctx) => {
  const res = await sendSms();
  return ctx.text(res);
});

app.get("/logs", async (ctx) => {
  const logs = await wrapTransaction(async (trx) => {
    return await trx
      .withSchema("sms_example")
      .selectFrom("logs")
      .selectAll()
      .execute();
  });

  return ctx.json(logs);
});

const query = `
  mutation sendSms($phoneNumber: String!, $queue: String!, $templateCode: String!, $templateParams: [TemplateParam]) {
    sendSms(
      phoneNumber: $phoneNumber
      queue: $queue
      templateCode: $templateCode
      templateParams: $templateParams
    ) {
      message
    }
  }
`;

const variables = {
  phoneNumber: "18284004091",
  queue: "default",
  templateCode: "code",
  templateParams: [
    { name: "name1", value: "value1" },
    { name: "name2", value: "value2" },
  ],
};

const sendSms = async () => {
  try {
    const response = await BreezeRuntime.pluginFetch("sms", "/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("SendSmsResponse:", result.data.sendSms);
      return `SendSmsResponse: ${result.data.sendSms.message}`;
    } else {
      console.error("Error:", result.errors);
      return `Error: ${result.errors}`;
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    return `Fetch Error: ${error}`;
  }
};

serve(app.fetch);
