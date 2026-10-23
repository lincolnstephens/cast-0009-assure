import { describe, expect, it } from "vitest";
import { policyPack } from "../scripts/policyPack.ts";
import type { CorpusSection } from "../src/lib/guide/corpus.ts";
import { enforce, parseRawResult } from "../src/lib/guide/enforce.ts";
import { askStub } from "../src/lib/guide/stub.ts";

/** The real seeded corpus, flattened (ids/versions faked - not under test). */
const corpus: CorpusSection[] = policyPack.flatMap((p, pi) =>
  p.sections.map((s) => ({
    sourceKind: "policy" as const,
    policyId: `policy-${pi}`,
    policyCode: p.code,
    policyTitle: p.title,
    policyVersion: 1,
    sectionRef: s.sectionRef,
    heading: s.heading,
    body: s.bodyMarkdown,
  })),
);

describe("parseRawResult", () => {
  it("parses bare JSON", () => {
    const raw = parseRawResult('{"status":"green","answer":"x","citations":[],"intake":null}');
    expect(raw?.status).toBe("green");
  });

  it("parses fenced JSON and prefixed prose", () => {
    expect(
      parseRawResult('```json\n{"status":"amber","answer":"x"}\n```')?.status,
    ).toBe("amber");
    expect(
      parseRawResult('Here you go: {"status":"red","answer":"", "intake":{"type":"sar","summary":"s"}}')
        ?.intake?.type,
    ).toBe("sar");
  });

  it("returns null on garbage (route treats as amber)", () => {
    expect(parseRawResult("I cannot answer that")).toBeNull();
    expect(parseRawResult('{"status":"purple"}')).toBeNull();
  });
});

describe("enforce - never trust the model", () => {
  it("parse failure becomes amber", () => {
    expect(enforce(null, corpus).status).toBe("amber");
  });

  it("green with zero citations downgrades to amber", () => {
    const out = enforce(
      { status: "green", answer: "Sure!", citations: [], intake: null },
      corpus,
    );
    expect(out.status).toBe("amber");
  });

  it("invented citations are stripped; if none survive, green downgrades", () => {
    const out = enforce(
      {
        status: "green",
        answer: "Sure!",
        citations: [{ policy_code: "XX-99", section_ref: "1", heading: "Fake" }],
        intake: null,
      },
      corpus,
    );
    expect(out.status).toBe("amber");
    expect(out.citations).toHaveLength(0);
  });

  it("valid citations survive and are stamped with policy id + version", () => {
    const out = enforce(
      {
        status: "green",
        answer: "Covered by DP-01.",
        citations: [
          { policy_code: "dp-01", section_ref: "5", heading: "" },
          { policy_code: "XX-99", section_ref: "1", heading: "Fake" },
        ],
        intake: null,
      },
      corpus,
    );
    expect(out.status).toBe("green");
    expect(out.citations).toHaveLength(1);
    expect(out.citations[0]).toMatchObject({
      policyCode: "DP-01",
      sectionRef: "5",
      policyVersion: 1,
    });
    expect(out.citations[0].policyId).toBeTruthy();
    expect(out.citations[0].heading).toBe("Sharing with letting agents and contractors");
  });

  it("intake present forces red, even if the model said green", () => {
    const out = enforce(
      {
        status: "green",
        answer: "All fine.",
        citations: [],
        intake: { type: "breach", summary: "Lost laptop" },
      },
      corpus,
    );
    expect(out.status).toBe("red");
    expect(out.intake?.type).toBe("breach");
  });

  it("red without an intake becomes amber (nothing statutory to start)", () => {
    const out = enforce(
      { status: "red", answer: "", citations: [], intake: null },
      corpus,
    );
    expect(out.status).toBe("amber");
  });
});

describe("stub - three demo behaviours, deterministic", () => {
  const Q1 = "Can I share the tenant contact list with our letting agent?";
  const Q2 = "A tenant wants to put their own camera in the communal hallway - is that allowed?";
  const Q3 = "A former employee has emailed asking for everything we hold on them";

  it("demo question 1 → green citing DP-01", () => {
    const out = askStub(corpus, Q1);
    expect(out.status).toBe("green");
    expect(out.citations[0]?.policy_code).toBe("DP-01");
    expect(out.citations[0]?.section_ref).toBe("5");
  });

  it("demo question 2 → amber", () => {
    const out = askStub(corpus, Q2);
    expect(out.status).toBe("amber");
    expect(out.intake).toBeNull();
  });

  it("demo question 3 → red with a SAR intake", () => {
    const out = askStub(corpus, Q3);
    expect(out.status).toBe("red");
    expect(out.intake?.type).toBe("sar");
  });

  it("breach descriptions → red with a breach intake", () => {
    const out = askStub(corpus, "I think my work laptop was stolen from the car last night");
    expect(out.status).toBe("red");
    expect(out.intake?.type).toBe("breach");
  });

  it("is deterministic across repeated calls", () => {
    for (const q of [Q1, Q2, Q3]) {
      expect(askStub(corpus, q)).toEqual(askStub(corpus, q));
    }
  });
});
