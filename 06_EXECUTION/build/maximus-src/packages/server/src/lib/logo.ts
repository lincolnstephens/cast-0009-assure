import type { BrandingLogo } from "../db/model.ts";

/**
 * v1.8 (FRAGO 08 3.2). The organisation's branding logo: PNG or SVG, 500 KB
 * at most. The type is read from the bytes, never taken from the name or the
 * declared type, so a renamed file of another kind is refused.
 */
export const LOGO_MAX_BYTES = 500 * 1024;

export const LOGO_OVERSIZE_MESSAGE = "A logo can be up to 500 KB; this one is larger.";
export const LOGO_TYPE_MESSAGE = "A logo must be a PNG or SVG image.";
export const LOGO_SVG_MESSAGE =
  "This SVG carries scripts, event handlers or outside references; save it as a plain SVG or a PNG.";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * An SVG is a document, not only a picture: opened directly it can run
 * script. One that carries script, handlers, embedded documents or outside
 * references is refused rather than cleaned.
 */
const SVG_UNSAFE = [
  /<script/i,
  /<foreignObject/i,
  /<(iframe|embed|object)\b/i,
  /\son[a-z]+\s*=/i,
  /javascript:/i,
  /<!ENTITY/i,
  /(?:xlink:)?href\s*=\s*["']\s*(?!#|data:image\/(?:png|jpeg|gif);base64,)/i,
  /url\(\s*["']?\s*(?!#)/i,
];

export type LogoCheck =
  | { ok: true; contentType: BrandingLogo["contentType"] }
  | { ok: false; status: 400 | 413; error: string };

export function checkLogo(bytes: Uint8Array): LogoCheck {
  if (bytes.byteLength === 0) return { ok: false, status: 400, error: LOGO_TYPE_MESSAGE };
  if (bytes.byteLength > LOGO_MAX_BYTES) return { ok: false, status: 413, error: LOGO_OVERSIZE_MESSAGE };
  if (PNG_SIGNATURE.every((b, i) => bytes[i] === b)) return { ok: true, contentType: "image/png" };

  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes).replace(/^﻿/, "").trimStart();
  const head = text.slice(0, 1024);
  const looksSvg = /^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head);
  if (!looksSvg) return { ok: false, status: 400, error: LOGO_TYPE_MESSAGE };
  if (SVG_UNSAFE.some((re) => re.test(text))) return { ok: false, status: 400, error: LOGO_SVG_MESSAGE };
  return { ok: true, contentType: "image/svg+xml" };
}

/**
 * The logo as an image response. Inline, never sniffed, and sandboxed with
 * no sources allowed, so an SVG opened on its own runs nothing.
 */
export function logoResponse(bytes: Uint8Array, contentType: string): Response {
  // Cast: see routes/exports.ts on Uint8Array and BodyInit.
  return new Response(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}

/** The API path the portal loads the logo from; the version defeats any cache after a replacement. */
export function logoPath(logo: BrandingLogo | undefined): string | undefined {
  return logo ? `/branding/logo?v=${logo.version}` : undefined;
}
