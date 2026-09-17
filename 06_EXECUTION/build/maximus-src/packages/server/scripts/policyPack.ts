/**
 * The generic six-policy pack (spec §7): Data Protection, Information
 * Security, CCTV, SAR Procedure, Data Retention Schedule and Acceptable Use,
 * written for a generic property-management organisation.
 *
 * This file carries no client name, real or fictional — only generic
 * organisational language ("the organisation", "we", "our"). A previous,
 * client-branded version of this file was deliberately left behind when this
 * job ported the build; this is a fresh replacement.
 *
 * Each policy is authored as a preamble plus numbered sections (the shape the
 * Policy Guide's corpus and the admin/client panels expect); `seedPolicyPack`
 * renders that into the single `bodyMarkdown` field the store persists (see
 * `lib/policies.ts`, `renderPolicyDocument`).
 */

import type { OrgDoc, PolicyRecord } from "../src/db/model.ts";
import { newId } from "../src/db/store.ts";
import { renderPolicyDocument } from "../src/lib/policies.ts";

export interface PolicyPackSection {
  sectionRef: string;
  heading: string;
  bodyMarkdown: string;
}

export interface PolicyPackEntry {
  code: string;
  title: string;
  /** Preamble shown above the numbered sections. */
  bodyMarkdown: string;
  sections: PolicyPackSection[];
}

export const policyPack: PolicyPackEntry[] = [
  {
    code: "DP-01",
    title: "Data Protection Policy",
    bodyMarkdown:
      "This policy sets out how the organisation collects, uses, shares and protects personal data belonging to tenants, prospective tenants, staff and contacts, in line with data protection law.",
    sections: [
      {
        sectionRef: "1",
        heading: "Purpose and who this covers",
        bodyMarkdown:
          "This policy applies to everyone who processes personal data on behalf of the organisation, including employees, contractors and appointed agents. It covers personal data about tenants, prospective tenants, leaseholders, visitors and staff.",
      },
      {
        sectionRef: "2",
        heading: "What personal data we hold",
        bodyMarkdown:
          "We hold contact details, tenancy and payment records, correspondence, and where relevant identification documents and references. We do not collect more personal data than we need for property management, letting and compliance purposes.",
      },
      {
        sectionRef: "3",
        heading: "Lawful basis for processing",
        bodyMarkdown:
          "We process personal data under a tenancy agreement, a legal obligation, or our legitimate interests in managing the property safely and lawfully. Where none of these apply we ask for consent before processing.",
      },
      {
        sectionRef: "4",
        heading: "Keeping data secure",
        bodyMarkdown:
          "Personal data is stored on access-controlled systems. Paper records are kept in locked storage. Access is limited to staff and contractors who need it to do their job. See the Information Security Policy (IS-01) for detail.",
      },
      {
        sectionRef: "5",
        heading: "Sharing with letting agents and contractors",
        bodyMarkdown:
          "We may share tenant contact details, including name, phone number and email address, with our appointed letting agent and other contractors who need that information to manage the property or respond to a tenant's request. Before we share a tenant's contact list or other personal details with a letting agent or contractor, we confirm the sharing is necessary and covered by our privacy notice. We do not share more than the letting agent needs, and we keep a record of what was shared and with whom.",
      },
      {
        sectionRef: "6",
        heading: "Subject access requests",
        bodyMarkdown:
          "Anyone can ask what personal data we hold about them. Requests are handled under the Subject Access Request Procedure (SAR-01), which sets out the statutory one-month timescale.",
      },
      {
        sectionRef: "7",
        heading: "Data breaches",
        bodyMarkdown:
          "A suspected or actual loss, theft or unauthorised disclosure of personal data must be reported to the compliance officer immediately. See the Information Security Policy (IS-01) for the breach assessment process.",
      },
    ],
  },
  {
    code: "IS-01",
    title: "Information Security Policy",
    bodyMarkdown:
      "This policy sets out how the organisation protects the confidentiality, integrity and availability of the information it holds, including personal data.",
    sections: [
      {
        sectionRef: "1",
        heading: "Purpose",
        bodyMarkdown:
          "This policy applies to all systems, devices and paper records used to store or process organisational information, and to everyone who uses them.",
      },
      {
        sectionRef: "2",
        heading: "Access control",
        bodyMarkdown:
          "Every system account is personal and password-protected. Access is granted on the basis of business need and reviewed periodically. Accounts are disabled promptly when someone leaves.",
      },
      {
        sectionRef: "3",
        heading: "Devices and remote working",
        bodyMarkdown:
          "Laptops and phones used for work must be encrypted and locked with a passcode. Devices must not be left unattended in public places. Lost or stolen devices must be reported immediately.",
      },
      {
        sectionRef: "4",
        heading: "Suspected or actual breaches",
        bodyMarkdown:
          "Anyone who suspects a security incident, such as a lost device, a misdirected email, unauthorised access or a suspicious message, must report it to the compliance officer straight away. A 72-hour assessment clock starts as soon as an incident is reported, in line with statutory breach notification timescales.",
      },
      {
        sectionRef: "5",
        heading: "Third-party systems and suppliers",
        bodyMarkdown:
          "Suppliers who process organisational information on our behalf must have a written agreement covering confidentiality and security. We review supplier access periodically.",
      },
      {
        sectionRef: "6",
        heading: "Passwords and authentication",
        bodyMarkdown:
          "Passwords must be unique and of reasonable length. Multi-factor authentication is used wherever the system supports it, particularly for email and finance systems.",
      },
    ],
  },
  {
    code: "CCTV-01",
    title: "CCTV Policy",
    bodyMarkdown:
      "This policy explains how the organisation uses CCTV in shared areas of the property, and the limits of what it covers.",
    sections: [
      {
        sectionRef: "1",
        heading: "Purpose and scope",
        bodyMarkdown:
          "This policy covers CCTV systems operated by the organisation in shared areas such as entrances, car parks, stairwells and other communal areas, used for safety and security purposes only. It does not cover, and takes no position on, recording devices installed by residents, contractors or other third parties in those areas or inside private accommodation.",
      },
      {
        sectionRef: "2",
        heading: "Signage",
        bodyMarkdown:
          "Clear signage is displayed wherever an organisation-operated camera is in use, so people know they are being recorded before they enter the area.",
      },
      {
        sectionRef: "3",
        heading: "Who can view footage",
        bodyMarkdown:
          "Footage from organisation-operated cameras may only be viewed by authorised staff investigating an incident, or shared with the police where the law requires it.",
      },
      {
        sectionRef: "4",
        heading: "Retention",
        bodyMarkdown:
          "Footage from organisation-operated cameras is kept for thirty days and then automatically deleted, unless it is needed for an ongoing investigation.",
      },
      {
        sectionRef: "5",
        heading: "Requests to see footage",
        bodyMarkdown:
          "A request to see footage that shows a particular person is handled as a subject access request under the Subject Access Request Procedure (SAR-01).",
      },
      {
        sectionRef: "6",
        heading: "Recording devices installed by residents or third parties",
        bodyMarkdown:
          "This policy governs only cameras that the organisation itself operates. It does not set out whether a resident or a third party may install their own recording device in a shared area; that question needs a judgement from the compliance officer, who will weigh the interests of other residents before responding.",
      },
    ],
  },
  {
    code: "SAR-01",
    title: "Subject Access Request Procedure",
    bodyMarkdown:
      "This procedure explains how the organisation responds when someone asks what personal data it holds about them.",
    sections: [
      {
        sectionRef: "1",
        heading: "What counts as a request",
        bodyMarkdown:
          "A subject access request is anyone asking, in any format, to see the personal data the organisation holds about them, or to have it corrected or deleted. It does not need to use any particular words or form.",
      },
      {
        sectionRef: "2",
        heading: "The one-month statutory clock",
        bodyMarkdown:
          "We must respond within one calendar month of receiving the request. The compliance officer opens a case and starts the statutory clock as soon as a request is identified, whether it arrives by letter, email, the client portal or verbally.",
      },
      {
        sectionRef: "3",
        heading: "Verifying identity",
        bodyMarkdown:
          "Before releasing personal data we take reasonable steps to confirm the identity of the person asking, to avoid disclosing information to the wrong person.",
      },
      {
        sectionRef: "4",
        heading: "What we provide",
        bodyMarkdown:
          "We provide a copy of the personal data held, together with an explanation of what it is used for, who it is shared with, and how long it is kept.",
      },
      {
        sectionRef: "5",
        heading: "Requests from former tenants, staff and former employees",
        bodyMarkdown:
          "A request from a former tenant or a former employee is handled in exactly the same way as a request from someone with a current relationship with the organisation. The one-month statutory clock applies equally.",
      },
      {
        sectionRef: "6",
        heading: "Exemptions and redaction",
        bodyMarkdown:
          "Information about other people is removed or redacted before disclosure, unless the other person consents or it is reasonable to disclose it without consent.",
      },
    ],
  },
  {
    code: "RET-01",
    title: "Data Retention Schedule",
    bodyMarkdown:
      "This schedule sets out how long the organisation keeps different types of records, and how they are disposed of once no longer needed.",
    sections: [
      {
        sectionRef: "1",
        heading: "Principle",
        bodyMarkdown:
          "Records are kept only as long as there is a business or legal reason to keep them, and are then securely destroyed or permanently deleted.",
      },
      {
        sectionRef: "2",
        heading: "Tenancy records",
        bodyMarkdown:
          "Tenancy agreements and related correspondence are kept for six years after a tenancy ends, to cover the usual limitation period for a contractual claim.",
      },
      {
        sectionRef: "3",
        heading: "Financial records",
        bodyMarkdown:
          "Rent, invoices and payment records are kept for six years, in line with statutory accounting and tax requirements.",
      },
      {
        sectionRef: "4",
        heading: "Recruitment records",
        bodyMarkdown:
          "Applications from unsuccessful candidates are kept for six months and then deleted, unless the candidate agrees to a longer period.",
      },
      {
        sectionRef: "5",
        heading: "CCTV footage",
        bodyMarkdown:
          "Footage from organisation-operated CCTV cameras is kept for thirty days and then automatically deleted, as set out in the CCTV Policy (CCTV-01).",
      },
      {
        sectionRef: "6",
        heading: "Secure disposal",
        bodyMarkdown:
          "Paper records are shredded and electronic records are permanently deleted, including from backups, once the retention period ends.",
      },
    ],
  },
  {
    code: "AU-01",
    title: "Acceptable Use Policy",
    bodyMarkdown:
      "This policy sets out the standards expected when using organisational systems, devices and communication tools.",
    sections: [
      {
        sectionRef: "1",
        heading: "General standards",
        bodyMarkdown:
          "Organisational systems must be used responsibly and lawfully, and not in a way that could damage the organisation's reputation or compromise the security of its information.",
      },
      {
        sectionRef: "2",
        heading: "Email and messaging",
        bodyMarkdown:
          "Check the recipient carefully before sending an email that contains personal data. A message sent to the wrong recipient is a security incident and must be reported straight away.",
      },
      {
        sectionRef: "3",
        heading: "Personal use",
        bodyMarkdown:
          "Reasonable personal use of organisational systems is permitted provided it does not interfere with work, use excessive resources, or involve unlawful or inappropriate material.",
      },
      {
        sectionRef: "4",
        heading: "Software and downloads",
        bodyMarkdown:
          "Only software approved by the organisation may be installed on organisational devices, to reduce the risk of malware and unsupported systems.",
      },
      {
        sectionRef: "5",
        heading: "Monitoring",
        bodyMarkdown:
          "The organisation may monitor use of its systems for security and compliance purposes, proportionately and in line with this policy and the Information Security Policy (IS-01).",
      },
    ],
  },
];

/**
 * Seed the six generic policies into an organisation document as approved
 * version 1, idempotently: a code that already exists is left untouched, so
 * calling this again regenerates only what is missing.
 */
export function seedPolicyPack(doc: OrgDoc, approvedBy: string, now: Date = new Date()): PolicyRecord[] {
  const approvedAt = now.toISOString();
  const created: PolicyRecord[] = [];
  for (const entry of policyPack) {
    if (doc.policies.some((p) => p.code === entry.code)) continue;
    const policy: PolicyRecord = {
      id: newId(),
      orgId: doc.id,
      code: entry.code,
      title: entry.title,
      version: 1,
      status: "approved",
      bodyMarkdown: renderPolicyDocument(entry.bodyMarkdown, entry.sections),
      approvedBy,
      approvedAt,
      createdAt: approvedAt,
    };
    doc.policies.push(policy);
    created.push(policy);
  }
  return created;
}
