import { taskStatusMark, type Rag, type StatusMarkKind, type TaskStatus } from "@maximus/shared";

/**
 * v1.9 (FRAGO 09 3.3). The one status mark a task carries, wherever its
 * status is shown: client Job management, the module pages' Jobs tables,
 * Waiting on you, the Workplan and the operator's Jobs board.
 *
 * Green tick for done, grey circle for not started, amber circle for in
 * progress, red with its word for overdue or blocked. The words always sit
 * beside it in the DOM, so colour never carries the meaning alone.
 *
 * Contrast. The house green and amber are bright, so on the day page they
 * fall short of 3:1 on their own. Every mark therefore carries an edge in the
 * page's text token (status-mark-edge), which is what the eye and the gate
 * measure against the page. The tick and the red mark's bar are drawn in
 * --mark-ink, the theme's dark (index.css), which reads on green and red in
 * both themes. The words are in the text token: 4.5:1 and well above on both
 * the day portal and the night workspace. House tokens only.
 */
export const MARK_FILL: Record<StatusMarkKind, string> = {
  done: "var(--sev-protected)",
  not_started: "var(--text-3)",
  in_progress: "var(--sev-elevated)",
  red: "var(--sev-critical)",
  not_applicable: "var(--text-3)",
};

/**
 * v1.10. The mark's shapes alone, centred on (cx, cy) with radius r, for use
 * inside any SVG: the status mark here, and the markers on the Global
 * coverage map, so both follow one rule. Drawn for r = 6.25 and scaled.
 */
export function MarkShapes({
  mark,
  cx,
  cy,
  r,
  edgeTestId,
}: {
  mark: StatusMarkKind;
  cx: number;
  cy: number;
  r: number;
  edgeTestId?: string;
}) {
  const k = r / 6.25;
  const at = (dx: number, dy: number) => `${cx + dx * k} ${cy + dy * k}`;
  return (
    <>
      <circle
        data-testid={edgeTestId}
        cx={cx}
        cy={cy}
        r={r}
        fill={MARK_FILL[mark]}
        stroke="var(--text)"
        strokeWidth={1.5 * Math.max(1, k * 0.8)}
      />
      {mark === "done" && (
        <path
          d={`M${at(-3, 0.2)} L${at(-0.9, 2.3)} L${at(3, -2)}`}
          fill="none"
          stroke="var(--mark-ink)"
          strokeWidth={1.6 * k}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {mark === "red" && (
        <>
          <line
            x1={cx}
            y1={cy - 3.4 * k}
            x2={cx}
            y2={cy + 0.8 * k}
            stroke="var(--mark-ink)"
            strokeWidth={1.6 * k}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy + 3.1 * k} r={0.9 * k} fill="var(--mark-ink)" />
        </>
      )}
    </>
  );
}

export function StatusMark({
  status,
  rag,
  className = "",
}: {
  status: TaskStatus;
  rag: Rag;
  className?: string;
}) {
  const { mark, word } = taskStatusMark(status, rag);
  return (
    <span
      data-testid="status-mark"
      data-mark={mark}
      data-word={word}
      className={`inline-flex items-center gap-1.5 text-[12px] leading-tight ${className}`}
      style={{ color: "var(--text)" }}
    >
      <svg
        data-testid="status-mark-icon"
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 14 14"
        className="shrink-0"
      >
        <MarkShapes mark={mark} cx={7} cy={7} r={6.25} edgeTestId="status-mark-edge" />
      </svg>
      <span data-testid="status-word">{word}</span>
    </span>
  );
}
