// API service for audit trail management
const API_BASE_URL = "/api/superadmin/elections";

export interface AuditUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface AuditEntry {
  id: string;
  user_id: string;
  election_id: string | null;
  action: string;
  metadata: Record<string, any>;
  timestamp: string;
  user: AuditUser;
}

export interface AuditTrailResponse {
  auditEntries: AuditEntry[];
}

export const auditApi = {
  // Get audit trail for an election
  getAuditTrail: async (electionId: string): Promise<AuditEntry[]> => {
    // Try superadmin endpoint first (for superadmin users)
    try {
      const response = await fetch(`${API_BASE_URL}/${electionId}/audit`);
      if (response.ok) {
        const data: AuditTrailResponse = await response.json();
        return data.auditEntries;
      }
    } catch (error) {
      // Fall back to admin endpoint if superadmin fails
      console.warn("Superadmin audit endpoint failed, trying admin endpoint");
    }

    // Try admin endpoint (for admin users)
    try {
      // Get current user to determine admin ID
      const userResponse = await fetch("/api/auth/session");
      const session = await userResponse.json();
      const adminId = session?.user?.id;

      if (adminId) {
        const response = await fetch(
          `/api/admin/${adminId}/election/${electionId}/audit`
        );
        if (response.ok) {
          const data: AuditTrailResponse = await response.json();
          return data.auditEntries;
        }
      }
    } catch (error) {
      console.warn("Admin audit endpoint failed");
    }

    throw new Error(
      "Failed to fetch audit trail from both superadmin and admin endpoints"
    );
  },
};
