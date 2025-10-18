import axios from "axios";
import { RecentActivity } from "./activityHelpers";

export interface DashboardStats {
  orchestrators: number;
  totalElections: number;
  totalVoters: number;
  totalCandidates: number;
  recentActivity: number;
  pendingInvitations: number;
  activeElections: number;
  completedElections: number;
  approverStatus: "active" | "inactive";
  superadminStatus: "active" | "inactive";
}

const DEFAULT_STATS: DashboardStats = {
  orchestrators: 0,
  totalElections: 0,
  totalVoters: 0,
  totalCandidates: 0,
  recentActivity: 0,
  pendingInvitations: 0,
  activeElections: 0,
  completedElections: 0,
  approverStatus: "inactive",
  superadminStatus: "inactive",
};

export const fetchDashboardStats = async (
  orchestratorId: string
): Promise<DashboardStats> => {
  try {
    const statsResponse = await axios.get(
      `/api/dashboard/stats?orchestratorId=${orchestratorId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      return {
        orchestrators: stats.totalOrchestrators || 0,
        totalElections: stats.totalElections || 0,
        totalVoters: stats.totalVoters || 0,
        totalCandidates: stats.totalCandidates || 0,
        recentActivity: stats.recentActivity || 0,
        pendingInvitations: stats.pendingInvitations || 0,
        activeElections: stats.activeElections || 0,
        completedElections: stats.completedElections || 0,
        approverStatus: stats.totalElections > 0 ? "active" : "inactive",
        superadminStatus: stats.recentActivity > 0 ? "active" : "inactive",
      };
    }

    console.warn("API returned success: false", statsResponse.data);
    return DEFAULT_STATS;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API error (${error.response?.status || "unknown"}):`,
        error.response?.data || error.message
      );
    } else {
      console.error("Error fetching dashboard stats:", error);
    }
    return DEFAULT_STATS;
  }
};

export const fetchRecentActivity = async (
  orchestratorId: string
): Promise<RecentActivity[]> => {
  try {
    const response = await axios.get(
      `/api/audit-trail?limit=5${
        orchestratorId ? `&userId=${orchestratorId}` : ""
      }`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.logs) {
      console.error("Invalid response from audit trail API:", response.data);
      return [];
    }

    // Transform the API response to match our RecentActivity interface
    return response.data.logs.map((log: any) => ({
      id: log.id,
      user_id: log.userId,
      election_id: log.entityId,
      action: log.action,
      metadata: log.metadata || {},
      timestamp: log.timestamp,
    }));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};
