import { z } from "zod";

export const roleSchema = z.enum(["client", "mitmark_admin"]);
export type Role = z.infer<typeof roleSchema>;

export const ragStatusSchema = z.enum(["green", "amber", "red"]);
export type RagStatus = z.infer<typeof ragStatusSchema>;

export const policyStatusSchema = z.enum(["draft", "approved"]);
export type PolicyStatus = z.infer<typeof policyStatusSchema>;

export const chatSenderSchema = z.enum(["user", "guide", "officer"]);
export type ChatSender = z.infer<typeof chatSenderSchema>;

export const escalationStateSchema = z.enum(["open", "answered", "closed"]);
export type EscalationState = z.infer<typeof escalationStateSchema>;

export const intakeTypeSchema = z.enum(["sar", "breach"]);
export type IntakeType = z.infer<typeof intakeTypeSchema>;

export const intakeSourceSchema = z.enum(["chat", "manual"]);
export type IntakeSource = z.infer<typeof intakeSourceSchema>;

export const clockKindSchema = z.enum(["sar_1_month", "breach_72h"]);
export type ClockKind = z.infer<typeof clockKindSchema>;

export const postureDomainSchema = z.enum([
  "policies",
  "training",
  "access_reviews",
  "retention",
  "ropa",
]);
export type PostureDomain = z.infer<typeof postureDomainSchema>;

export const alertStateSchema = z.enum(["new", "triaged", "actioned", "dismissed"]);
export type AlertState = z.infer<typeof alertStateSchema>;

export const reviewItemTypeSchema = z.enum([
  "chat_amber",
  "export_request",
  "alert",
  "intake",
  "task_confirmation",
]);
export type ReviewItemType = z.infer<typeof reviewItemTypeSchema>;

export const reviewItemStateSchema = z.enum(["pending", "approved", "rejected"]);
export type ReviewItemState = z.infer<typeof reviewItemStateSchema>;

export const exportStateSchema = z.enum(["requested", "approved", "generated"]);
export type ExportState = z.infer<typeof exportStateSchema>;
