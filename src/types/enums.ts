// Election Status Enum (matches Prisma schema)
export enum ElectionStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  LIVE = "LIVE",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED",
}

// Voter Category Enum for reports
export enum VoterCategory {
  ACTIVE_VOTERS = "ACTIVE_VOTERS",
  PENDING_VOTERS = "PENDING_VOTERS",
  VERIFIED_VOTERS = "VERIFIED_VOTERS",
  UNVERIFIED_VOTERS = "UNVERIFIED_VOTERS",
}

// Audit Action Enum (re-export from audit-utils for convenience)
export { AUDIT_ACTIONS } from "@/libs/audit-utils";
export type { AuditAction } from "@/libs/audit-utils";
