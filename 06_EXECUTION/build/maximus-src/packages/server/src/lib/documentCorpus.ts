/**
 * v1.7 (FRAGO 07 3.5). The per-document corpus: building it at upload and in
 * the migration, and reading it back for Quick questions.
 */

import type { DocumentRecord, OrgDoc } from "../db/model.ts";
import { readCorpusBlob, readDocumentBlob, writeCorpusBlob } from "../db/store.ts";
import { isLiveDocument } from "./documents.ts";
import { extractText, type ExtractedCorpus } from "./extract.ts";

export interface CorpusOutcome {
  searchable: "yes" | "no";
  searchNote: string;
  sections: number;
}

/**
 * Extract a filed file's text and store it beside the document. Returns what
 * to write on the record. A failure is logged with the document id and the
 * reason only, never the text.
 */
export async function buildCorpusFor(orgId: string, record: DocumentRecord, bytes?: Uint8Array): Promise<CorpusOutcome | null> {
  if (record.kind !== "file") return null;
  const data = bytes ?? (await readDocumentBlob(orgId, record.id));
  if (!data) {
    console.log(JSON.stringify({ evt: "corpus_extract", documentId: record.id, ok: false, reason: "file missing" }));
    return { searchable: "no", searchNote: "The stored file could not be found.", sections: 0 };
  }
  const result = await extractText({
    documentId: record.id,
    title: record.title,
    fileName: record.fileName,
    contentType: record.contentType,
    bytes: data,
  });
  if (!result.ok) {
    console.log(JSON.stringify({ evt: "corpus_extract", documentId: record.id, ok: false, reason: result.reason }));
    return { searchable: "no", searchNote: result.reason, sections: 0 };
  }
  await writeCorpusBlob(orgId, record.id, JSON.stringify(result.corpus));
  console.log(
    JSON.stringify({ evt: "corpus_extract", documentId: record.id, ok: true, sections: result.corpus.sections.length, bytes: result.bytes }),
  );
  return {
    searchable: "yes",
    searchNote: result.corpus.truncated ? "Text cut at the 200 KB cap." : "",
    sections: result.corpus.sections.length,
  };
}

/** The documents Quick questions reads: published procedures and trackers that are searchable. */
export function guideDocuments(doc: OrgDoc): DocumentRecord[] {
  return doc.documents.filter(
    (d) =>
      isLiveDocument(d) &&
      d.kind === "file" &&
      d.searchable === "yes" &&
      (d.section === "procedures" || d.section === "trackers"),
  );
}

/** Read the stored corpora for those documents. A missing or unreadable blob is skipped. */
export async function loadDocumentCorpora(doc: OrgDoc): Promise<{ record: DocumentRecord; corpus: ExtractedCorpus }[]> {
  const out: { record: DocumentRecord; corpus: ExtractedCorpus }[] = [];
  for (const record of guideDocuments(doc)) {
    const raw = await readCorpusBlob(doc.id, record.id);
    if (!raw) continue;
    try {
      out.push({ record, corpus: JSON.parse(raw) as ExtractedCorpus });
    } catch {
      // A corrupt blob is treated as absent; the document stays filed.
    }
  }
  return out;
}
