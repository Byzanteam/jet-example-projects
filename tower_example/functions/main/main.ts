import { JetTower } from "jet-tower-plugin-js";
import { Hono } from "hono";
import { buildUrl, joinPath } from "@byzanteam/breeze-js/url";
import { serve, getEnvOrThrow } from "@byzanteam/breeze-js";
import {
  AuthorizationCodeAccessTokenRequestContext,
  AuthorizationCodeAuthorizationURL,
  sendTokenRequest,
} from "@oslojs/oauth2";
import { wrapTransaction } from "./db.ts";

const tower = new JetTower({ instanceName: "tower" });

const authorizeUrl = await tower.authorizeUrl();
const tokenUrl = await tower.tokenUrl();
const { clientId, clientSecret } = await tower.getOauthClient();

console.log(`Authorize URL: ${authorizeUrl.toString()}`);
console.log(`Token URL: ${tokenUrl.toString()}`);
console.log(`Client ID: ${clientId}`);
console.log(`Client Secret: ${clientSecret}`);

const app = new Hono().basePath(getEnvOrThrow("JET_BREEZE_PATH_PREFIX"));

app.get("/", (ctx) => {
  console.log(`Request reached.`);
  return ctx.text("Hello Deno!");
});

app.get("/login", (ctx) => {
  const url = new AuthorizationCodeAuthorizationURL(
    authorizeUrl.toString(),
    clientId
  );
  url.setRedirectURI(buildUrl("/oauth2/callback"));

  console.log(`Redirecting to: ${url.toString()}`);

  return ctx.redirect(url.toString());
});

app.get("/oauth2/callback", async (ctx) => {
  const url = new URL(ctx.req.url);
  url.pathname = joinPath(
    "breeze",
    getEnvOrThrow("JET_BREEZE_PATH_PREFIX")!,
    "/oauth2/callback"
  );

  console.log(`Getting token...`);

  const code = url.searchParams.get("code");

  const context = new AuthorizationCodeAccessTokenRequestContext(code!);
  context.setRedirectURI(buildUrl("/oauth2/callback"));
  context.authenticateWithHTTPBasicAuth(clientId, clientSecret);

  const tokens = await sendTokenRequest(tokenUrl.toString(), context);

  console.log(`Get token: ${JSON.stringify(tokens)}`);

  console.log(`Getting user info...`);

  const { sub, name, phoneNumber, updatedAt, ...extraInfo } =
    await tower.getUserInfo(tokens.access_token);

  const u = new Date(updatedAt * 1000);

  return ctx.text(`
  ID: ${sub}
  name: ${name}
  phone: ${phoneNumber}
  updated at: ${u.toLocaleString()}
  extra: ${JSON.stringify(extraInfo)}
  `);
});

app.get("/users", async (ctx) => {
  const users = await wrapTransaction(async (trx) => {
    return await trx
      .withSchema("tower_example")
      .selectFrom("universal_directory_users")
      .selectAll()
      .execute();
  });

  return ctx.json(users);
});

app.get("/groups", async (ctx) => {
  const groups = await wrapTransaction(async (trx) => {
    return await trx
      .withSchema("tower_example")
      .selectFrom("universal_directory_groups")
      .selectAll()
      .execute();
  });

  return ctx.json(groups);
});

app.get("/users_groups", async (ctx) => {
  const usersGroups = await wrapTransaction(async (trx) => {
    return await trx
      .withSchema("tower_example")
      .selectFrom("universal_directory_users_groups")
      .selectAll()
      .execute();
  });

  return ctx.json(usersGroups);
});

app.get("/users_im_users", async (ctx) => {
  const usersImUsers = await wrapTransaction(async (trx) => {
    return await trx
      .withSchema("tower_example")
      .selectFrom("universal_directory_users_im_users")
      .selectAll()
      .execute();
  });

  return ctx.json(usersImUsers);
});

serve(app.fetch);
