import prisma from "./prisma";

export interface AuditLogData {
  userId: string;
  action: string;
  metadata?: any;
  electionId?: string;
}

export interface DetailedAuditLogData {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  electionId?: string;
}

/**
 * Create an audit trail entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditTrail.create({
      data: {
        user_id: data.userId,
        action: data.action,
        metadata: data.metadata || {},
        election_id: data.electionId || null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Common audit actions
 */
export const AUDIT_ACTIONS = {
  // User Management
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  USER_REGISTRATION: "USER_REGISTRATION",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET: "PASSWORD_RESET",

  // Invitation Management
  INVITATION_SENT: "INVITATION_SENT",
  INVITATION_ACCEPTED: "INVITATION_ACCEPTED",
  INVITATION_EXPIRED: "INVITATION_EXPIRED",

  // Account Creation
  ORCHESTRATOR_ACCOUNT_CREATED: "ORCHESTRATOR_ACCOUNT_CREATED",
  SUPERADMIN_ACCOUNT_CREATED: "SUPERADMIN_ACCOUNT_CREATED",
  APPROVER_ACCOUNT_cREATED: "APPROVER_ACCOUNT_CREATED",
  ADMIN_ACCOUNT_CREATED: "ADMIN_ACCOUNT_CREATED",
  ADMIN_ASSIGNED: "ADMIN_ASSIGNED",
  ADMIN_REASSIGNED: "ADMIN_REASSIGNED",

  // Election Management (for future use)
  ELECTION_CREATED: "ELECTION_CREATED",
  ELECTION_UPDATED: "ELECTION_UPDATED",
  ELECTION_STARTED: "ELECTION_STARTED",
  ELECTION_ENDED: "ELECTION_ENDED",
  ELECTION_DELETED: "ELECTION_DELETED",

  // Voting (for future use)
  VOTE_CAST: "VOTE_CAST",
  VOTE_UPDATED: "VOTE_UPDATED",

  // System Actions
  SYSTEM_BACKUP: "SYSTEM_BACKUP",
  SYSTEM_RESTORE: "SYSTEM_RESTORE",
  CONFIGURATION_CHANGE: "CONFIGURATION_CHANGE",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/**
 * Log an audit event with detailed information
 */
export async function logAuditEvent(data: DetailedAuditLogData): Promise<void> {
  return createAuditLog({
    userId: data.userId,
    action: data.action,
    electionId: data.electionId,
    metadata: {
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details,
    },
  });
}
