/**
 * The store. A JSON document per organisation, held in Netlify Blobs when the
 * code runs on Netlify and in a local directory otherwise, so that tests, the
 * gate and local development run without a network or a credential.
 *
 * Netlify Blobs is on the existing Netlify plan. The build carries no database
 * credential and no paid service. See DECISIONS.md, DC-08.
 */

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { EMPTY_USERS_DOC, emptyOrgDoc, type OrgDoc, type UsersDoc } from './model.ts';

export const newId = (): string => randomUUID();

const STORE_NAME = 'assure';

interface Driver {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  getBytes(key: string): Promise<Uint8Array | null>;
  setBytes(key: string, value: Uint8Array): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

/** True when a Netlify Blobs context is available to this process. */
function onNetlify(): boolean {
  return Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT ||
      (process.env.NETLIFY && process.env.SITE_ID) ||
      process.env.NETLIFY_LOCAL_BLOBS,
  );
}

function blobsDriver(): Driver {
  // Imported lazily so the local driver needs no Netlify package at all.
  const load = async () => {
    const mod = await import('@netlify/blobs');
    return mod.getStore({ name: STORE_NAME, consistency: 'strong' });
  };
  return {
    async get(key) {
      const store = await load();
      return (await store.get(key, { type: 'text' })) ?? null;
    },
    async set(key, value) {
      const store = await load();
      await store.set(key, value);
    },
    async getBytes(key) {
      const store = await load();
      const buf = await store.get(key, { type: 'arrayBuffer' });
      return buf ? new Uint8Array(buf as ArrayBuffer) : null;
    },
    async setBytes(key, value) {
      const store = await load();
      // Netlify Blobs accepts an ArrayBuffer; hand it the underlying buffer.
      await store.set(key, value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer);
    },
    async list(prefix) {
      const store = await load();
      const { blobs } = await store.list({ prefix });
      return blobs.map((b: { key: string }) => b.key);
    },
  };
}

function fileDriver(): Driver {
  const root = process.env.ASSURE_DATA_DIR
    ? path.resolve(process.env.ASSURE_DATA_DIR)
    : path.resolve(process.cwd(), '.data');
  const file = (key: string) => path.join(root, key.replace(/[^a-zA-Z0-9._/-]/g, '_'));
  const ensure = async (p: string) => {
    await mkdir(path.dirname(p), { recursive: true });
  };
  return {
    async get(key) {
      try {
        return await readFile(file(key), 'utf8');
      } catch {
        return null;
      }
    },
    async set(key, value) {
      const p = file(key);
      await ensure(p);
      await writeFile(p, value, 'utf8');
    },
    async getBytes(key) {
      try {
        return new Uint8Array(await readFile(file(key)));
      } catch {
        return null;
      }
    },
    async setBytes(key, value) {
      const p = file(key);
      await ensure(p);
      await writeFile(p, value);
    },
    async list(prefix) {
      const dir = file(prefix);
      try {
        const names = await readdir(dir);
        return names.map((n) => `${prefix}${n}`);
      } catch {
        return [];
      }
    },
  };
}

let driver: Driver | null = null;
function getDriver(): Driver {
  if (!driver) driver = onNetlify() ? blobsDriver() : fileDriver();
  return driver;
}

/** Test seam. Resets the cached driver so a test can point at a new directory. */
export function resetDriver(): void {
  driver = null;
}

const orgKey = (orgId: string) => `orgs/${orgId}.json`;
const USERS_KEY = 'users.json';
export const exportKey = (exportId: string) => `exports/${exportId}.zip`;

// ---------------------------------------------------------------------------
// Organisations
// ---------------------------------------------------------------------------

export async function readOrg(orgId: string): Promise<OrgDoc | null> {
  const raw = await getDriver().get(orgKey(orgId));
  return raw ? (JSON.parse(raw) as OrgDoc) : null;
}

export async function writeOrg(doc: OrgDoc): Promise<void> {
  await getDriver().set(orgKey(doc.id), JSON.stringify(doc));
}

/** Read, apply, write. The data volume is one operator's work, so this is safe. */
export async function mutateOrg<T>(
  orgId: string,
  fn: (doc: OrgDoc) => T | Promise<T>,
): Promise<T> {
  const doc = await readOrg(orgId);
  if (!doc) throw new Error(`Organisation ${orgId} not found`);
  const result = await fn(doc);
  await writeOrg(doc);
  return result;
}

export async function listOrgIds(): Promise<string[]> {
  const keys = await getDriver().list('orgs/');
  return keys
    .map((k) => k.slice('orgs/'.length))
    .filter((k) => k.endsWith('.json'))
    .map((k) => k.slice(0, -'.json'.length));
}

export async function ensureOrg(orgId: string, name: string): Promise<OrgDoc> {
  const existing = await readOrg(orgId);
  if (existing) return existing;
  const doc = emptyOrgDoc(orgId, name);
  await writeOrg(doc);
  return doc;
}

// ---------------------------------------------------------------------------
// Users and sessions
// ---------------------------------------------------------------------------

export async function readUsers(): Promise<UsersDoc> {
  const raw = await getDriver().get(USERS_KEY);
  return raw ? (JSON.parse(raw) as UsersDoc) : { ...EMPTY_USERS_DOC, users: [], sessions: [] };
}

export async function writeUsers(doc: UsersDoc): Promise<void> {
  await getDriver().set(USERS_KEY, JSON.stringify(doc));
}

export async function mutateUsers<T>(fn: (doc: UsersDoc) => T | Promise<T>): Promise<T> {
  const doc = await readUsers();
  const result = await fn(doc);
  await writeUsers(doc);
  return result;
}

// ---------------------------------------------------------------------------
// Export binaries
// ---------------------------------------------------------------------------

export async function readExportBlob(exportId: string): Promise<Uint8Array | null> {
  return getDriver().getBytes(exportKey(exportId));
}

export async function writeExportBlob(exportId: string, bytes: Uint8Array): Promise<void> {
  await getDriver().setBytes(exportKey(exportId), bytes);
}
