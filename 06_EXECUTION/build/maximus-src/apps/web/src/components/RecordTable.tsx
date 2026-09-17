import type { ReactNode } from "react";
import type { RecordEntry } from "@maximus/shared";
import { lineOf } from "@maximus/shared";
import { formatDateGB, formatGBP } from "../lib/format";

/**
 * The Record table: one row per piece of work MITMARK completed. Used
 * read-only in the client portal and, with an actions column, in the admin
 * workspace. The cost and contractor-equivalent columns are computed here
 * from the entry's hours and the organisation's rates, the same arithmetic
 * the API uses for the totals.
 */
export function RecordTable({
  entries,
  ioRate,
  dayRate,
  showSource = false,
  renderActions,
}: {
  entries: RecordEntry[];
  ioRate: number;
  dayRate: number;
  /** Show the entry's source (manual, clock, policy, guide, export, import). Admin only. */
  showSource?: boolean;
  /** An actions column for the admin workspace. Omit for the read-only client Record. */
  renderActions?: (entry: RecordEntry) => ReactNode;
}) {
  const colCount = 8 + (showSource ? 1 : 0) + (renderActions ? 1 : 0);

  return (
    <div className="overflow-auto rounded border border-client-line">
      <table data-testid="record-table" className="w-full min-w-[900px] border-collapse text-[13px]">
        <thead>
          <tr>
            <Th style={{ width: 110 }}>Date</Th>
            <Th style={{ width: 90 }}>Line</Th>
            <Th style={{ width: "30%" }}>What MITMARK did</Th>
            <Th style={{ width: "26%" }}>Outcome</Th>
            <Th align="right">Hours</Th>
            <Th align="right">Cost eq.</Th>
            <Th align="right">Contractor eq.</Th>
            <Th>Reviewed</Th>
            {showSource && <Th>Source</Th>}
            {renderActions && <Th>Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-2 py-3 text-client-muted">
                No entries for this selection.
              </td>
            </tr>
          ) : (
            entries.map((e) => {
              const line = lineOf(e.line);
              const io = e.hours * (Number(ioRate) || 0);
              const con = (e.hours / 8) * (Number(dayRate) || 0);
              return (
                <tr key={e.id}>
                  <Td className="whitespace-nowrap font-mono">{formatDateGB(e.date)}</Td>
                  <Td>{line?.short ?? e.line}</Td>
                  <Td>
                    {e.what}
                    {e.ill && <Tag tone="amber">illustrative</Tag>}
                  </Td>
                  <Td>
                    {e.outcome}
                    {e.deadline && <Tag tone="orange">{e.deadline}</Tag>}
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {e.hours}
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {formatGBP(io)}
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {formatGBP(con)}
                  </Td>
                  <Td>
                    <Tag tone="accent">{e.reviewer}</Tag>
                    {!e.reviewed && <Tag tone="muted">not reviewed</Tag>}
                  </Td>
                  {showSource && (
                    <Td className="font-mono text-[12px] text-client-muted">
                      {e.source}
                      {e.sourceRef ? ` (${e.sourceRef})` : ""}
                    </Td>
                  )}
                  {renderActions && <Td>{renderActions(e)}</Td>}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  align,
  style,
}: {
  children: ReactNode;
  align?: "left" | "right";
  style?: React.CSSProperties;
}) {
  return (
    <th
      style={style}
      className={`border-b border-client-line px-2 py-2 font-mono text-[11px] font-medium uppercase tracking-wider text-client-muted ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`border-b border-client-line px-2 py-2 align-top ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}

function Tag({ children, tone }: { children: ReactNode; tone: "amber" | "orange" | "accent" | "muted" }) {
  const toneClass = {
    amber: "border-status-amber text-status-amber",
    orange: "border-status-amber text-status-amber",
    accent: "border-client-accent text-client-accent",
    muted: "border-client-line text-client-muted",
  }[tone];
  return (
    <span
      className={`ml-1.5 inline-block whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[11px] ${toneClass}`}
    >
      {children}
    </span>
  );
}
