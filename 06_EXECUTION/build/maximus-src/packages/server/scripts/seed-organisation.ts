/**
 * seed-organisation (FRAGO 05 3.5). A manager runs this against the live
 * site to give one organisation its starting content from a manifest.
 *
 *   pnpm --filter @maximus/server seed-organisation -- \
 *     --url https://tessera-assure.netlify.app --org <organisation id> \
 *     --manifest <path to manifest.json> [--dry-run] [--replace] [--additions]
 *
 * --additions (v1.6) applies only the manifest's links and retention schedule
 * to an organisation that is already seeded. Its tasks, its documents and its
 * other settings are not touched, and no file is uploaded.
 *
 * It signs in as a manager (ASSURE_SEED_EMAIL and ASSURE_SEED_PASSWORD in the
 * shell running it; nothing is stored), then:
 *   1. checks the manifest locally and reports what it would create;
 *   2. writes the tasks and the journey stage in one call to the site, which
 *      refuses if the organisation already has tasks, unless --replace;
 *   3. uploads each document from the manifest's folder through the
 *      operator's Documents route. A file that is missing is logged and
 *      skipped; it can be filed later from the Documents page.
 * It reports counts before and after. --dry-run stops after step 2's check
 * and writes nothing. It never prints a password.
 *
 * It works through the product's own API, as a signed-in manager, rather
 * than writing to the store directly: the same rules and the same audit apply
 * as if the manager had done it by hand, and no store credential is needed.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { seedManifestSchema } from "../src/lib/seedManifest.ts";

const MAX_BYTES = 4 * 1024 * 1024;

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : null;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

function fail(message: string): never {
  console.error(`seed-organisation: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const url = (arg("url") ?? "").replace(/\/+$/, "");
  const org = arg("org");
  const manifestPath = arg("manifest");
  const dryRun = flag("dry-run");
  const replace = flag("replace");
  const additions = flag("additions");
  if (additions && replace) fail("--additions and --replace do not go together.");
  if (!url || !org || !manifestPath) fail("give --url, --org and --manifest.");

  const email = process.env.ASSURE_SEED_EMAIL;
  const password = process.env.ASSURE_SEED_PASSWORD;
  if (!email || !password) fail("set ASSURE_SEED_EMAIL and ASSURE_SEED_PASSWORD for a manager account.");

  const parsed = seedManifestSchema.safeParse(JSON.parse(readFileSync(manifestPath, "utf8")));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    fail(`the manifest does not read at ${issue?.path.join(".")}: ${issue?.message}`);
  }
  const manifest = parsed.data;
  const baseDir = path.dirname(path.resolve(manifestPath));
  console.log(
    `Manifest: ${manifest.tasks.length} task(s), ${manifest.documents.length} document(s), ${manifest.links.length} link(s), ` +
      `${manifest.organisation.settings.retentionSchedule?.length ?? 0} retention row(s), ` +
      `${manifest.jurisdictions?.length ?? 0} jurisdiction(s).`,
  );

  // Sign in. The cookie is held in memory for this run only.
  const login = await fetch(`${url}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok) fail("sign-in refused.");
  const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0];
  const me = (await login.json()) as { user: { role: string; mustChangePassword?: boolean } };
  if (me.user.role !== "mitmark_admin") fail("that account is not a manager.");
  if (me.user.mustChangePassword) fail("that account must change its password first; sign in to the site and do so.");

  const api = async (p: string, init: RequestInit = {}) => {
    const res = await fetch(`${url}/api${p}`, {
      ...init,
      headers: { cookie, "content-type": "application/json", "x-assure-org": org!, ...(init.headers ?? {}) },
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, body };
  };

  const seed = await api(`/admin/organisations/${encodeURIComponent(org!)}/seed?org=${encodeURIComponent(org!)}`, {
    method: "POST",
    body: JSON.stringify({ manifest, replace, dryRun, additionsOnly: additions }),
  });
  if (seed.status !== 200) fail(String(seed.body.error ?? `the site answered ${seed.status}.`));

  if (additions) {
    const r = seed.body as {
      before: { tasks: number; documents: number };
      after: { tasks: number; documents: number };
      wouldAdd: { links: number; linksAlreadyFiled: number; retentionRows: number };
    };
    console.log(`Tasks before: ${r.before.tasks}. Documents before: ${r.before.documents}.`);
    console.log(
      `${dryRun ? "Dry run. Would file" : "Filed"} ${r.wouldAdd.links} link(s) (${r.wouldAdd.linksAlreadyFiled} already filed) ` +
        `and ${dryRun ? "would set" : "set"} a retention schedule of ${r.wouldAdd.retentionRows} row(s).`,
    );
    console.log(`Tasks after: ${r.after.tasks}. Documents after: ${r.after.documents}.${dryRun ? " Nothing written." : ""}`);
    return;
  }
  const result = seed.body as {
    before: { tasks: number; documents: number };
    after: { tasks: number; documents: number };
    wouldCreate: { tasks: number; documents: number };
    wouldSet?: string[];
  };
  console.log(`Tasks before: ${result.before.tasks}. Documents before: ${result.before.documents}.`);
  if (result.wouldSet?.length) console.log(`${dryRun ? "Would set" : "Set"}: ${result.wouldSet.join(", ")}.`);

  const present = manifest.documents.filter((d) => existsSync(path.join(baseDir, d.file)));
  const missing = manifest.documents.filter((d) => !existsSync(path.join(baseDir, d.file)));
  for (const d of missing) console.log(`Missing, skipped: ${d.file}`);

  if (dryRun) {
    console.log(
      `Dry run. Would create ${result.wouldCreate.tasks} task(s) and file ${present.length} of ${manifest.documents.length} document(s). Nothing written.`,
    );
    return;
  }

  let filed = 0;
  for (const d of present) {
    const full = path.join(baseDir, d.file);
    const size = statSync(full).size;
    if (size > MAX_BYTES) {
      console.log(`Over 4 MB, skipped (file it as a link from the Documents page): ${d.file}`);
      continue;
    }
    const res = await api(`/admin/documents?org=${encodeURIComponent(org!)}`, {
      method: "POST",
      body: JSON.stringify({
        section: d.section,
        area: d.area,
        title: d.title,
        version: d.version ?? "",
        asAt: d.approvedAt ?? "",
        description: d.description,
        owner: "MITMARK",
        kind: "file",
        fileBase64: readFileSync(full).toString("base64"),
        fileName: path.basename(d.file),
        contentType: contentTypeOf(d.file),
        published: d.clientVisible,
        status: d.status,
      }),
    });
    if (res.status >= 300) {
      console.log(`Not filed (${res.status}): ${d.file}: ${String(res.body.error ?? "")}`);
      continue;
    }
    filed += 1;
  }

  const orgs = await api("/admin/organisations");
  const row = (orgs.body.organisations as { id: string; taskCount: number }[] | undefined)?.find((o) => o.id === org);
  console.log(`Tasks after: ${row?.taskCount ?? result.after.tasks}. Documents filed now: ${filed} of ${manifest.documents.length}.`);
}

function contentTypeOf(file: string): string {
  const ext = path.extname(file).toLowerCase();
  return (
    {
      ".pdf": "application/pdf",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".doc": "application/msword",
      ".xls": "application/vnd.ms-excel",
    }[ext] ?? "application/octet-stream"
  );
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
