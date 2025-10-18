export interface AuditLog {
  id: string;
  user_id: string; // Maps to Users table
  election_id?: string; // Maps to Elections table (optional)
  action: string;
  metadata: Record<string, any>; // JSON field in Prisma
  timestamp: string; // ISO string, maps to DateTime in Prisma
  // UI-specific fields (computed from user relation)
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

// Mock Audit Logs Data
export const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    user_id: "student-12345", // Changed from actor_id
    election_id: "1",
    action: "VOTE_CAST",
    timestamp: "2024-03-15T14:35:22Z",
    metadata: {
      election_title: "Student Union Executive Elections 2024",
      portfolios_voted: ["President", "Vice President"],
      vote_hash: "0x1a2b3c4d5e6f",
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
      portfolio: "Engineering Faculty Rep",
      election_title: "Faculty Representative Elections",
    },
    ip_address: "172.16.0.23",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "MEDIUM",
  },
  {
    id: "audit-005",
    user_id: "approver-001",
    timestamp: "2024-03-15T11:15:20Z",
    action: "ELECTION_APPROVED",
    actor_name: "Dean Robert Johnson",
    actor_role: "APPROVER",
    target_type: "ELECTION",
    target_id: "4",
    details: "Graduate Student Council Elections approved for scheduling",
    metadata: {
      previous_status: "PENDING_APPROVAL",
      new_status: "APPROVED",
      approval_notes: "All requirements met, approved for May scheduling",
    },
    ip_address: "10.0.0.45",
    user_agent:
      "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    severity: "HIGH",
    election_id: "4",
  },
  {
    id: "audit-006",
    user_id: "unknown",
    timestamp: "2024-03-15T10:30:12Z",
    action: "FAILED_LOGIN_ATTEMPT",
    actor_name: "Unknown User",
    actor_role: "UNKNOWN",
    target_type: "SYSTEM",
    target_id: "auth-system",
    details: "Failed login attempt with invalid credentials",
    metadata: {
      email_attempted: "fake.admin@university.edu",
      failure_reason: "invalid_credentials",
      attempts_count: 3,
    },
    ip_address: "203.45.67.89",
    user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    severity: "MEDIUM",
    election_id: undefined,
  },
  {
    id: "audit-007",
    user_id: "system",
    timestamp: "2024-03-15T09:45:30Z",
    action: "SYSTEM_BACKUP_COMPLETED",
    actor_name: "Automated System",
    actor_role: "SYSTEM",
    target_type: "SYSTEM",
    target_id: "backup-service",
    details: "Daily system backup completed successfully",
    metadata: {
      backup_size: "2.4GB",
      backup_location: "s3://uni-evoting-backups/2024-03-15/",
      tables_backed_up: ["elections", "votes", "users", "audit_logs"],
      duration_seconds: 145,
    },
    ip_address: "127.0.0.1",
    user_agent: "System/1.0",
    severity: "LOW",
    election_id: undefined,
  },
  {
    id: "audit-008",
    user_id: "admin-001",
    timestamp: "2024-03-14T16:22:18Z",
    action: "PORTFOLIO_MODIFIED",
    actor_name: "Dr. Sarah Williams",
    actor_role: "SUPER_ADMIN",
    target_type: "PORTFOLIO",
    target_id: "p1",
    details: "Portfolio description updated for President position",
    metadata: {
      portfolio_name: "President",
      field_changed: "description",
      old_value: "Lead the student union",
      new_value: "Lead the student union and represent all students",
    },
    ip_address: "10.0.0.15",
    user_agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    severity: "LOW",
    election_id: "1",
  },
  {
    id: "audit-009",
    user_id: "orchestrator-001",
    timestamp: "2024-03-14T15:10:55Z",
    action: "BULK_VOTE_VERIFICATION",
    actor_name: "IT Manager Kevin Brown",
    actor_role: "ORCHESTRATOR",
    target_type: "SYSTEM",
    target_id: "vote-verification",
    details: "Bulk verification of votes completed for closed election",
    metadata: {
      election_title: "Class Representative Elections - Year 1",
      total_votes_verified: 945,
      invalid_votes_found: 0,
      verification_method: "cryptographic_hash",
    },
    ip_address: "10.0.0.30",
    user_agent: "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
    severity: "HIGH",
    election_id: "3",
  },
  {
    id: "audit-010",
    user_id: "admin-001",
    timestamp: "2024-03-14T14:35:42Z",
    action: "USER_PERMISSIONS_MODIFIED",
    actor_name: "Dr. Sarah Williams",
    actor_role: "SUPER_ADMIN",
    target_type: "USER",
    target_id: "admin-005",
    details: "User permissions modified - account deactivated",
    metadata: {
      target_user_name: "Dr. Patricia Miller",
      action_taken: "account_deactivation",
      reason: "Extended leave of absence",
      permissions_removed: ["CREATE_ELECTION", "EDIT_ELECTION", "VIEW_RESULTS"],
    },
    ip_address: "10.0.0.15",
    user_agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    severity: "MEDIUM",
    election_id: undefined,
  },
  {
    id: "audit-011",
    user_id: "admin-004",
    timestamp: "2024-03-14T13:20:15Z",
    action: "ELECTION_CREATED",
    actor_name: "Mr. David Rodriguez",
    actor_role: "ELECTION_ADMIN",
    target_type: "ELECTION",
    target_id: "5",
    details: "New election created: Sports Club Leadership Elections",
    metadata: {
      election_title: "Sports Club Leadership Elections",
      start_time: "2024-06-01T09:00:00Z",
      end_time: "2024-06-02T17:00:00Z",
      expected_voters: 320,
    },
    ip_address: "172.16.0.18",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "MEDIUM",
    election_id: "5",
  },
  {
    id: "audit-012",
    user_id: "system",
    timestamp: "2024-03-14T12:45:30Z",
    action: "SUSPICIOUS_ACTIVITY_DETECTED",
    actor_name: "Security Monitor",
    actor_role: "SYSTEM",
    target_type: "SYSTEM",
    target_id: "security-monitor",
    details: "Multiple rapid login attempts detected from same IP",
    metadata: {
      ip_address: "185.234.72.45",
      attempts_count: 15,
      time_window_minutes: 5,
      accounts_targeted: ["admin-001", "admin-002", "approver-001"],
      action_taken: "ip_temporarily_blocked",
    },
    ip_address: "185.234.72.45",
    user_agent: "Various",
    severity: "CRITICAL",
    election_id: undefined,
  },
];

// Helper functions for audit logs
export const getAuditLogsByElection = (electionId: string): AuditLog[] => {
  return mockAuditLogs.filter((log) => log.election_id === electionId);
};

export const getAuditLogsByActor = (userId: string): AuditLog[] => {
  return mockAuditLogs.filter((log) => log.user_id === userId);
};

export const getAuditLogsByAction = (action: string): AuditLog[] => {
  return mockAuditLogs.filter((log) => log.action === action);
};

export const getAuditLogsBySeverity = (
  severity: AuditLog["severity"]
): AuditLog[] => {
  return mockAuditLogs.filter((log) => log.severity === severity);
};

export const getAuditLogsInDateRange = (
  startDate: string,
  endDate: string
): AuditLog[] => {
  return mockAuditLogs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= new Date(startDate) && logDate <= new Date(endDate);
  });
};

export const getRecentAuditLogs = (limit: number = 50): AuditLog[] => {
  return mockAuditLogs
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
};
