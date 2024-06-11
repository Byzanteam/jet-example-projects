import { JetTower } from "https://cdn.jsdelivr.net/gh/Byzanteam/jet-tower-plugin-js@v0.1.0/mod.ts";
import { Hono } from "https://deno.land/x/hono@v4.0.10/mod.ts";
import { joinPath } from "https://cdn.jsdelivr.net/gh/Byzanteam/breeze-js@v0.2.2/lib/url.ts";
import {
  AuthorizationCodeAccessTokenRequestContext,
  AuthorizationCodeAuthorizationURL,
  sendTokenRequest,
} from "https://esm.sh/@oslojs/oauth2@0.1.2";

const tower = new JetTower({ instanceName: "tower" });

const authorizeUrl = await tower.authorizeUrl();
const tokenUrl = await tower.tokenUrl();
const { clientId, clientSecret } = await tower.getOauthClient();

console.log(`Authorize URL: ${authorizeUrl.toString()}`);
console.log(`Token URL: ${tokenUrl.toString()}`);
console.log(`Client ID: ${clientId}`);
console.log(`Client Secret: ${clientSecret}`);

const app = new Hono();

app.get("/", (ctx) => {
  console.log(`Request reached.`);
  return ctx.text("Hello Deno!");
});

app.get("/login", (ctx) => {
  const url = new AuthorizationCodeAuthorizationURL(
    authorizeUrl.toString(),
    clientId,
  );
  url.setRedirectURI(
    "https://nightly.jet.apps.jet.work/breeze/tower_example_v2/development/main/oauth2/callback",
  );

  console.log(`Redirecting to: ${url.toString()}`);

  return ctx.redirect(url.toString());
});

app.get("/oauth2/callback", async (ctx) => {
  const url = new URL(ctx.req.url);
  url.pathname = joinPath(
    "breeze",
    BreezeRuntime.env.get("JET_BREEZE_PATH_PREFIX")!,
    "/oauth2/callback",
  );

  console.log(`Getting token...`);

  const code = url.searchParams.get("code");

  const context = new AuthorizationCodeAccessTokenRequestContext(code!);
  context.setRedirectURI(
    "https://nightly.jet.apps.jet.work/breeze/tower_example_v2/development/main/oauth2/callback",
  );
  context.authenticateWithHTTPBasicAuth(clientId, clientSecret);

  const tokens = await sendTokenRequest(tokenUrl.toString(), context);

  console.log(`Get token: ${JSON.stringify(tokens)}`);

  console.log(`Getting user info...`);

  const { sub, name, phoneNumber, updatedAt, ...extraInfo } = await tower
    .getUserInfo(
      tokens.access_token,
    );

  const u = new Date(updatedAt * 1000);

  return ctx.text(`
  ID: ${sub}
  name: ${name}
  phone: ${phoneNumber}
  updated at: ${u.toLocaleString()}
  extra: ${JSON.stringify(extraInfo)}
  `);
});

BreezeRuntime.serveHttp(app.fetch);
