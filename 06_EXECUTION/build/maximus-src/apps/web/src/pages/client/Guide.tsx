import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { StoredCitation } from "@maximus/shared";
import { PolicyPanel } from "../../components/PolicyPanel";
import { StatusLamp } from "../../components/StatusLamp";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { PREVIEW_READ_ONLY } from "../../lib/preview";
import { usePreviewing } from "../../lib/usePreviewing";

interface ChatMessage {
  id: string;
  sender: "client" | "guide" | "officer";
  body: string;
  status: "green" | "amber" | "red" | null;
  citations: StoredCitation[];
  createdAt: string;
}

interface ThreadResponse {
  threadId: string;
  officerName: string;
  messages: ChatMessage[];
}

const ASK_HINT =
  "Ask anything about how we handle data - e.g. 'Can I share the tenant list with our letting agent?'";

export function GuidePage() {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [officerName, setOfficerName] = useState("your compliance officer");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ text: string; retryBody: string | null } | null>(null);
  const [panel, setPanel] = useState<{ policyId: string; sectionRef: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const previewing = usePreviewing();

  const loadThread = useCallback(async () => {
    try {
      const res = await api<ThreadResponse>("/chat/thread");
      setMessages(res.messages);
      setOfficerName(res.officerName);
    } catch {
      setNotice({ text: "Unable to load the Guide. Refresh to try again.", retryBody: null });
    }
  }, []);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  // Officer replies arrive out of band - poll quietly while the tab is open.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !sending) void loadThread();
    }, 12_000);
    return () => clearInterval(timer);
  }, [loadThread, sending]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  async function send(body: string) {
    setSending(true);
    setNotice(null);
    try {
      const res = await api<{ messages: ChatMessage[] }>("/chat/messages", {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setMessages((prev) => [...(prev ?? []), ...res.messages]);
      setDraft("");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 503 || err.status === 429)) {
        setNotice({ text: err.message, retryBody: body });
      } else {
        setNotice({
          text: "That didn't go through. Please try again.",
          retryBody: body,
        });
      }
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (body && !sending) void send(body);
  }

  return (
    <div className="flex h-full max-w-3xl flex-col">
      <div>
        <h1 className="text-lg font-semibold">Quick questions</h1>
        <p data-testid="quick-questions-intro" className="mt-0.5 text-sm text-client-muted">
          Answers come from the approved policies and procedures. Where they do not answer, the
          question goes to MITMARK.
        </p>
        <div className="mt-1.5 h-px w-12 bg-client-line" />
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pb-4 pr-1">
        {!messages && <p className="text-sm text-client-muted">Loading your conversation…</p>}
        {messages?.length === 0 && (
          <div className="rounded border border-client-line bg-client-surface p-5 text-sm text-client-muted">
            <p>Nothing asked yet. Try one of these:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Can I share the tenant contact list with our letting agent?</li>
              <li>How long do we keep CCTV recordings?</li>
              <li>What should I do if someone asks for a copy of their data?</li>
            </ul>
          </div>
        )}
        {messages?.map((m) => (
          <MessageBubble key={m.id} message={m} officerName={officerName} onCite={setPanel} />
        ))}
        {sending && (
          <p className="text-sm text-client-muted" role="status">
            Checking the policies…
          </p>
        )}
        {notice && (
          <div
            className="rounded border border-status-amber/60 bg-client-surface p-3 text-sm text-client-text"
            role="alert"
          >
            <p>{notice.text}</p>
            {notice.retryBody && (
              <button
                onClick={() => void send(notice.retryBody!)}
                className="mt-2 rounded border border-client-accent px-3 py-1 text-[13px] text-client-accent hover:bg-client-accent hover:text-white"
              >
                Ask again
              </button>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="mt-2 flex gap-2 border-t border-client-line pt-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={ASK_HINT}
          aria-label="Ask a quick question"
          className="flex-1 rounded border border-client-line bg-client-surface px-3 py-2.5 text-sm outline-none placeholder:text-client-muted/70 focus:border-client-accent"
        />
        <button
          type="submit"
          disabled={sending || previewing || draft.trim().length === 0}
          title={previewing ? PREVIEW_READ_ONLY : undefined}
          className="rounded bg-client-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-client-accent/90 disabled:opacity-50"
        >
          Ask
        </button>
      </form>

      {panel && (
        <PolicyPanel
          policyId={panel.policyId}
          sectionRef={panel.sectionRef}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  );
}

function MessageBubble({
  message,
  officerName,
  onCite,
}: {
  message: ChatMessage;
  officerName: string;
  onCite: (target: { policyId: string; sectionRef: string }) => void;
}) {
  if (message.sender === "client") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded border border-client-accent/40 bg-client-accent/10 px-4 py-3">
          <p className="text-sm leading-relaxed text-client-text">{message.body}</p>
          <p className="mt-1 text-right text-[11px] text-client-muted">
            {formatLondon(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  const isOfficer = message.sender === "officer";
  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[85%] rounded border px-4 py-3 ${
          isOfficer ? "border-client-line bg-client-line" : "border-client-line bg-client-surface"
        }`}
      >
        <div className="flex items-center gap-3">
          {isOfficer ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-client-muted">
              {officerName} - your compliance officer
            </span>
          ) : (
            <span className="text-[11px] uppercase tracking-wider text-client-muted">
              From the policies
            </span>
          )}
          {message.status && <StatusLamp status={message.status} />}
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-client-text">
          {message.body}
        </p>
        {message.citations.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {message.citations.map((c) => (
              <button
                key={`${c.policyId}-${c.sectionRef}`}
                onClick={() => onCite({ policyId: c.policyId, sectionRef: c.sectionRef })}
                className="rounded border border-client-accent/60 px-2 py-1 text-[12px] text-client-accent hover:bg-client-accent hover:text-white"
                title={c.heading}
              >
                {c.policyCode} §{c.sectionRef}
              </button>
            ))}
          </div>
        )}
        <p className="mt-1.5 text-[11px] text-client-muted">{formatLondon(message.createdAt)}</p>
      </div>
    </div>
  );
}
