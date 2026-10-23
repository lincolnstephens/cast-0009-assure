import type { StatementResponse } from "@maximus/shared";
import { areaName } from "@maximus/shared";
import { formatDateGB, formatGBP } from "../lib/format";

/**
 * The CFO statement: a plain, printable document. Its wording is written to a
 * standard and is reproduced verbatim, including the limitations paragraph
 * and the sentence shown when the retainer fee has not been entered. Do not
 * rewrite, shorten or improve any of it.
 *
 * v1.6 (FRAGO 06 3.5, DC-61): three parts. The service (v1.7, FRAGO 07
 * 3.4: the eight modules in order, each with its status and its one line);
 * what MITMARK has done (v1.7: totals by module) (the Record, item by item with hours and
 * cost, then the totals and comparators as before); what comes next (the open
 * dated tasks in the workplan). There is no comparison of what was planned
 * against what was achieved.
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

      <section data-testid="statement-service" className="mb-6">
        <h3 className="text-[15px] font-semibold">The service</h3>
        <p className="max-w-[58ch]">
          MITMARK provides the data protection officer function to {clientName} under a retainer,
          as eight modules. Each is set out below with its status for this client and what it
          covers.
        </p>
        <table className="my-3 w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <StH>Module</StH>
              <StH>Status</StH>
              <StH>What it covers</StH>
            </tr>
          </thead>
          <tbody>
            {data.service.map((m) => (
              <tr key={m.id} data-testid="statement-module">
                <StTd className="whitespace-nowrap">
                  {m.id}. {m.name}
                </StTd>
                <StTd className="whitespace-nowrap">{m.status}</StTd>
                <StTd>{m.introduction}</StTd>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section data-testid="statement-done">
      <h3 className="text-[15px] font-semibold">What MITMARK has done</h3>
      <p className="max-w-[58ch]">
        In {data.period} MITMARK completed {totals.items} items of work under the retainer across{" "}
        {totals.byModule.length} of the eight modules. {totals.deadlinesMet} of them carried a
        statutory or governance deadline; all were met. Each item was reviewed by a named MITMARK
        person before it was recorded.
      </p>
      {data.items.length > 0 && (
        <table className="my-3 w-full border-collapse text-[13px]" data-testid="statement-items">
          <thead>
            <tr>
              <StH>Date</StH>
              <StH>Work</StH>
              <StH>Module</StH>
              <StH align="right">Hours</StH>
              <StH align="right">Officer's time at £{data.ioRate}/hour</StH>
            </tr>
          </thead>
          <tbody>
            {data.items.map((e) => (
              <tr key={e.id}>
                <StTd className="whitespace-nowrap font-mono">{formatDateGB(e.date)}</StTd>
                <StTd>{e.what}</StTd>
                <StTd>{areaName(e.area)}</StTd>
                <StTd align="right">{e.hours}</StTd>
                <StTd align="right">{formatGBP(e.hours * data.ioRate)}</StTd>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <table className="my-3 w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <StH>Module</StH>
            <StH align="right">Items</StH>
            <StH align="right">Hours of the officer's time replaced</StH>
          </tr>
        </thead>
        <tbody>
          {totals.byModule.map((m) => (
            <tr key={m.area} data-testid="statement-module-total">
              <StTd>{m.name}</StTd>
              <StTd align="right">{m.items}</StTd>
              <StTd align="right">{m.hours}</StTd>
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
      </section>

      <section data-testid="statement-next" className="mt-6">
        <h3 className="text-[15px] font-semibold">What comes next</h3>
        {data.next.length ? (
          <>
            <p className="max-w-[58ch]">
              The work planned next, with its dates, from the workplan MITMARK keeps for {clientName},
              as at the date of this statement.
            </p>
            <table className="my-3 w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <StH>Date</StH>
                  <StH>Work</StH>
                  <StH>Module</StH>
                  <StH>Who</StH>
                </tr>
              </thead>
              <tbody>
                {data.next.map((t) => (
                  <tr key={t.id} data-testid="statement-next-item">
                    <StTd className="whitespace-nowrap font-mono">{formatDateGB(t.dueAt)}</StTd>
                    <StTd>{t.title}</StTd>
                    <StTd>{t.areaName}</StTd>
                    <StTd>{t.owner}</StTd>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="max-w-[58ch]">No dated work is planned in the workplan yet.</p>
        )}
      </section>


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
