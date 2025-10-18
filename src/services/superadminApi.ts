import { apiClient } from "./apiClient";
import { IndividualElectionAnalytics } from "@/app/components/ui/superadmin/analytics/individual/individualElectionTypes";

export interface Election {
  id: string;
  title: string;
  description: string | null;
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "LIVE"
    | "CLOSED"
    | "ARCHIVED";
  is_general: boolean;
  department: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by: string | null;
  creator: {
    full_name: string;
    email: string;
  };
  approver?: {
    full_name: string;
    email: string;
  };
  portfolios: Portfolio[];
  _count: {
    votes: number;
    candidates: number;
    portfolios: number;
  };
}

export interface Portfolio {
  id: string;
  title: string;
  description?: string;
  election_id: string;
  created_at: string;
  candidates: Candidate[];
}

export interface Candidate {
  id: string;
  election_id: string;
  portfolio_id: string;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  created_at: string;
}

export interface ElectionWithDetails extends Election {
  candidates: Candidate[];
}

export interface DashboardData {
  overview: {
    totalElections: number;
    activeElections: number;
    completedElections: number;
    pendingElections: number;
    draftElections: number;
    totalVotes: number;
    totalUsers: number;
    totalAdmins: number;
    totalPortfolios: number;
    totalCandidates: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    type: string;
    user: string;
  }>;
  upcomingElections: Array<{
    id: string;
    title: string;
    start_time: string;
    status: string;
  }>;
  systemHealth: {
    status: string;
    uptime: string;
    activeUsers: number;
    systemLoad: number;
    databaseConnections: number;
    pendingInvitations: number;
  };
}

export const superadminApi = {
  // Elections
  async getElections(): Promise<Election[]> {
    const response = await apiClient.get("/superadmin/elections");
    return response.data.data;
  },

  async getElectionById(id: string): Promise<ElectionWithDetails> {
    const response = await apiClient.get(`/superadmin/elections/${id}`);
    return response.data.data;
  },

  async createElection(
    electionData: Omit<
      Partial<Election>,
      "created_by" | "id" | "created_at" | "updated_at"
    >
  ): Promise<Election> {
    const response = await apiClient.post(
      "/superadmin/elections",
      electionData
    );
    return response.data.data;
  },

  async updateElection(
    id: string,
    electionData: Partial<Election>
  ): Promise<Election> {
    const response = await apiClient.put(
      `/superadmin/elections/${id}`,
      electionData
    );
    return response.data.data;
  },

  async deleteElection(id: string): Promise<void> {
    await apiClient.delete(`/superadmin/elections/${id}`);
  },

  // Dashboard
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get("/superadmin/dashboard");
    return response.data.data;
  },

  // Analytics
  async getAnalytics(): Promise<any> {
    const response = await apiClient.get("/superadmin/analytics");
    return response.data; // General analytics returns data directly
  },

  async getElectionAnalytics(electionId: string): Promise<any> {
    const response = await apiClient.get(
      `/superadmin/elections/${electionId}/analytics`
    );
    return response.data.data; // Individual election analytics wraps in { success, data }
  },

  // Individual Election Analytics - New dedicated endpoint
  async getIndividualElectionAnalytics(
    electionId: string
  ): Promise<IndividualElectionAnalytics> {
    const response = await apiClient.get(
      `/superadmin/elections/${electionId}/individual-analytics`
    );
    return response.data.data;
  },
};
