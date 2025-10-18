export interface AuditLog {
  id: string;
  user_id: string; // Maps to Users table (required in Prisma)
  election_id?: string; // Maps to Elections table (optional in Prisma)
  action: string; // Maps to action String in Prisma
  metadata: Record<string, any>; // Maps to metadata Json in Prisma
  timestamp: string; // Maps to timestamp DateTime in Prisma
  // UI-specific fields (computed from user relation or additional data)
  actor_name?: string;
  actor_role?: string;
  target_type?:
    | "ELECTION"
    | "USER"
    | "SYSTEM"
    | "VOTE"
    | "CANDIDATE"
    | "PORTFOLIO";
  target_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

// Mock Audit Logs Data - Fully aligned with Prisma AuditTrail schema
export const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    user_id: "student-12345",
    election_id: "1",
    action: "VOTE_CAST",
    timestamp: "2024-03-15T14:35:22Z",
    metadata: {
      election_title: "Student Union Executive Elections 2024",
      portfolios_voted: ["President", "Vice President"],
      vote_hash: "0x1a2b3c4d5e6f",
      ip_address: "192.168.1.45",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    // UI-specific fields
    actor_name: "Anonymous Student",
    actor_role: "VOTER",
    target_type: "VOTE",
    target_id: "vote-789",
    details: "Vote cast successfully in Student Union Executive Elections",
    ip_address: "192.168.1.45",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "LOW",
  },
  {
    id: "audit-002",
    user_id: "admin-001",
    election_id: "1",
    action: "ELECTION_STATUS_CHANGED",
    timestamp: "2024-03-15T14:00:00Z",
    metadata: {
      previous_status: "APPROVED",
      new_status: "LIVE",
      reason: "Scheduled start time reached",
      ip_address: "10.0.0.15",
      user_agent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    // UI-specific fields
    actor_name: "Dr. Sarah Williams",
    actor_role: "SUPERADMIN",
    target_type: "ELECTION",
    target_id: "1",
    details: "Election status changed from APPROVED to LIVE",
    ip_address: "10.0.0.15",
    user_agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    severity: "HIGH",
  },
  {
    id: "audit-003",
    user_id: "admin-002",
    action: "LOGIN_ATTEMPT",
    timestamp: "2024-03-15T13:45:30Z",
    metadata: {
      login_method: "email_password",
      session_id: "sess_abc123",
      two_factor_used: true,
      ip_address: "172.16.0.23",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      success: true,
    },
    // UI-specific fields
    actor_name: "Prof. Michael Thompson",
    actor_role: "ADMIN",
    target_type: "SYSTEM",
    target_id: "auth-system",
    details: "Successful login to admin dashboard",
    ip_address: "172.16.0.23",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "LOW",
  },
  {
    id: "audit-004",
    user_id: "admin-002",
    election_id: "2",
    action: "CANDIDATE_ADDED",
    timestamp: "2024-03-15T12:20:45Z",
    metadata: {
      candidate_name: "Dr. Alice Johnson",
      portfolio: "Computer Science Faculty Rep",
      candidate_id: "candidate-015",
      ip_address: "172.16.0.23",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    // UI-specific fields
    actor_name: "Prof. Michael Thompson",
    actor_role: "ADMIN",
    target_type: "CANDIDATE",
    target_id: "candidate-015",
    details: "New candidate added to Faculty Representative Elections",
    ip_address: "172.16.0.23",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "MEDIUM",
  },
  {
    id: "audit-005",
    user_id: "approver-001",
    election_id: "2",
    action: "ELECTION_APPROVED",
    timestamp: "2024-03-25T16:45:30Z",
    metadata: {
      approval_level: "FINAL",
      comments: "All documentation reviewed and approved",
      approval_date: "2024-03-25",
      ip_address: "10.0.0.8",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    // UI-specific fields
    actor_name: "Dean Robert Johnson",
    actor_role: "APPROVER",
    target_type: "ELECTION",
    target_id: "2",
    details: "Election approved for Faculty Representative Elections",
    ip_address: "10.0.0.8",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "HIGH",
  },
  {
    id: "audit-006",
    user_id: "system-001",
    action: "LOGIN_FAILED",
    timestamp: "2024-03-15T09:45:12Z",
    metadata: {
      attempted_email: "suspicious.user@external.com",
      failure_reason: "Invalid credentials",
      attempt_count: 5,
      locked: true,
      ip_address: "203.0.113.45",
      user_agent: "curl/7.68.0",
    },
    // UI-specific fields
    actor_name: "System",
    actor_role: "SYSTEM",
    target_type: "USER",
    target_id: "unknown",
    details:
      "Multiple failed login attempts detected, account temporarily locked",
    ip_address: "203.0.113.45",
    user_agent: "curl/7.68.0",
    severity: "CRITICAL",
  },
  {
    id: "audit-007",
    user_id: "system-001",
    action: "SYSTEM_BACKUP",
    timestamp: "2024-03-15T02:00:00Z",
    metadata: {
      backup_type: "SCHEDULED",
      backup_size: "2.4GB",
      backup_location: "/backups/20240315_020000",
      status: "SUCCESS",
      ip_address: "localhost",
      user_agent: "SystemCron/1.0",
    },
    // UI-specific fields
    actor_name: "System",
    actor_role: "SYSTEM",
    target_type: "SYSTEM",
    target_id: "backup-system",
    details: "Scheduled system backup completed successfully",
    ip_address: "localhost",
    user_agent: "SystemCron/1.0",
    severity: "LOW",
  },
  {
    id: "audit-008",
    user_id: "admin-001",
    action: "USER_ROLE_CHANGED",
    timestamp: "2024-03-10T11:30:45Z",
    metadata: {
      target_user: "admin-005",
      previous_role: "ADMIN",
      new_role: "INACTIVE",
      reason: "Temporary suspension pending review",
      ip_address: "10.0.0.5",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    // UI-specific fields
    actor_name: "Dr. Sarah Williams",
    actor_role: "SUPERADMIN",
    target_type: "USER",
    target_id: "admin-005",
    details: "User role changed from ADMIN to INACTIVE",
    ip_address: "10.0.0.5",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "HIGH",
  },
  {
    id: "audit-009",
    user_id: "orchestrator-001",
    election_id: "1",
    action: "ELECTION_STARTED",
    timestamp: "2024-03-15T09:00:00Z",
    metadata: {
      start_method: "AUTOMATED",
      total_eligible_voters: 2500,
      notification_sent: true,
      system_checks: "PASSED",
      ip_address: "10.0.0.15",
      user_agent: "Mozilla/5.0 (Linux; Ubuntu) AppleWebKit/537.36",
    },
    // UI-specific fields
    actor_name: "IT Manager Kevin Brown",
    actor_role: "ORCHESTRATOR",
    target_type: "ELECTION",
    target_id: "1",
    details:
      "Election officially started - Student Union Executive Elections 2024",
    ip_address: "10.0.0.15",
    user_agent: "Mozilla/5.0 (Linux; Ubuntu) AppleWebKit/537.36",
    severity: "HIGH",
  },
  {
    id: "audit-010",
    user_id: "admin-001",
    action: "ADMIN_CREATED",
    timestamp: "2024-02-28T14:15:20Z",
    metadata: {
      new_admin_name: "Dr. Patricia Miller",
      assigned_role: "ADMIN",
      permissions_granted: ["CREATE_ELECTION", "EDIT_ELECTION", "VIEW_RESULTS"],
      created_by: "admin-001",
      ip_address: "10.0.0.5",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    // UI-specific fields
    actor_name: "Dr. Sarah Williams",
    actor_role: "SUPERADMIN",
    target_type: "USER",
    target_id: "admin-005",
    details: "New admin account created for Dr. Patricia Miller",
    ip_address: "10.0.0.5",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "MEDIUM",
  },
];

// Helper function to get audit logs by election
export const getAuditLogsByElection = (electionId: string): AuditLog[] => {
  return mockAuditLogs.filter((log) => log.election_id === electionId);
};

// Helper function to get audit logs by user
export const getAuditLogsByActor = (userId: string): AuditLog[] => {
  return mockAuditLogs.filter((log) => log.user_id === userId);
};

// Helper function to get recent audit logs
export const getRecentAuditLogs = (limit: number = 10): AuditLog[] => {
  return mockAuditLogs
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
};
