import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  COVERAGE_STATUS_LABEL,
  COVERAGE_STATUS_MARK,
  FILING_DUTY_QUALIFIER,
  coverageStatusSchema,
  coverageTitle,
  type CoverageEntry,
  type CoverageStatus,
} from "@maximus/shared";
import { MarkShapes } from "./StatusMark";
import { LAND_HEIGHT, LAND_PATH, LAND_TOP, LAND_WIDTH } from "./worldLand";

/**
 * v1.10 (FRAGO 11 3.3). The organisation's jurisdictions: a world map with a
 * marker per jurisdiction, the same entries as a table beneath it, and a card
 * for whichever is chosen. The map is a static land outline (worldLand.ts),
 * equirectangular, with no tiles and no network. Below 640px the map is
 * hidden and the table carries the tile.
 *
 * Colour never alone: each marker is the v1.9 status mark with its edge, the
 * row and the card carry the status in words, and a key beneath the map names
 * every mark. Nothing here says a filing has been made: the card gives the
 * filing duty under the qualifier "to be confirmed at mobilisation".
 */

/** A status, as its mark and its words. */
export function CoverageMark({ status, className = "" }: { status: CoverageStatus; className?: string }) {
  const word = COVERAGE_STATUS_LABEL[status];
  return (
    <span
      data-testid="coverage-mark"
      data-status={status}
      data-word={word}
      className={`inline-flex items-center gap-1.5 text-[12px] leading-tight ${className}`}
      style={{ color: "var(--text)" }}
    >
      <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
        <MarkShapes mark={COVERAGE_STATUS_MARK[status]} cx={7} cy={7} r={6.25} edgeTestId="coverage-mark-edge" />
      </svg>
      <span data-testid="coverage-word">{word}</span>
    </span>
  );
}

/** The card for one jurisdiction. */
function CoverageCard({ entry, onClose }: { entry: CoverageEntry; onClose: () => void }) {
  return (
    <div
      data-testid="coverage-card"
      data-id={entry.id}
      role="region"
      aria-label={`${entry.name}, details`}
      className="mt-3 rounded border border-client-line bg-client-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-semibold">{entry.name}</h3>
        <button
          type="button"
          data-testid="coverage-card-close"
          onClick={onClose}
          className="text-[12px] text-client-muted underline hover:text-client-text"
        >
          Close
        </button>
      </div>
      <dl className="mt-2 grid gap-x-4 gap-y-1 text-[13px] sm:grid-cols-[auto_1fr]">
        <dt className="text-client-muted">Hub</dt>
        <dd data-testid="coverage-card-hub">{entry.hub}</dd>
        <dt className="text-client-muted">Regulator</dt>
        <dd data-testid="coverage-card-regulator">{entry.regulator || "Not recorded"}</dd>
        <dt className="text-client-muted">Law</dt>
        <dd data-testid="coverage-card-law">{entry.law || "Not recorded"}</dd>
        <dt className="text-client-muted">Status</dt>
        <dd>
          <CoverageMark status={entry.status} />
        </dd>
      </dl>
      <p data-testid="coverage-card-duty" className="mt-2 max-w-[75ch] text-[13px] text-client-text">
        {FILING_DUTY_QUALIFIER} {entry.filingDuty || "not yet recorded."}
      </p>
    </div>
  );
}

/** The entries as a table: five columns from 640px, stacked rows below. */
export function CoverageTable({
  entries,
  selected,
  onSelect,
  testId = "coverage-table",
}: {
  entries: CoverageEntry[];
  selected: string | null;
  onSelect: (id: string) => void;
  testId?: string;
}) {
  const cell = "block py-0.5 sm:table-cell sm:py-2 sm:pr-3 sm:align-top";
  const label = "font-mono text-[10px] uppercase tracking-wider text-client-muted sm:hidden";
  return (
    <table data-testid={testId} className="mt-3 block w-full text-left text-[13px] sm:table">
      <thead className="hidden sm:table-header-group">
        <tr className="border-b border-client-line text-[11px] uppercase tracking-wider text-client-muted">
          <th scope="col" className="py-1.5 pr-3 font-medium">Hub</th>
          <th scope="col" className="py-1.5 pr-3 font-medium">Jurisdiction</th>
          <th scope="col" className="py-1.5 pr-3 font-medium">Regulator</th>
          <th scope="col" className="py-1.5 pr-3 font-medium">Law</th>
          <th scope="col" className="py-1.5 pr-3 font-medium">Status</th>
        </tr>
      </thead>
      <tbody className="block sm:table-row-group">
        {entries.map((e) => (
          <tr
            key={e.id}
            data-testid="coverage-row"
            data-id={e.id}
            data-status={e.status}
            onClick={() => onSelect(e.id)}
            className={`block cursor-pointer border-b border-client-line py-2 sm:table-row sm:py-0 ${
              selected === e.id ? "bg-client-accent/5" : "hover:bg-client-accent/5"
            }`}
          >
            <td className={cell}>
              <button
                type="button"
                data-testid="coverage-row-open"
                aria-expanded={selected === e.id}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onSelect(e.id);
                }}
                className="text-left font-semibold text-client-accent underline-offset-2 hover:underline"
              >
                {e.hub}
              </button>
            </td>
            <td className={cell}>
              <span className={label}>Jurisdiction </span>
              {e.name}
            </td>
            <td className={`${cell} break-words`}>
              <span className={label}>Regulator </span>
              {e.regulator || "Not recorded"}
            </td>
            <td className={`${cell} break-words`}>
              <span className={label}>Law </span>
              {e.law || "Not recorded"}
            </td>
            <td className={cell}>
              <CoverageMark status={e.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// The map
// ---------------------------------------------------------------------------

const MARKER_R = 7;
const LABEL_FONT = 12;
const LABEL_H = 15;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

interface Placed {
  entry: CoverageEntry;
  /** Where the place is. */
  tx: number;
  ty: number;
  /** Where the marker is drawn: moved off the place only when two would overlap. */
  x: number;
  y: number;
  label: { x: number; y: number; anchor: "start" | "end" | "middle" };
}

/**
 * Markers at their places, moved apart only as far as they must be to stay
 * separately choosable, then each hub's label in the first free spot around
 * its marker. Deterministic: the same list lays out the same way every time.
 */
function layout(entries: CoverageEntry[], width: number): Placed[] {
  const k = width / LAND_WIDTH;
  const height = LAND_HEIGHT * k;
  const pts = entries.map((e) => {
    const tx = (e.lon + 180) * k;
    const ty = Math.min(Math.max((LAND_TOP - e.lat) * k, MARKER_R + 2), height - MARKER_R - 2);
    return { entry: e, tx, ty, x: tx, y: ty };
  });
  const min = MARKER_R * 2 + 4;
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i];
        const b = pts[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d < 0.01) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const push = (min - d) / 2 + 0.5;
        a.x -= (dx / d) * push;
        a.y -= (dy / d) * push;
        b.x += (dx / d) * push;
        b.y += (dy / d) * push;
        moved = true;
      }
    }
    if (!moved) break;
  }

  const markers: Box[] = pts.map((p) => ({ x: p.x - MARKER_R, y: p.y - MARKER_R, w: MARKER_R * 2, h: MARKER_R * 2 }));
  const labels: Box[] = [];
  const gap = MARKER_R + 4;
  return pts.map((p, i) => {
    const w = p.entry.hub.length * LABEL_FONT * 0.6 + 6;
    const candidates: { box: Box; label: Placed["label"] }[] = [];
    const add = (bx: number, by: number, anchor: Placed["label"]["anchor"]) => {
      const left = anchor === "start" ? bx : anchor === "end" ? bx - w : bx - w / 2;
      candidates.push({
        box: { x: left, y: by - LABEL_H + 3, w, h: LABEL_H },
        label: { x: bx, y: by, anchor },
      });
    };
    for (const step of [0, 1, 2]) {
      const off = step * LABEL_H;
      add(p.x + gap, p.y + 4 + off, "start");
      add(p.x - gap, p.y + 4 + off, "end");
      if (step > 0) {
        add(p.x + gap, p.y + 4 - off, "start");
        add(p.x - gap, p.y + 4 - off, "end");
      }
      add(p.x, p.y - gap - off, "middle");
      add(p.x, p.y + gap + LABEL_H - 3 + off, "middle");
    }
    const inside = (b: Box) => b.x >= 0 && b.x + b.w <= width && b.y >= 0 && b.y + b.h <= height;
    const free = (b: Box) =>
      inside(b) && !labels.some((l) => overlaps(l, b)) && !markers.some((m, j) => j !== i && overlaps(m, b));
    const pick = candidates.find((c) => free(c.box)) ?? candidates.find((c) => inside(c.box)) ?? candidates[0];
    labels.push(pick.box);
    return { ...p, label: pick.label };
  });
}

function CoverageMap({
  entries,
  selected,
  onSelect,
}: {
  entries: CoverageEntry[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(960);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const k = width / LAND_WIDTH;
  const height = Math.round(LAND_HEIGHT * k);
  const placed = layout(entries, width);

  return (
    <div ref={ref} data-testid="coverage-map" className="mt-3 hidden w-full sm:block">
      <svg
        data-testid="coverage-map-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={`World map with ${entries.length} jurisdictions marked. The same entries are in the table below.`}
        className="block rounded border border-client-line"
        style={{ background: "var(--surface-base)" }}
      >
        <path data-testid="coverage-land" d={LAND_PATH} transform={`scale(${k})`} fill="var(--border)" stroke="none" />
        {placed.map((p) => {
          const word = COVERAGE_STATUS_LABEL[p.entry.status];
          const chosen = selected === p.entry.id;
          const moved = Math.hypot(p.x - p.tx, p.y - p.ty) > 2;
          return (
            <g
              key={p.entry.id}
              data-testid="coverage-marker"
              data-id={p.entry.id}
              data-status={p.entry.status}
              data-word={word}
              role="button"
              tabIndex={0}
              aria-label={`${p.entry.hub}, ${p.entry.name}: ${word}`}
              aria-pressed={chosen}
              onClick={() => onSelect(p.entry.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(p.entry.id);
                }
              }}
              className="cursor-pointer focus:outline-none [&:focus-visible>circle.ring]:opacity-100"
            >
              <title>{`${p.entry.hub}, ${p.entry.name}: ${word}`}</title>
              {moved && (
                <>
                  <line x1={p.tx} y1={p.ty} x2={p.x} y2={p.y} stroke="var(--text)" strokeWidth={1} />
                  <circle cx={p.tx} cy={p.ty} r={1.6} fill="var(--text)" />
                </>
              )}
              <circle
                className="ring"
                cx={p.x}
                cy={p.y}
                r={MARKER_R + 3.5}
                fill="none"
                stroke="var(--client-accent, var(--accent))"
                strokeWidth={2}
                opacity={chosen ? 1 : 0}
              />
              <MarkShapes
                mark={COVERAGE_STATUS_MARK[p.entry.status]}
                cx={p.x}
                cy={p.y}
                r={MARKER_R}
                edgeTestId="coverage-marker-edge"
              />
              <text
                data-testid="coverage-marker-label"
                x={p.label.x}
                y={p.label.y}
                textAnchor={p.label.anchor}
                fontSize={LABEL_FONT}
                fontWeight={chosen ? 600 : 500}
                fill="var(--text)"
                stroke="var(--surface-base)"
                strokeWidth={3}
                strokeLinejoin="round"
                paintOrder="stroke"
                style={{ fontFamily: "var(--sans)" }}
              >
                {p.entry.hub}
              </text>
            </g>
          );
        })}
      </svg>
      <ul data-testid="coverage-key" className="mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-label="Key">
        {coverageStatusSchema.options.map((s) => (
          <li key={s}>
            <CoverageMark status={s} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The Compliance Tracker's tile, between Journey and Overall compliance
 * status. Drawn only when the organisation lists a jurisdiction.
 */
export function CoverageTile({ entries }: { entries: CoverageEntry[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setSelected(null), [entries]);
  if (entries.length === 0) return null;
  const title = coverageTitle(entries.length);
  const chosen = entries.find((e) => e.id === selected) ?? null;
  const toggle = (id: string) => setSelected((s) => (s === id ? null : id));
  return (
    <section data-testid="coverage-tile" aria-labelledby="coverage-heading">
      <h2 id="coverage-heading" className="text-[15px] font-semibold">
        {title}
      </h2>
      <p data-testid="coverage-basis" className="mt-1 max-w-[75ch] text-[13px] text-client-muted">
        {entries.length === 1 ? "One jurisdiction" : `${entries.length} jurisdictions`} in the programme. Each status is
        MITMARK's work in that jurisdiction; filing duties are to be confirmed at mobilisation. Choose a marker or a row
        for its details.
      </p>
      <CoverageMap entries={entries} selected={selected} onSelect={toggle} />
      <CoverageTable entries={entries} selected={selected} onSelect={toggle} />
      {chosen && <CoverageCard entry={chosen} onClose={() => setSelected(null)} />}
    </section>
  );
}

/** Module 1's table, read from the same list, with the same card. */
export function RegistrationsTable({ entries, heading }: { entries: CoverageEntry[]; heading: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  if (entries.length === 0) return null;
  const chosen = entries.find((e) => e.id === selected) ?? null;
  const toggle = (id: string) => setSelected((s) => (s === id ? null : id));
  return (
    <section data-testid="module-registrations" className="mt-6" aria-labelledby="module-registrations-heading">
      <h2 id="module-registrations-heading" className="text-[14px] font-semibold">
        {heading}
      </h2>
      <CoverageTable entries={entries} selected={selected} onSelect={toggle} testId="registrations-table" />
      {chosen && <CoverageCard entry={chosen} onClose={() => setSelected(null)} />}
    </section>
  );
}
