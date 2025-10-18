// Core election interface
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: ElectionStatus;
  _count: {
    candidates: number;
    portfolios: number;
  };
}

// Election status enum
export type ElectionStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "LIVE"
  | "CLOSED"
  | "ARCHIVED";

// Portfolio statistics interface
export interface PortfolioStats {
  id: string;
  title: string;
  voteCount: number;
  participationRate: number;
}

// Hourly voting trends interface
export interface HourlyTrend {
  hour: string;
  votes: number;
}

// Election results interface
export interface ElectionResult {
  portfolioId: string;
  portfolioTitle: string;
  winner: {
    id: string;
    name: string;
    voteCount: number;
    votePercentage: number;
  };
  candidates: Array<{
    id: string;
    name: string;
    voteCount: number;
    votePercentage: number;
  }>;
}

// Final statistics for closed elections
export interface FinalStats {
  totalDuration: string;
  peakVotingHour: string;
  averageVotesPerHour: number;
}

// Base analytics data interface
export interface BaseAnalyticsData {
  totalVoters: number;
  totalVotes: number;
  participationRate: number;
  portfolioStats: PortfolioStats[];
}

// Live election analytics (extends base with real-time data)
export interface LiveAnalyticsData extends BaseAnalyticsData {
  hourlyTrends: HourlyTrend[];
}

// Closed election analytics (extends base with results and final stats)
export interface ClosedAnalyticsData extends BaseAnalyticsData {
  results: ElectionResult[];
  finalStats: FinalStats;
}

// Union type for all possible analytics data
export type AnalyticsData =
  | BaseAnalyticsData
  | LiveAnalyticsData
  | ClosedAnalyticsData;

// API response interface
export interface AnalyticsResponse {
  election: Election;
  analytics: AnalyticsData;
}

// Error response interface
export interface ErrorResponse {
  error: string;
  message: string;
}

// Component prop interfaces
export interface AnalyticsHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  status?: ElectionStatus;
}

export interface ErrorStatesProps {
  type: "no-election" | "analytics-error" | "no-data";
  onBack: () => void;
  onRetry?: () => void;
}

export interface DraftElectionViewProps {
  election: Election;
  onConfigureElection: () => void;
}

export interface LiveElectionViewProps {
  election: Election;
  analytics: LiveAnalyticsData;
}

export interface ClosedElectionViewProps {
  election: Election;
  analytics: ClosedAnalyticsData;
}

// Hook return types
export interface UseAnalyticsDataReturn {
  data: AnalyticsResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Utility type guards
export const isLiveAnalytics = (
  analytics: AnalyticsData
): analytics is LiveAnalyticsData => {
  return "hourlyTrends" in analytics;
};

export const isClosedAnalytics = (
  analytics: AnalyticsData
): analytics is ClosedAnalyticsData => {
  return "results" in analytics && "finalStats" in analytics;
};

// Status checking utilities
export const isDraftStatus = (status: ElectionStatus): boolean => {
  return ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(status);
};

export const isLiveStatus = (status: ElectionStatus): boolean => {
  return status === "LIVE";
};

export const isClosedStatus = (status: ElectionStatus): boolean => {
  return ["CLOSED", "ARCHIVED"].includes(status);
};
