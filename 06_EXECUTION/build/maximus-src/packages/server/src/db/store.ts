/**
 * The store. A JSON document per organisation, held in Netlify Blobs when the
 * code runs on Netlify and in a local directory otherwise, so that tests, the
 * gate and local development run without a network or a credential.
 *
 * Netlify Blobs is on the existing Netlify plan. The build carries no database
 * credential and no paid service. See DECISIONS.md, DC-08.
 */

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import {
  DEFAULT_SETTINGS,
  EMPTY_USERS_DOC,
  emptyOrgDoc,
  type OrgDoc,
  type SessionRecord,
  type UsersDoc,
} from './model.ts';

export const newId = (): string => randomUUID();

const STORE_NAME = 'assure';

interface Driver {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  getBytes(key: string): Promise<Uint8Array | null>;
  setBytes(key: string, value: Uint8Array): Promise<void>;
  del(key: string): Promise<void>;
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
    // Strong consistency, so the operator and the client portal never see
    // different answers. The API runs as a v2 function precisely so that the
    // uncached edge URL this needs is available; see netlify/functions/api.mts.
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
    async del(key) {
      const store = await load();
      await store.delete(key);
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
    async del(key) {
      try {
        await rm(file(key));
      } catch {
        // Already gone; deleting a missing session is not an error.
      }
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

/** Library tasks that changed module at v1.2, by their stable library id. */
const TASK_AREA_MOVES: Record<string, number> = {
  'a4-transfer-mapping': 2,
  'a4-transfer-safeguards': 7,
  'a3-policy-refresh': 4,
};

const orgKey = (orgId: string) => `orgs/${orgId}.json`;
const USERS_KEY = 'users.json';
export const exportKey = (exportId: string) => `exports/${exportId}.zip`;

// ---------------------------------------------------------------------------
// Organisations
// ---------------------------------------------------------------------------

/**
 * Bring a stored document up to the current shape.
 *
 * Organisations written by an earlier version have no tasks, no procedures and
 * none of the tracker settings. Reading one would then hand the rest of the
 * server undefined where it expects an array. This fills what is missing and
 * changes nothing that is already there, so an operator's edits always win.
 * It runs on every read and is cheap; the alternative, a migration step someone
 * has to remember to run, is the one that gets forgotten.
 */
export function migrateOrg(doc: OrgDoc): OrgDoc {
  doc.tasks ??= [];
  doc.procedures ??= [];
  doc.documents ??= [];
  doc.policies ??= [];
  doc.threads ??= [];
  doc.messages ??= [];
  doc.escalations ??= [];
  doc.intakes ??= [];
  doc.clocks ??= [];
  doc.clockEvents ??= [];
  doc.posture ??= [];
  doc.postureHistory ??= [];
  doc.alerts ??= [];
  doc.review ??= [];
  doc.audit ??= [];
  doc.exports ??= [];
  doc.entries ??= [];

  const s = doc.settings ?? ({} as OrgDoc['settings']);
  s.jurisdiction ??= DEFAULT_SETTINGS.jurisdiction;
  s.staffInScope = s.staffInScope === undefined ? null : s.staffInScope;
  s.staffTrained = s.staffTrained === undefined ? null : s.staffTrained;
  s.clientRoles ??= [...DEFAULT_SETTINGS.clientRoles];
  s.workplanTargetDate = s.workplanTargetDate === undefined ? null : s.workplanTargetDate;
  s.denominatorMode ??= 'overdue';
  s.documentsTargetDate = s.documentsTargetDate === undefined ? null : s.documentsTargetDate;
  s.lineStatus ??= { ...DEFAULT_SETTINGS.lineStatus };
  s.journeyPhase = s.journeyPhase === undefined ? null : s.journeyPhase;
  s.journeyNote ??= '';
  s.moduleIntroductions ??= {};
  s.retentionSchedule ??= {};
  doc.settings = s;
  doc.figures ??= [];

  // v1.2 re-scoped two modules. Tasks move with their library id so nothing is
  // lost and no task ends up in a module that no longer means what it did:
  // the transfers register moved into the tracker review, the safeguard for a
  // new transfer into vendor risk, and the policy refresh into policy review.
  for (const t of doc.tasks) {
    const moved = TASK_AREA_MOVES[t.source];
    if (moved !== undefined) t.area = moved;
  }

  // Two clock fields arrived with the tracker's KPI tiles. An older clock has
  // no answer to either question, and "not known" is null, never false.
  for (const c of doc.clocks) {
    if (c.insideStatute === undefined) c.insideStatute = null;
    if (c.icoNotified === undefined) c.icoNotified = null;
  }

  return doc;
}

export async function readOrg(orgId: string): Promise<OrgDoc | null> {
  const raw = await getDriver().get(orgKey(orgId));
  return raw ? migrateOrg(JSON.parse(raw) as OrgDoc) : null;
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

/**
 * Create an organisation only if it genuinely does not exist.
 *
 * The store is eventually consistent, so a single read that comes back empty is
 * not proof of absence. Writing a fresh empty document on that evidence would
 * wipe a live tenant's record. The read is therefore repeated after a pause,
 * and an organisation is only created when both reads agree it is missing.
 */
export async function ensureOrg(orgId: string, name: string): Promise<OrgDoc> {
  const first = await readOrg(orgId);
  if (first) return first;
  await new Promise((resolve) => setTimeout(resolve, 400));
  const second = await readOrg(orgId);
  if (second) return second;
  const doc = emptyOrgDoc(orgId, name);
  await writeOrg(doc);
  return doc;
}

const SEEDED_KEY = 'seeded.json';

/** Whether a seed has ever completed against this store. */
export async function seedMarker(): Promise<string | null> {
  return getDriver().get(SEEDED_KEY);
}

export async function setSeedMarker(): Promise<void> {
  await getDriver().set(SEEDED_KEY, JSON.stringify({ at: new Date().toISOString() }));
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

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
//
// A session is its own blob rather than a row inside the users document. The
// store is eventually consistent, so a read-modify-write of one shared document
// on every sign-in would lose writes when two of them overlap. A session blob is
// written once and read by key, which has no such race.

const sessionKey = (id: string) => `sessions/${id}.json`;

export async function readSession(id: string): Promise<SessionRecord | null> {
  const raw = await getDriver().get(sessionKey(id));
  return raw ? (JSON.parse(raw) as SessionRecord) : null;
}

export async function writeSession(session: SessionRecord): Promise<void> {
  await getDriver().set(sessionKey(session.id), JSON.stringify(session));
}

export async function deleteSession(id: string): Promise<void> {
  await getDriver().del(sessionKey(id));
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

// ---------------------------------------------------------------------------
// Compliance Documents binaries
// ---------------------------------------------------------------------------
//
// Added by the DOCUMENTS lane (V12_BRIEF.md) through the same driver as the
// export blobs above - same pattern, a new key prefix, nothing else touched.

export const documentKey = (orgId: string, documentId: string) => `documents/${orgId}/${documentId}`;

export async function readDocumentBlob(orgId: string, documentId: string): Promise<Uint8Array | null> {
  return getDriver().getBytes(documentKey(orgId, documentId));
}

export async function writeDocumentBlob(orgId: string, documentId: string, bytes: Uint8Array): Promise<void> {
  await getDriver().setBytes(documentKey(orgId, documentId), bytes);
}

export async function deleteDocumentBlob(orgId: string, documentId: string): Promise<void> {
  await getDriver().del(documentKey(orgId, documentId));
}
