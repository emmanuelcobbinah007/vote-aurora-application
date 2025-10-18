// API service for analytics and results management
const API_BASE_URL = "/api/superadmin/elections";

export interface CandidatePerformance {
  name: string;
  portfolio: string;
  votes: number;
  percentage: number;
  demographics: {
    year1: number;
    year2: number;
    year3: number;
    year4: number;
  };
}

export interface PortfolioDistribution {
  name: string;
  votes: number;
  percentage: number;
}

export interface VoterDemographics {
  category: string;
  count: number;
  percentage: number;
}

export interface HourlyVotingTrend {
  hour: string;
  votes: number;
}

export interface ElectionInfo {
  id: string;
  title: string;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface AnalyticsData {
  election: ElectionInfo;
  totalVotes: number;
  totalVoters: number;
  turnoutPercentage: number;
  portfoliosCount: number;
  candidatesCount: number;
  status: string;
  portfolioDistribution: PortfolioDistribution[];
  hourlyVotingTrends: HourlyVotingTrend[];
  voterDemographics: VoterDemographics[];
  candidatePerformance: CandidatePerformance[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

export const analyticsApi = {
  // Get analytics data for an election
  getAnalytics: async (electionId: string): Promise<AnalyticsData> => {
    // Try superadmin endpoint first (for superadmin users)
    try {
      const response = await fetch(`${API_BASE_URL}/${electionId}/analytics`);
      if (response.ok) {
        const data: AnalyticsResponse = await response.json();
        return data.data;
      }
    } catch (error) {
      // Fall back to admin endpoint if superadmin fails
      console.warn(
        "Superadmin analytics endpoint failed, trying admin endpoint"
      );
    }

    // Try admin endpoint (for admin users)
    try {
      // Get current user to determine admin ID
      const userResponse = await fetch("/api/auth/session");
      const session = await userResponse.json();
      const adminId = session?.user?.id;

      if (adminId) {
        const response = await fetch(
          `/api/admin/${adminId}/election/${electionId}/analytics`
        );
        if (response.ok) {
          const data: AnalyticsResponse = await response.json();
          return data.data;
        }
      }
    } catch (error) {
      console.warn("Admin analytics endpoint failed");
    }

    throw new Error(
      "Failed to fetch analytics from both superadmin and admin endpoints"
    );
  },
};
