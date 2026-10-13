/**
 * v1.7 (FRAGO 07 3.5). Text extraction for Quick questions.
 *
 * At upload, and once as a migration for every document already filed, the
 * text of a .docx, .xlsx or text-bearing .pdf is pulled out into sections and
 * stored beside the document (store.ts, corpus/). Links are never read. A
 * failure is not an error to the uploader: the document is filed as normal and
 * marked "not searchable" on the operator's side.
 *
 * .docx and .xlsx are zip files of XML and are read with jszip, which the
 * server already carries for the defence file, so they cost no new
 * dependency. A .pdf is read with the pure-JS pdf.js that pdf-parse ships,
 * loaded only when a PDF arrives.
 */

import JSZip from "jszip";

/** One passage Quick questions can cite: the document, a section within it, and its text. */
export interface ExtractedSection {
  /** "1", "2", ... in document order. Stable for a given file. */
  ref: string;
  heading: string;
  text: string;
}

export interface ExtractedCorpus {
  version: 1;
  documentId: string;
  extractedAt: string;
  sections: ExtractedSection[];
  /** True when the text was cut at the cap. */
  truncated: boolean;
}

export type ExtractResult =
  | { ok: true; corpus: ExtractedCorpus; bytes: number }
  | { ok: false; reason: string };

/** FRAGO 07 section 4: corpus text per document is capped at 200 KB. */
export const CORPUS_MAX_BYTES = 200 * 1024;

const DOCX = /wordprocessingml|\.docx$/i;
const XLSX = /spreadsheetml|\.xlsx$/i;
const PDF = /application\/pdf|\.pdf$/i;

/** Whether a stored file is a kind the extractor reads at all. */
export function extractableKind(contentType: string, fileName: string): "docx" | "xlsx" | "pdf" | null {
  const probe = `${contentType} ${fileName}`;
  if (DOCX.test(probe)) return "docx";
  if (XLSX.test(probe)) return "xlsx";
  if (PDF.test(probe)) return "pdf";
  return null;
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

const tidy = (s: string) => s.replace(/[ \t ]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();

/**
 * A .docx: paragraphs from word/document.xml, split into sections at each
 * heading paragraph (a Heading or Title style). Text before the first heading
 * is its own section, headed by the document title. Table cells are read as
 * paragraphs.
 */
async function extractDocx(bytes: Uint8Array, title: string): Promise<ExtractedSection[]> {
  const zip = await JSZip.loadAsync(bytes);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("No document body in the file.");
  const xml = await file.async("string");

  // A heading is known by its style, and a style id is not always its name
  // (a document written in another language, or with house styles, has ids
  // like "Ttulo1" or "MMHeading"). The styles part names each style and may
  // give it an outline level; either marks it a heading.
  const headingStyles = new Set<string>();
  const stylesFile = zip.file("word/styles.xml");
  if (stylesFile) {
    const stylesXml = await stylesFile.async("string");
    for (const st of stylesXml.match(/<w:style [\s\S]*?<\/w:style>/g) ?? []) {
      const id = /w:styleId="([^"]+)"/.exec(st)?.[1];
      const name = /<w:name w:val="([^"]+)"/.exec(st)?.[1] ?? "";
      if (id && (/^(heading \d|title)$/i.test(name) || /<w:outlineLvl w:val="[0-8]"/.test(st))) headingStyles.add(id);
    }
  }

  const sections: { heading: string; lines: string[] }[] = [{ heading: title, lines: [] }];
  const paragraphs = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? [];
  for (const p of paragraphs) {
    const text = decodeXml(
      (p.match(/<w:t(?: [^>]*)?>[\s\S]*?<\/w:t>|<w:tab\/>|<w:br\/>/g) ?? [])
        .map((r) => (r.startsWith("<w:t") && !r.startsWith("<w:tab") ? r.replace(/<[^>]+>/g, "") : " "))
        .join(""),
    ).trim();
    if (!text) continue;
    const style = /<w:pStyle w:val="([^"]+)"/.exec(p)?.[1] ?? "";
    const outline = /<w:outlineLvl w:val="[0-8]"/.test(p);
    if (headingStyles.has(style) || outline || /^(heading|title)/i.test(style)) {
      sections.push({ heading: text, lines: [] });
    } else {
      sections[sections.length - 1].lines.push(text);
    }
  }
  // A document whose headings are only bold body text has no heading to
  // split on. It is cut into parts of about PART_CHARS at paragraph
  // boundaries, so a citation still points somewhere smaller than the whole.
  const split = sections.flatMap((s) => {
    const size = s.lines.reduce((a, l) => a + l.length + 1, 0);
    if (size <= PART_CHARS * 1.5) return [s];
    const parts: { heading: string; lines: string[] }[] = [];
    let current: string[] = [];
    let used = 0;
    for (const line of s.lines) {
      if (used + line.length > PART_CHARS && current.length) {
        parts.push({ heading: `${s.heading}, part ${parts.length + 1}`, lines: current });
        current = [];
        used = 0;
      }
      current.push(line);
      used += line.length + 1;
    }
    if (current.length) parts.push({ heading: `${s.heading}, part ${parts.length + 1}`, lines: current });
    return parts;
  });

  return split
    .filter((s) => s.lines.length > 0)
    .map((s, i) => ({ ref: String(i + 1), heading: s.heading, text: tidy(s.lines.join("\n")) }));
}

/** The size of a part when a long stretch of a .docx has no heading to split on. */
const PART_CHARS = 2000;

/** A .xlsx: one section per worksheet, each row as its cells joined with " | ". */
async function extractXlsx(bytes: Uint8Array): Promise<ExtractedSection[]> {
  const zip = await JSZip.loadAsync(bytes);
  const shared: string[] = [];
  const sst = zip.file("xl/sharedStrings.xml");
  if (sst) {
    const xml = await sst.async("string");
    for (const si of xml.match(/<si>[\s\S]*?<\/si>/g) ?? []) {
      shared.push(decodeXml((si.match(/<t(?: [^>]*)?>[\s\S]*?<\/t>/g) ?? []).map((t) => t.replace(/<[^>]+>/g, "")).join("")));
    }
  }

  // Sheet names, in workbook order, against their part paths.
  const names = new Map<string, string>();
  const wb = zip.file("xl/workbook.xml");
  const rels = zip.file("xl/_rels/workbook.xml.rels");
  if (wb && rels) {
    const wbXml = await wb.async("string");
    const relXml = await rels.async("string");
    const target = new Map<string, string>();
    for (const r of relXml.match(/<Relationship [^>]+>/g) ?? []) {
      const id = /Id="([^"]+)"/.exec(r)?.[1];
      const t = /Target="([^"]+)"/.exec(r)?.[1];
      if (id && t) target.set(id, t.replace(/^\/?xl\//, "").replace(/^\//, ""));
    }
    for (const s of wbXml.match(/<sheet [^>]+>/g) ?? []) {
      const name = decodeXml(/name="([^"]+)"/.exec(s)?.[1] ?? "");
      const rid = /r:id="([^"]+)"/.exec(s)?.[1] ?? "";
      const t = target.get(rid);
      if (t) names.set(`xl/${t}`, name);
    }
  }

  const sheetPaths = Object.keys(zip.files)
    .filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/.test(p))
    .sort((a, b) => Number(/(\d+)\.xml$/.exec(a)?.[1]) - Number(/(\d+)\.xml$/.exec(b)?.[1]));

  const sections: ExtractedSection[] = [];
  for (const path of sheetPaths) {
    const xml = await zip.file(path)!.async("string");
    const rows: string[] = [];
    for (const row of xml.match(/<row[ >][\s\S]*?<\/row>/g) ?? []) {
      const cells: string[] = [];
      for (const cell of row.match(/<c [^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) ?? []) {
        const type = /\bt="([^"]+)"/.exec(cell)?.[1];
        let value = "";
        if (type === "s") {
          const idx = Number(/<v>([\s\S]*?)<\/v>/.exec(cell)?.[1]);
          value = Number.isInteger(idx) ? (shared[idx] ?? "") : "";
        } else if (type === "inlineStr") {
          value = decodeXml((cell.match(/<t(?: [^>]*)?>[\s\S]*?<\/t>/g) ?? []).map((t) => t.replace(/<[^>]+>/g, "")).join(""));
        } else {
          value = decodeXml(/<v>([\s\S]*?)<\/v>/.exec(cell)?.[1] ?? "");
        }
        value = value.trim();
        if (value) cells.push(value);
      }
      if (cells.length) rows.push(cells.join(" | "));
    }
    if (rows.length) {
      sections.push({
        ref: String(sections.length + 1),
        heading: names.get(path) || `Sheet ${sections.length + 1}`,
        text: tidy(rows.join("\n")),
      });
    }
  }
  return sections;
}

/** A .pdf: one section per page, where the page carries text. A scanned page has none. */
async function extractPdf(bytes: Uint8Array): Promise<ExtractedSection[]> {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const sections: ExtractedSection[] = [];
  for (let n = 1; n <= doc.numPages; n += 1) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const text = tidy(content.items.map((i: { str?: string }) => i.str ?? "").join(" "));
    if (text) sections.push({ ref: String(n), heading: `Page ${n}`, text });
  }
  await doc.destroy?.();
  return sections;
}

interface PdfJs {
  getDocument(src: { data: Uint8Array }): {
    promise: Promise<{
      numPages: number;
      getPage(n: number): Promise<{ getTextContent(): Promise<{ items: { str?: string }[] }> }>;
      destroy?: () => Promise<void>;
    }>;
  };
}

/**
 * pdf.js, the build pdf-parse carries. Loaded on demand so a deployment
 * without it still files and searches .docx and .xlsx; a PDF then comes back
 * "not searchable" with the reason, which is the order's stated fallback.
 */
async function loadPdfJs(): Promise<PdfJs> {
  try {
    const spec = "pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js";
    const mod = (await import(/* @vite-ignore */ spec)) as { default?: PdfJs } & PdfJs;
    return (mod.default ?? mod) as PdfJs;
  } catch {
    throw new Error("PDF reading is not available on this deployment.");
  }
}

/** Cut the sections at the 200 KB cap, keeping whole sections where possible. */
function capSections(sections: ExtractedSection[]): { sections: ExtractedSection[]; truncated: boolean } {
  const out: ExtractedSection[] = [];
  let used = 0;
  for (const s of sections) {
    const size = Buffer.byteLength(s.heading + s.text, "utf8");
    if (used + size <= CORPUS_MAX_BYTES) {
      out.push(s);
      used += size;
      continue;
    }
    const room = CORPUS_MAX_BYTES - used - Buffer.byteLength(s.heading, "utf8");
    if (room > 200) {
      out.push({ ...s, text: Buffer.from(s.text, "utf8").subarray(0, room).toString("utf8").replace(/�+$/, "") });
    }
    return { sections: out, truncated: true };
  }
  return { sections: out, truncated: false };
}

/** Extract a stored file's text. Never throws: a failure comes back with its reason. */
export async function extractText(input: {
  documentId: string;
  title: string;
  fileName: string;
  contentType: string;
  bytes: Uint8Array;
}): Promise<ExtractResult> {
  const kind = extractableKind(input.contentType, input.fileName);
  if (!kind) return { ok: false, reason: "Only .docx, .xlsx and .pdf files are read." };
  try {
    const raw =
      kind === "docx"
        ? await extractDocx(input.bytes, input.title)
        : kind === "xlsx"
          ? await extractXlsx(input.bytes)
          : await extractPdf(input.bytes);
    if (raw.length === 0) {
      return { ok: false, reason: kind === "pdf" ? "The PDF carries no text (it may be a scan)." : "No text was found in the file." };
    }
    const { sections, truncated } = capSections(raw);
    const corpus: ExtractedCorpus = {
      version: 1,
      documentId: input.documentId,
      extractedAt: new Date().toISOString(),
      sections,
      truncated,
    };
    return { ok: true, corpus, bytes: Buffer.byteLength(JSON.stringify(corpus), "utf8") };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message.slice(0, 200) : "The file could not be read." };
  }
}
