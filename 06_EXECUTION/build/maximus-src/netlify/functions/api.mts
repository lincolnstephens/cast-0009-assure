import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { app } from "../../packages/server/src/app.ts";

const FN_PREFIX = "/.netlify/functions/api";

function normaliseApiUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  // Requests normally arrive via the /api/* redirect with the original URL
  // intact; normalise direct function-path invocations to /api/* as well.
  if (url.pathname.startsWith(FN_PREFIX)) {
    url.pathname = "/api" + url.pathname.slice(FN_PREFIX.length);
  }
  return url.toString();
}

function eventToRequest(event: HandlerEvent): Request {
  const headers = new Headers();
  for (const [key, value] of Object.entries(event.headers)) {
    if (value !== undefined) headers.append(key, value);
  }
  const method = event.httpMethod;
  const init: RequestInit = { method, headers };
  if (event.body != null && method !== "GET" && method !== "HEAD") {
    init.body = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
  }
  return new Request(normaliseApiUrl(event.rawUrl), init);
}

async function toHandlerResponse(res: Response): Promise<HandlerResponse> {
  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const body = Buffer.from(await res.arrayBuffer());
  return {
    statusCode: res.status,
    headers,
    body: body.length === 0 ? "" : body.toString("base64"),
    isBase64Encoded: body.length > 0,
  };
}

// Named `handler` export (Functions v1) so Netlify honours `node_bundler = "esbuild"`.
// A default Request/Response export is classified as v2 and forces the NFT bundler,
// which cannot resolve pnpm workspace dependencies in production.
export const handler: Handler = async (event) => {
  const res = await app.fetch(eventToRequest(event));
  return toHandlerResponse(res);
};
