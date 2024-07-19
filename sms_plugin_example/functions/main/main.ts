import { Hono } from "https://deno.land/x/hono@v4.3.3/mod.ts";

const app = new Hono();

app.get("/", (ctx) => {
  return ctx.text("Hello World!");
});

app.get("/sms", async (ctx) => {
  const res = await sendSms();
  return ctx.text(res);
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

const pluginInstance: BreezeRuntime.Plugin = BreezeRuntime.plugins["sms"];
const url = await pluginInstance.getEndpoint("/api/graphql");

const sendSms = async () => {
  try {
    const response = await fetch(url, {
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

BreezeRuntime.serveHttp(app.fetch);
