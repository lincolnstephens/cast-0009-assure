/**
 * Install the six-policy pack into a deployed organisation, through the API.
 *
 * The deployed store was first written while the build was still being fixed,
 * and the seed marker now stops any re-seed from writing over the operator's
 * work. That is the right rule, so the pack is put in the way the operator
 * would put it in: create each policy, then approve it, as the signed-in
 * operator, with every approval landing in the audit log under their name.
 *
 * Usage:
 *   node scripts/install-policy-pack.mjs <base-url> <email> <password> [orgId]
 */

import { policyPack } from "../packages/server/scripts/policyPack.ts";
import { renderPolicyDocument } from "../packages/server/src/lib/policies.ts";

const [, , base, email, password, orgId = "demo"] = process.argv;
if (!base || !email || !password) {
  console.error("Usage: node scripts/install-policy-pack.mjs <base-url> <email> <password> [orgId]");
  process.exit(2);
}
const API = base.replace(/\/$/, "") + "/api";

let cookie = "";

async function call(method, path, body) {
  const init = { method, headers: {} };
  if (cookie) init.headers.cookie = cookie;
  if (body !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(API + path, init);
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, body: json };
}

const login = await call("POST", "/auth/login", { email, password });
if (login.status !== 200) {
  console.error("Could not sign in:", login.status, login.body);
  process.exit(1);
}

const existing = await call("GET", `/admin/policies?accountId=${orgId}`);
const have = new Set((existing.body?.policies ?? []).map((p) => p.code));
console.log(`${have.size} policies already present.`);

let created = 0;
for (const entry of policyPack) {
  const current = (existing.body?.policies ?? []).find((p) => p.code === entry.code);
  if (current) {
    const full = await call("GET", `/admin/policies/${current.id}`);
    const sectionCount = (full.body?.sections ?? full.body?.policy?.sections ?? []).length;
    if (sectionCount > 0) {
      console.log(`  ${entry.code} already present with ${sectionCount} sections, left alone.`);
      continue;
    }
    const draft = await call("POST", `/admin/policies/${current.id}/draft`, {});
    const draftId = draft.body?.id ?? draft.body?.policy?.id ?? current.id;
    await call("PUT", `/admin/policies/${draftId}`, {
      bodyMarkdown: renderPolicyDocument(entry.bodyMarkdown, entry.sections),
    });
    const ok = await call("POST", `/admin/policies/${draftId}/approve`, {});
    console.log(`  ${entry.code} had no sections; reissued as a new approved version (${ok.status}).`);
    created += 1;
    continue;
  }
  const made = await call("POST", "/admin/policies", {
    clientAccountId: orgId,
    code: entry.code,
    title: entry.title,
    // The pack keeps its sections structured; the store holds one markdown
    // body per version and parses the sections back out of it, so the whole
    // document has to be composed here. Sending only the preamble would leave
    // the Policy Guide with an empty corpus and nothing to answer from.
    bodyMarkdown: renderPolicyDocument(entry.bodyMarkdown, entry.sections),
  });
  if (made.status !== 201 && made.status !== 200) {
    console.error(`  ${entry.code} could not be created:`, made.status, made.body);
    continue;
  }
  const id = made.body?.id ?? made.body?.policy?.id;
  const approved = await call("POST", `/admin/policies/${id}/approve`, {});
  console.log(
    `  ${entry.code} created${approved.status === 200 ? " and approved" : ` but approval returned ${approved.status}`}.`,
  );
  created += 1;
}

const after = await call("GET", `/admin/policies?accountId=${orgId}`);
console.log(`Done. ${created} created. ${(after.body?.policies ?? []).length} policies now on the organisation.`);
