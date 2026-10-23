import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../lib/api";
import { formatLondon } from "../lib/format";
import { Markdown } from "./Markdown";

export interface PolicyDetail {
  id: string;
  code: string;
  title: string;
  version: number;
  bodyMarkdown: string;
  approvedAt: string | null;
  sections: { id: string; sectionRef: string; heading: string; bodyMarkdown: string }[];
}

/**
 * Client-side policy viewer: a side panel showing one approved policy, with
 * an optional target section highlighted (used by chat citation chips).
 */
export function PolicyPanel({
  policyId,
  sectionRef,
  onClose,
}: {
  policyId: string;
  sectionRef?: string;
  onClose: () => void;
}) {
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setPolicy(null);
    setError(null);
    api<PolicyDetail>(`/policies/${policyId}`)
      .then(setPolicy)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Unable to open the policy."),
      );
  }, [policyId]);

  useEffect(() => {
    const aside = asideRef.current;
    const el = targetRef.current;
    if (policy && aside && el) {
      const top =
        el.getBoundingClientRect().top - aside.getBoundingClientRect().top + aside.scrollTop - 12;
      aside.scrollTo({ top, behavior: "smooth" });
    }
  }, [policy]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        ref={asideRef}
        data-testid="policy-panel"
        className="h-full w-full max-w-lg overflow-y-auto border-l border-client-line bg-client-surface p-6 text-client-text"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {policy && (
              <>
                <h2 className="text-lg font-semibold">{policy.title}</h2>
                <p className="mt-0.5 text-sm text-client-muted">
                  {policy.code} · version {policy.version}
                  {policy.approvedAt
                    ? ` · approved ${formatLondon(policy.approvedAt)}`
                    : ""}
                </p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            data-testid="policy-panel-close"
            className="text-sm text-client-muted hover:text-client-text"
          >
            Close
          </button>
        </div>

        {error && (
          <p className="mt-6 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
            {error}
          </p>
        )}
        {!policy && !error && <p className="mt-6 text-client-muted">Loading policy…</p>}

        {policy && (
          <>
            {policy.bodyMarkdown && (
              <div className="mt-4 text-sm text-client-muted">
                <Markdown>{policy.bodyMarkdown}</Markdown>
              </div>
            )}
            <div className="mt-4 space-y-5">
              {policy.sections.map((section) => {
                const highlighted = sectionRef === section.sectionRef;
                return (
                  <section
                    key={section.id}
                    ref={highlighted ? (el) => (targetRef.current = el) : undefined}
                    className={`rounded border p-4 ${
                      highlighted
                        ? "border-client-accent bg-client-accent/5"
                        : "border-client-line bg-client-surface"
                    }`}
                  >
                    <h3 className="text-sm font-semibold text-client-accent">
                      <span>{section.sectionRef}</span> {section.heading}
                    </h3>
                    <div className="mt-2 text-sm text-client-text">
                      <Markdown>{section.bodyMarkdown}</Markdown>
                    </div>
                  </section>
                );
              })}
              {policy.sections.length === 0 && (
                <p className="text-sm text-client-muted">This policy has no sections.</p>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
