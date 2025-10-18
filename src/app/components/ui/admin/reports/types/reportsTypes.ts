// TypeScript interfaces for Admin Reports
export interface ReportElection {
  id: string;
  title: string;
  description?: string;
  status: ElectionStatus;
  is_general: boolean;
  department?: string;
  start_time: Date;
  end_time: Date;
  created_at: Date;
  _count: {
    portfolios: number;
    candidates: number;
    votes: number;
    voterTokens: number;
  };
}

export type ElectionStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "LIVE"
  | "CLOSED"
  | "ARCHIVED";

export interface Portfolio {
  id: string;
  title: string;
  description?: string;
  _count: {
    candidates: number;
    votes: number;
  };
  candidates: Candidate[];
}

export interface Candidate {
  id: string;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  portfolio_id: string;
  _count: {
    votes: number;
  };
  portfolio: {
    id: string;
    title: string;
  };
}

export interface VotingStats {
  totalVoters: number;
  totalVotes: number;
  distinctVotersWhoVoted: number;
  turnoutPercentage: number;
  votingRate: number; // votes per hour during active period
  portfolioParticipation: PortfolioParticipation[];
}

export interface PortfolioParticipation {
  portfolioId: string;
  portfolioTitle: string;
  votes: number;
  percentage: number;
  leading_candidate?: {
    id: string;
    name: string;
    votes: number;
  };
}

export interface VoterEngagement {
  hourlyVotingPattern: HourlyVoting[];
  peakVotingHour: string;
  voterDemographics: VoterDemographic[];
  participationByDepartment: DepartmentParticipation[];
}

export interface HourlyVoting {
  hour: string;
  votes: number;
  cumulative: number;
}

export interface VoterDemographic {
  category: string; // e.g., "Year 1", "Year 2", etc.
  count: number;
  percentage: number;
}

export interface DepartmentParticipation {
  department: string;
  eligible: number;
  voted: number;
  percentage: number;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, any>;
  timestamp: Date;
  user: {
    full_name: string;
    email: string;
    role: string;
  };
}

export interface BallotIntegrity {
  totalBallots: number;
  validVotes: number;
  duplicateAttempts: number;
  suspiciousActivity: SuspiciousActivity[];
  lastAuditTime: Date;
}

export interface SuspiciousActivity {
  type: "MULTIPLE_ATTEMPTS" | "INVALID_TOKEN" | "UNUSUAL_TIMING";
  description: string;
  timestamp: Date;
  details: Record<string, any>;
}

// API Response Types
export interface ReportsData {
  election: ReportElection;
  votingStats: VotingStats;
  portfolios: Portfolio[];
  candidates: Candidate[];
  voterEngagement: VoterEngagement;
  auditLogs: AuditLogEntry[];
  ballotIntegrity: BallotIntegrity;
}

export interface ReportsResponse {
  data: ReportsData;
  generatedAt: Date;
  adminId: string;
}

// Component Props
export interface ReportsHeaderProps {
  election: ReportElection;
  onBack: () => void;
  onExport: (format: ExportFormat) => void;
  onRefresh: () => void;
}

export interface ElectionOverviewProps {
  election: ReportElection;
  votingStats: VotingStats;
}

export interface VotingProgressProps {
  votingStats: VotingStats;
  portfolios: Portfolio[];
  isLive: boolean;
}

export interface CandidatePerformanceProps {
  candidates: Candidate[];
  portfolios: Portfolio[];
  totalVotes: number;
  showResults: boolean; // Hide results during live election
}

export interface VoterEngagementProps {
  engagement: VoterEngagement;
  totalVoters: number;
  distinctVotersWhoVoted: number;
}

export interface AuditSecurityProps {
  auditLogs: AuditLogEntry[];
  ballotIntegrity: BallotIntegrity;
  election: ReportElection;
}

export interface ExportControlsProps {
  onExport: (format: ExportFormat) => void;
  isExporting: boolean;
  availableFormats: ExportFormat[];
}

export type ExportFormat = "PDF" | "CSV" | "EXCEL" | "JSON";

// Hook return types
export interface UseReportsDataReturn {
  data: ReportsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

// Utility type guards
export const isElectionLive = (status: ElectionStatus): boolean => {
  return status === "LIVE";
};

export const isElectionClosed = (status: ElectionStatus): boolean => {
  return ["CLOSED", "ARCHIVED"].includes(status);
};

export const shouldShowResults = (status: ElectionStatus): boolean => {
  return isElectionClosed(status);
};

export const getElectionStatusColor = (status: ElectionStatus): string => {
  const colors = {
    DRAFT: "bg-gray-100 text-gray-800",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-blue-100 text-blue-800",
    LIVE: "bg-green-100 text-green-800",
    CLOSED: "bg-red-100 text-red-800",
    ARCHIVED: "bg-purple-100 text-purple-800",
  };
  return colors[status];
};
