/**
 * The defence-file export: a summary PDF plus every approved policy as
 * markdown, zipped. Ported from Drizzle+Postgres to the store - this now
 * takes an already-loaded `OrgDoc` (no query joins) and returns the zip
 * bytes for the caller to persist with `writeExportBlob`.
 */

import JSZip from "jszip";
import { DateTime } from "luxon";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ClockRecord, OrgDoc, PostureDomainRecord } from "../db/model.ts";
import { readUsers } from "../db/store.ts";
import { latestApprovedPolicies } from "./policies.ts";

const LONDON = "Europe/London";
const MARGIN = 50;
const LINE_HEIGHT = 14;
const PAGE_WIDTH = 595;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/** Short human-readable clock reference, e.g. SAR-3F2A91B0. */
function clockReference(clock: ClockRecord): string {
  const prefix = clock.kind === "sar_1_month" ? "SAR" : "BREACH";
  return `${prefix}-${clock.id.slice(0, 8).toUpperCase()}`;
}

/** Build the defence-file zip: summary PDF + every approved policy as markdown. */
export async function generateDefenceFile(doc: OrgDoc): Promise<Uint8Array> {
  const usersDoc = await readUsers();
  const nameOf = (userId: string | null): string =>
    (userId && usersDoc.users.find((u) => u.id === userId)?.displayName) || " - ";

  const generatedAt = DateTime.now().setZone(LONDON);
  const pdfBytes = await buildSummaryPdf(doc, generatedAt, nameOf);

  const zip = new JSZip();
  zip.file("summary.pdf", pdfBytes);

  const approved = latestApprovedPolicies(doc);
  for (const policy of approved) {
    const md = `# ${policy.code} - ${policy.title}\n\nVersion ${policy.version}\n\n${policy.bodyMarkdown}\n`;
    zip.file(`policies/${policy.code}-v${policy.version}.md`, md);
  }

  return zip.generateAsync({ type: "uint8array" });
}

async function buildSummaryPdf(
  doc: OrgDoc,
  generatedAt: DateTime,
  nameOf: (userId: string | null) => string,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, 842]);
  let y = page.getHeight() - MARGIN;

  const draw = (text: string, opts?: { bold?: boolean; size?: number }) => {
    const size = opts?.size ?? 10;
    const f = opts?.bold ? bold : font;
    for (const line of wrap(text, f, size, TEXT_WIDTH)) {
      if (y < MARGIN + LINE_HEIGHT) {
        page = pdf.addPage([PAGE_WIDTH, 842]);
        y = page.getHeight() - MARGIN;
      }
      page.drawText(line, {
        x: MARGIN,
        y,
        size,
        font: f,
        color: rgb(0.1, 0.1, 0.15),
      });
      y -= LINE_HEIGHT + (opts?.bold ? 2 : 0);
    }
  };

  draw("Tessera Assure Defence File", { bold: true, size: 16 });
  draw(`Organisation: ${doc.branding.displayName || doc.name}`);
  draw(`Generated: ${generatedAt.toFormat("dd MMM yyyy, HH:mm")} (${LONDON})`);
  y -= 6;

  draw("Posture (current)", { bold: true, size: 12 });
  const postureRows = [...doc.posture].sort((a: PostureDomainRecord, b: PostureDomainRecord) =>
    a.domain.localeCompare(b.domain),
  );
  if (postureRows.length === 0) draw("No posture domains recorded.");
  for (const row of postureRows) {
    draw(
      `${row.label}: ${row.rag.toUpperCase()} - ${row.note} (verified by ${nameOf(row.setBy)}, ${formatLondon(row.setAt)})`,
    );
  }
  y -= 6;

  draw("Statutory clocks", { bold: true, size: 12 });
  const clockRows = doc.clocks.filter((c) => !c.test).sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1));
  if (clockRows.length === 0) draw("No statutory clocks recorded.");
  for (const clock of clockRows) {
    const status = clock.closedAt ? `Closed ${formatLondon(clock.closedAt)}` : "Active";
    const outcome = clock.outcome ? ` - ${clock.outcome}` : "";
    draw(
      `${clockReference(clock)} (${clock.kind}): started ${formatLondon(clock.startedAt)}, due ${formatLondon(clock.dueAt)}, ${status}${outcome}`,
    );
  }
  y -= 6;

  draw("Policy register (latest approved)", { bold: true, size: 12 });
  const policyRows = latestApprovedPolicies(doc);
  if (policyRows.length === 0) draw("No approved policies.");
  for (const p of policyRows) {
    const approvedAt = p.approvedAt ? formatLondon(p.approvedAt) : " - ";
    draw(`${p.code} ${p.title} - v${p.version}, approved by ${nameOf(p.approvedBy)} on ${approvedAt}`);
  }

  return pdf.save();
}

function formatLondon(iso: string): string {
  return DateTime.fromISO(iso, { zone: LONDON }).toFormat("dd MMM yyyy, HH:mm");
}

function wrap(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}
