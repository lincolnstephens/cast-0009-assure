import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Markdown } from "../../components/Markdown";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface PolicyRow {
  id: string;
  code: string;
  title: string;
  version: number;
  status: "draft" | "approved";
  approvedAt: string | null;
}

interface PolicyDetail extends PolicyRow {
  bodyMarkdown: string;
  sections: { id: string; sectionRef: string; heading: string; bodyMarkdown: string }[];
}

export function AdminPoliciesPage() {
  const { selectedAccountId } = useAdmin();
  const [rows, setRows] = useState<PolicyRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PolicyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ policies: PolicyRow[] }>(
        `/admin/policies?accountId=${selectedAccountId}`,
      );
      setRows(res.policies);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load policies.");
    }
  }, [selectedAccountId]);

  const openDetail = useCallback(async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetailError(null);
    try {
      setDetail(await api<PolicyDetail>(`/admin/policies/${id}`));
    } catch (err) {
      setDetail(null);
      setDetailError(err instanceof ApiError ? err.message : "Unable to load that policy.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    setRows(null);
    setDetail(null);
    setSelectedId(null);
    void load();
  }, [load]);

  async function refresh(idToShow?: string) {
    await load();
    if (idToShow ?? selectedId) await openDetail(idToShow ?? selectedId!);
  }

  return (
    <div className="flex max-w-6xl gap-6">
      <div className="w-72 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Policy pack</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded bg-hud-accent px-2.5 py-1 text-[12px] font-medium text-white hover:bg-hud-accent/90"
          >
            New policy
          </button>
        </div>
        <div className="mt-1.5 h-px w-12 bg-hud-gold/60" />

        {error && (
          <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
            {error}
          </p>
        )}
        {!rows && !error && <p className="mt-3 text-[13px] text-hud-muted">Loading…</p>}
        {rows && rows.length === 0 && (
          <p className="mt-3 text-[13px] text-hud-muted">
            No policies yet. Create the first one.
          </p>
        )}

        <ul className="mt-3 space-y-1.5">
          {rows?.map((row) => (
            <li key={row.id}>
              <button
                onClick={() => void openDetail(row.id)}
                className={`w-full rounded border px-3 py-2 text-left text-[13px] ${
                  selectedId === row.id
                    ? "border-hud-accent bg-hud-panel"
                    : "border-hud-line bg-hud-panel/50 hover:border-hud-accent/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{row.code}</span>
                  <span
                    className={`text-[11px] uppercase tracking-wider ${
                      row.status === "approved" ? "text-status-green" : "text-status-amber"
                    }`}
                  >
                    {row.status} v{row.version}
                  </span>
                </div>
                <div className="mt-0.5 text-hud-muted">{row.title}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0 flex-1">
        {detailError && (
          <p className="mt-4 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
            {detailError}
          </p>
        )}
        {detailLoading && <p className="mt-10 text-center text-sm text-hud-muted">Loading policy…</p>}
        {!detailLoading && !detail && !detailError && (
          <p className="mt-10 text-center text-sm text-hud-muted">
            Select a policy version to view and manage it.
          </p>
        )}
        {detail && !detailLoading && (
          <PolicyDetailView detail={detail} onChanged={refresh} />
        )}
      </div>

      {showCreate && selectedAccountId && (
        <CreatePolicyModal
          accountId={selectedAccountId}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false);
            void refresh(id);
          }}
        />
      )}
    </div>
  );
}

function PolicyDetailView({
  detail,
  onChanged,
}: {
  detail: PolicyDetail;
  onChanged: (idToShow?: string) => Promise<void>;
}) {
  const isDraft = detail.status === "draft";
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | "new" | null>(null);

  async function act(fn: () => Promise<unknown>) {
    try {
      setError(null);
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    }
  }

  return (
    <div className="rounded border border-hud-line bg-hud-panel/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {detail.code} - {detail.title}
          </h2>
          <p className="mt-0.5 text-[13px] text-hud-muted">
            Version {detail.version} ·{" "}
            <span className={detail.status === "approved" ? "text-status-green" : "text-status-amber"}>
              {detail.status}
            </span>
            {detail.approvedAt ? ` · approved ${formatLondon(detail.approvedAt)}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {isDraft ? (
            <>
              <button
                onClick={() =>
                  void act(async () => {
                    await api(`/admin/policies/${detail.id}/approve`, {
                      method: "POST",
                      body: JSON.stringify({}),
                    });
                    await onChanged();
                  })
                }
                className="rounded bg-status-green px-3 py-1.5 text-[13px] font-medium text-white hover:bg-status-green/80"
              >
                Approve
              </button>
              <button
                onClick={() =>
                  void act(async () => {
                    if (!window.confirm("Delete this draft version?")) return;
                    await api(`/admin/policies/${detail.id}`, { method: "DELETE" });
                    await onChanged();
                  })
                }
                className="rounded border border-status-red/70 px-3 py-1.5 text-[13px] text-status-red hover:bg-status-red hover:text-white"
              >
                Delete draft
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                void act(async () => {
                  const res = await api<{ id: string }>(
                    `/admin/policies/${detail.id}/draft`,
                    { method: "POST", body: JSON.stringify({}) },
                  );
                  await onChanged(res.id);
                })
              }
              className="rounded border border-hud-gold px-3 py-1.5 text-[13px] text-hud-gold hover:bg-hud-gold hover:text-hud-bg"
            >
              New draft version
            </button>
          )}
        </div>
      </div>

      {!isDraft && (
        <p className="mt-3 border-l-2 border-hud-gold/60 pl-3 text-[12px] text-hud-muted">
          Approved versions are immutable. Create a new draft version to make changes;
          clients keep seeing this version until the draft is approved.
        </p>
      )}
      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}

      {isDraft && <TitleEditor detail={detail} onChanged={onChanged} />}

      {detail.bodyMarkdown && (
        <div className="mt-4 text-[13px] text-hud-muted">
          <Markdown>{detail.bodyMarkdown}</Markdown>
        </div>
      )}

      <h3 className="mt-5 border-t border-hud-gold/40 pt-4 text-[12px] font-medium uppercase tracking-wider text-hud-muted">
        Sections
      </h3>
      <div className="mt-3 space-y-3">
        {detail.sections.map((section) =>
          editingSection === section.id ? (
            <SectionForm
              key={section.id}
              initial={section}
              onCancel={() => setEditingSection(null)}
              onSave={async (values) => {
                await api(`/admin/sections/${section.id}`, {
                  method: "PUT",
                  body: JSON.stringify(values),
                });
                setEditingSection(null);
                await onChanged();
              }}
            />
          ) : (
            <section key={section.id} className="rounded border border-hud-line bg-hud-bg/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-[13px] font-semibold">
                  <span className="text-hud-accent">{section.sectionRef}</span>{" "}
                  {section.heading}
                </h4>
                {isDraft && (
                  <span className="flex shrink-0 gap-2 text-[12px]">
                    <button
                      onClick={() => setEditingSection(section.id)}
                      className="text-hud-accent hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        void act(async () => {
                          if (!window.confirm("Remove this section?")) return;
                          await api(`/admin/sections/${section.id}`, { method: "DELETE" });
                          await onChanged();
                        })
                      }
                      className="text-status-red hover:underline"
                    >
                      Remove
                    </button>
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-[13px]">
                <Markdown>{section.bodyMarkdown}</Markdown>
              </div>
            </section>
          ),
        )}
        {detail.sections.length === 0 && (
          <p className="text-[13px] text-hud-muted">No sections yet.</p>
        )}
      </div>

      {isDraft &&
        (editingSection === "new" ? (
          <div className="mt-3">
            <SectionForm
              onCancel={() => setEditingSection(null)}
              onSave={async (values) => {
                await api(`/admin/policies/${detail.id}/sections`, {
                  method: "POST",
                  body: JSON.stringify(values),
                });
                setEditingSection(null);
                await onChanged();
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setEditingSection("new")}
            className="mt-3 rounded border border-hud-accent px-3 py-1.5 text-[13px] text-hud-accent hover:bg-hud-accent hover:text-white"
          >
            Add section
          </button>
        ))}
    </div>
  );
}

function TitleEditor({
  detail,
  onChanged,
}: {
  detail: PolicyDetail;
  onChanged: () => Promise<void>;
}) {
  const [title, setTitle] = useState(detail.title);
  const [bodyMarkdown, setBodyMarkdown] = useState(detail.bodyMarkdown);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTitle(detail.title);
    setBodyMarkdown(detail.bodyMarkdown);
  }, [detail.id, detail.title, detail.bodyMarkdown]);

  async function save(e: FormEvent) {
    e.preventDefault();
    await api(`/admin/policies/${detail.id}`, {
      method: "PUT",
      body: JSON.stringify({ title, bodyMarkdown }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await onChanged();
  }

  return (
    <form onSubmit={save} className="mt-4 rounded border border-hud-line bg-hud-bg/40 p-3">
      <label className="block text-[12px] uppercase tracking-wider text-hud-muted">
        Title
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
      />
      <label className="mt-3 block text-[12px] uppercase tracking-wider text-hud-muted">
        Preamble (markdown)
      </label>
      <textarea
        value={bodyMarkdown}
        onChange={(e) => setBodyMarkdown(e.target.value)}
        rows={2}
        className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        {saved && <span className="text-[12px] text-status-green">Saved</span>}
        <button
          type="submit"
          className="rounded border border-hud-accent px-3 py-1 text-[13px] text-hud-accent hover:bg-hud-accent hover:text-white"
        >
          Save details
        </button>
      </div>
    </form>
  );
}

function SectionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { sectionRef: string; heading: string; bodyMarkdown: string };
  onSave: (values: { sectionRef: string; heading: string; bodyMarkdown: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [sectionRef, setSectionRef] = useState(initial?.sectionRef ?? "");
  const [heading, setHeading] = useState(initial?.heading ?? "");
  const [bodyMarkdown, setBodyMarkdown] = useState(initial?.bodyMarkdown ?? "");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await onSave({ sectionRef, heading, bodyMarkdown });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the section.");
    }
  }

  return (
    <form onSubmit={submit} className="rounded border border-hud-accent/60 bg-hud-bg/40 p-3">
      <div className="flex gap-2">
        <div className="w-24">
          <label className="block text-[12px] uppercase tracking-wider text-hud-muted">Ref</label>
          <input
            value={sectionRef}
            onChange={(e) => setSectionRef(e.target.value)}
            required
            placeholder="4.2"
            className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[12px] uppercase tracking-wider text-hud-muted">Heading</label>
          <input
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
            className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
          />
        </div>
      </div>
      <label className="mt-2 block text-[12px] uppercase tracking-wider text-hud-muted">
        Body (markdown)
      </label>
      <textarea
        value={bodyMarkdown}
        onChange={(e) => setBodyMarkdown(e.target.value)}
        required
        rows={5}
        className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none focus:border-hud-accent"
      />
      {error && (
        <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-2 py-1 text-[13px] text-hud-muted hover:text-hud-text">
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
        >
          Save section
        </button>
      </div>
    </form>
  );
}

function CreatePolicyModal({
  accountId,
  onClose,
  onCreated,
}: {
  accountId: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ id: string }>("/admin/policies", {
        method: "POST",
        body: JSON.stringify({ clientAccountId: accountId, code, title }),
      });
      onCreated(res.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create the policy.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded border border-hud-line bg-hud-panel p-6"
      >
        <h2 className="text-base font-semibold">New policy (version 1, draft)</h2>

        <label className="mt-4 block text-[13px] text-hud-muted" htmlFor="policy-code">
          Code
        </label>
        <input
          id="policy-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          placeholder="DP-01"
          className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-[13px] outline-none focus:border-hud-accent"
        />

        <label className="mt-4 block text-[13px] text-hud-muted" htmlFor="policy-title">
          Title
        </label>
        <input
          id="policy-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-[13px] outline-none focus:border-hud-accent"
        />

        {error && (
          <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-3 py-2 text-[13px] text-hud-muted hover:text-hud-text">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-hud-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
