// Analytics types based on Prisma schema

export interface AnalyticsData {
  id: string;
  election_id: string;
  portfolio_id: string;
  candidate_id: string;
  votes_count: number;
  percentage: number;
  updated_at: string;
  election: Election;
  portfolio: Portfolio;
  candidate: Candidate;
}

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
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by: string | null;
  creator_name?: string;
}

export interface Portfolio {
  id: string;
  election_id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  portfolio_id: string;
  full_name: string;
  photo_url: string | null;
  manifesto: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  election_id: string;
  portfolio_id: string;
  candidate_id: string;
  cast_at: string;
}

export interface VoterToken {
  id: string;
  user_id: string;
  election_id: string;
  otp: string;
  used: boolean;
  issued_at: string;
  used_at: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  election_id: string | null;
  action: string;
  metadata: any;
  timestamp: string;
}

// Analytics summary interfaces
export interface ElectionSummary {
  election: Election;
  totalVotes: number;
  totalVoters: number;
  turnoutPercentage: number;
  portfoliosCount: number;
  candidatesCount: number;
  status: string;
}

export interface OverallAnalyticsSummary {
  totalElections: number;
  activeElections: number;
  completedElections: number;
  totalVotes: number;
  totalVoters: number;
  averageTurnout: number;
  recentElections: ElectionSummary[];
}

export interface PortfolioAnalytics {
  portfolio: Portfolio;
  totalVotes: number;
  candidates: CandidateAnalytics[];
}

export interface CandidateAnalytics {
  candidate: Candidate;
  votesCount: number;
  percentage: number;
  rank: number;
}

export interface VotingTrend {
  date: string;
  votes: number;
  cumulative: number;
}

export interface TurnoutAnalytics {
  totalEligibleVoters: number;
  totalVotes: number;
  turnoutPercentage: number;
  hourlyTrends: {
    hour: string;
    votes: number;
  }[];
}

// Mock data for development
export const mockElections: Election[] = [
  {
    id: "election-001",
    title: "Student Council Presidential Election 2025",
    description:
      "Annual election for Student Council President and Vice President positions",
    status: "LIVE",
    start_time: "2025-09-10T09:00:00Z",
    end_time: "2025-09-12T17:00:00Z",
    created_at: "2025-09-01T10:30:00Z",
    updated_at: "2025-09-10T09:00:00Z",
    created_by: "superadmin-001",
    approved_by: "approver-001",
    creator_name: "Super Admin",
  },
  {
    id: "election-002",
    title: "Computer Science Department Rep Election",
    description:
      "Election for Computer Science Department Student Representative",
    status: "CLOSED",
    start_time: "2025-08-20T08:00:00Z",
    end_time: "2025-08-21T18:00:00Z",
    created_at: "2025-08-15T15:45:00Z",
    updated_at: "2025-08-21T18:00:00Z",
    created_by: "superadmin-001",
    approved_by: "approver-001",
    creator_name: "Super Admin",
  },
  {
    id: "election-003",
    title: "Business Administration Society Executive Election",
    description:
      "Annual election for Business Administration Society executive positions",
    status: "APPROVED",
    start_time: "2025-10-05T10:00:00Z",
    end_time: "2025-10-07T16:00:00Z",
    created_at: "2025-09-05T09:20:00Z",
    updated_at: "2025-09-06T14:20:00Z",
    created_by: "superadmin-001",
    approved_by: "approver-001",
    creator_name: "Super Admin",
  },
];

export const mockPortfolios: Portfolio[] = [
  {
    id: "portfolio-001",
    election_id: "election-001",
    title: "President",
    description: "Student Council President position",
    created_at: "2025-09-01T11:00:00Z",
  },
  {
    id: "portfolio-002",
    election_id: "election-001",
    title: "Vice President",
    description: "Student Council Vice President position",
    created_at: "2025-09-01T11:00:00Z",
  },
  {
    id: "portfolio-003",
    election_id: "election-002",
    title: "Department Representative",
    description: "Computer Science Department Representative",
    created_at: "2025-08-15T16:00:00Z",
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "candidate-001",
    election_id: "election-001",
    portfolio_id: "portfolio-001",
    full_name: "John Doe",
    photo_url: null,
    manifesto: "A vision for better student representation",
    created_at: "2025-09-02T10:00:00Z",
  },
  {
    id: "candidate-002",
    election_id: "election-001",
    portfolio_id: "portfolio-001",
    full_name: "Jane Smith",
    photo_url: null,
    manifesto: "Leading change for all students",
    created_at: "2025-09-02T10:15:00Z",
  },
  {
    id: "candidate-003",
    election_id: "election-001",
    portfolio_id: "portfolio-002",
    full_name: "Mike Johnson",
    photo_url: null,
    manifesto: "Supporting the president's vision",
    created_at: "2025-09-02T10:30:00Z",
  },
];

export const mockAnalyticsData: AnalyticsData[] = [
  {
    id: "analytics-001",
    election_id: "election-001",
    portfolio_id: "portfolio-001",
    candidate_id: "candidate-001",
    votes_count: 450,
    percentage: 55.5,
    updated_at: "2025-09-10T16:00:00Z",
    election: mockElections[0],
    portfolio: mockPortfolios[0],
    candidate: mockCandidates[0],
  },
  {
    id: "analytics-002",
    election_id: "election-001",
    portfolio_id: "portfolio-001",
    candidate_id: "candidate-002",
    votes_count: 360,
    percentage: 44.5,
    updated_at: "2025-09-10T16:00:00Z",
    election: mockElections[0],
    portfolio: mockPortfolios[0],
    candidate: mockCandidates[1],
  },
];
