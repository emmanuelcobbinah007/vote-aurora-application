// TypeScript interfaces for Individual Election Analytics

export interface IndividualElectionAnalytics {
  election: ElectionDetails;
  metrics: ElectionMetrics;
  candidatePerformance: CandidatePerformance[];
  portfolioDistribution: PortfolioDistribution[];
  votingTimeline: VotingTimeline;
  assignedAdmins: AssignedAdmin[];
  portfolios: ElectionPortfolio[];
}

export interface ElectionDetails {
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
  isGeneral: boolean;
  department: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  creator: UserProfile;
  approver: UserProfile | null;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

export interface ElectionMetrics {
  totalVotes: number;
  totalEligibleVoters: number;
  usedTokens: number;
  turnoutPercentage: number;
  votingEfficiency: number;
  portfoliosCount: number;
  candidatesCount: number;
  assignedAdminsCount: number;
}

export interface CandidatePerformance {
  candidateId: string;
  candidateName: string;
  candidatePhoto: string | null;
  portfolioId: string;
  portfolioTitle: string;
  votes: number;
  percentage: number;
}

export interface PortfolioDistribution {
  portfolioId: string;
  portfolioTitle: string;
  portfolioDescription: string | null;
  votes: number;
  percentage: number;
  candidatesCount: number;
}

export interface VotingTimeline {
  hourlyVotes: TimelineDataPoint[];
  hourlyVoters: TimelineDataPoint[];
}

export interface TimelineDataPoint {
  hour: string;
  votes?: number;
  voters?: number;
}

export interface AssignedAdmin {
  id: string;
  admin: UserProfile;
  assignedBy: UserProfile;
  assignedAt: string;
}

export interface ElectionPortfolio {
  id: string;
  title: string;
  description: string | null;
  candidatesCount: number;
  candidates: CandidateProfile[];
}

export interface CandidateProfile {
  id: string;
  full_name: string;
  photo_url: string | null;
  manifesto: string | null;
}
