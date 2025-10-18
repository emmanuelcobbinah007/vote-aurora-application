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
  dateFrom: string;
  dateTo: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
}

export const fetchAuditLogs = async (
  orchestratorId: string
): Promise<AuditLog[]> => {
  try {
    const response = await fetch("/api/audit-trail", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the API response to match the frontend interface
    return data.logs.map((log: any) => ({
      id: log.id,
      action: log.action,
      userId: log.userId,
      userName: log.userName,
      userEmail: log.userEmail,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details,
      ipAddress: null, // Not currently tracked in schema
      userAgent: null, // Not currently tracked in schema
      timestamp: log.timestamp,
    }));
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};
