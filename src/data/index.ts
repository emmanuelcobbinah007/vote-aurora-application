// Main data exports for easy importing
export * from "./elections";
export * from "./admins";
export * from "./audit-logs";
export * from "./departments";

// Re-export commonly used types and functions for convenience
export type {
  Election,
  Portfolio,
  Candidate,
  Ballot,
  ElectionWithDetails,
} from "./elections";

export type { ElectionAdmin, AdminStats } from "./admins";

export type { AuditLog } from "./audit-logs";

export type { Department } from "./departments";

// Re-export commonly used helper functions
export {
  getElectionWithDetails,
  getAllElectionsWithDetails,
} from "./elections";

export {
  getAdminWithStats,
  getAdminsByRole,
  getActiveAdmins,
  getAdminsByElection,
} from "./admins";

export {
  getAuditLogsByElection,
  getAuditLogsByActor,
  getRecentAuditLogs,
} from "./audit-logs";
