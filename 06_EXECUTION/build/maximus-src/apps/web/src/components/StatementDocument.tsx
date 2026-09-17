import type { StatementResponse } from "@maximus/shared";
import { formatDateGB, formatGBP } from "../lib/format";

/**
 * The CFO statement: a plain, printable document. Its wording is written to a
 * standard and is reproduced verbatim, including the limitations paragraph
 * and the sentence shown when the retainer fee has not been entered. Do not
 * rewrite, shorten or improve any of it.
 */
export function StatementDocument({ data }: { data: StatementResponse }) {
  const { totals } = data;
  const clientName = data.clientName || "the client";
  const ioName = data.ioName || "Information Officer";
  const lead = data.lead || "MITMARK contract lead";
  const monthlyRetainer = data.fee !== null ? data.fee / data.months : null;

  return (
    <div
      data-testid="statement"
      className="max-w-[820px] rounded border border-client-line bg-client-surface p-8 print:max-w-none print:border-none print:p-0"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        Statement of work and value
      </p>
      <h2 className="mt-1 text-xl font-semibold">
        Data protection and information security support, {data.period}
      </h2>
      <div className="mb-6 mt-2 font-mono text-[12px] text-client-muted">
        Prepared by MITMARK Intelligence Ltd for {clientName}, for the attention of the {ioName}{" "}
        and the finance lead.
        {data.illustrative
          ? " This statement contains illustrative entries and is not a record of work done."
          : ""}
      </div>

      <h3 className="text-[15px] font-semibold">What was done</h3>
      {data.obligations ? (
        <p className="mb-2 max-w-[58ch] font-medium" data-testid="statement-obligations">
          {data.obligations.sentence}
          <span className="mt-1 block text-[12px] font-normal text-client-muted">
            {data.obligations.basis}
          </span>
        </p>
      ) : null}
      <p className="max-w-[58ch]">
        In {data.period} MITMARK completed {totals.items} items of work under the retainer across{" "}
        {totals.byLine.length} of the twelve service lines. {totals.deadlinesMet} of them carried a
        statutory or governance deadline; all were met. Each item was reviewed by a named MITMARK
        person before it was recorded.
      </p>
      <table className="my-3 w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <StH>Service line</StH>
            <StH align="right">Items</StH>
            <StH align="right">Hours of the officer's time replaced</StH>
          </tr>
        </thead>
        <tbody>
          {totals.byLine.map((l) => (
            <tr key={l.line}>
              <StTd>{l.name}</StTd>
              <StTd align="right">{l.items}</StTd>
              <StTd align="right">{l.hours}</StTd>
            </tr>
          ))}
          <tr>
            <StTd>
              <b>Total</b>
            </StTd>
            <StTd align="right">
              <b>{totals.items}</b>
            </StTd>
            <StTd align="right">
              <b>{totals.hours}</b>
            </StTd>
          </tr>
        </tbody>
      </table>

      <h3 className="text-[15px] font-semibold">What it would otherwise have cost</h3>
      <p className="max-w-[58ch]">
        The {ioName} role is part-time within a full-time post. The hours above are an estimate of
        the officer's own time the work would have taken. Two comparators are given; both depend on
        rates that should be confirmed by the client.
      </p>
      <table className="my-3 w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <StH>Comparator</StH>
            <StH>Basis</StH>
            <StH align="right">Amount</StH>
          </tr>
        </thead>
        <tbody>
          <tr>
            <StTd>Officer's own time</StTd>
            <StTd>
              {totals.hours} hours at £{data.ioRate}/hour loaded
            </StTd>
            <StTd align="right">{formatGBP(totals.io)}</StTd>
          </tr>
          <tr>
            <StTd>External consultant</StTd>
            <StTd>
              {(totals.hours / 8).toFixed(1)} days at £{data.dayRate}/day ex VAT
            </StTd>
            <StTd align="right">{formatGBP(totals.con)}</StTd>
          </tr>
          <tr>
            <StTd>Retainer for the period</StTd>
            <StTd>
              {monthlyRetainer !== null
                ? `${data.months} months at £${Math.round(monthlyRetainer).toLocaleString("en-GB")}/month ex VAT`
                : "fee not entered"}
            </StTd>
            <StTd align="right">{data.fee !== null ? formatGBP(data.fee) : "not entered"}</StTd>
          </tr>
        </tbody>
      </table>
      {data.fee !== null ? (
        <p className="max-w-[58ch]">
          Against the retainer, the consultant comparator is {(data.conRatio ?? 0).toFixed(1)}x and
          the officer's-time comparator is {(data.ioRatio ?? 0).toFixed(1)}x. Neither comparator
          includes the cost of a missed statutory deadline, which is not estimated here.
        </p>
      ) : (
        <p className="max-w-[58ch]">
          No ratio is shown because the retainer fee has not been entered. When it is, this
          paragraph states the comparators against it.
        </p>
      )}

      <h3 className="text-[15px] font-semibold">Obligations met</h3>
      {data.deadlines.length ? (
        <table className="my-3 w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <StH>Date</StH>
              <StH>Obligation</StH>
              <StH>Result</StH>
            </tr>
          </thead>
          <tbody>
            {data.deadlines.map((e) => (
              <tr key={e.id}>
                <StTd className="whitespace-nowrap font-mono">{formatDateGB(e.date)}</StTd>
                <StTd>{e.deadline}</StTd>
                <StTd>{e.outcome}</StTd>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="max-w-[58ch]">No statutory deadlines fell in this period.</p>
      )}

      <h3 className="text-[15px] font-semibold">Limitations</h3>
      <p className="max-w-[58ch]">
        Hours are estimates made by MITMARK at the time of the work and have not been independently
        verified. Rates are assumptions until the client confirms them. This statement records work
        completed; it does not assess the client's overall compliance position.
      </p>
      <div className="mt-8 border-t border-client-line pt-3 text-[13px] text-client-muted">
        Prepared by {lead}, MITMARK Intelligence Ltd. Generated {data.generated}.
      </div>
    </div>
  );
}

function StH({ children, align }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`border-b border-client-line py-2 pr-3 font-mono text-[11px] font-medium uppercase tracking-wider text-client-muted ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function StTd({
  children,
  align,
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`border-b border-client-line py-1.5 pr-3 ${
        align === "right" ? "text-right font-mono tabular-nums" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}
