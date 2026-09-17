// The bundle is produced by scripts/bundle-function.mjs before deploy, so
// this file has nothing left for the platform bundler to resolve.
import { app } from "./_api-bundle.mjs";

/**
 * The API, as a Netlify v2 function.
 *
 * It was a v1 (Lambda-compatible) handler in the prior build. A v1 handler is
 * not given the uncached edge URL that Netlify Blobs needs for strong
 * consistency, so reads were served from a per-instance cache: the operator
 * could change a setting, see it saved, and the client portal would go on
 * showing the old value indefinitely. With the demo switch that meant
 * illustrative entries could keep reaching the Information Officer after the
 * operator had switched them off, which the standard does not allow.
 *
 * A v2 function receives the full Blobs context, so the store reads strongly
 * and both sides of the product always agree. The bundler stays on esbuild,
 * which inlines the workspace packages; see netlify.toml.
 */
export default async function handler(request: Request): Promise<Response> {
  return app.fetch(request);
}

export const config = {
  path: "/api/*",
};
