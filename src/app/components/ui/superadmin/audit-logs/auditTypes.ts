export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  userEmail: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export interface FilterOptions {
  actions: string[];
  entityTypes: string[];
  dateRange: {
    from: string;
    to: string;
  };
  users: string[];
}
