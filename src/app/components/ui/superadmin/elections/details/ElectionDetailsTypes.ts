// Import unified types from data layer
import { Election, Portfolio, Candidate, Ballot } from "@/data";

// Re-export for backward compatibility (these will be removed once all components are updated)
export type { Election, Portfolio, Candidate, Ballot };

export interface Vote {
  id: string;
  election_id: string;
  portfolio_id: string;
  candidate_id: string;
  cast_at: string;
}

export interface Analytics {
  id: string;
  election_id: string;
  portfolio_id: string;
  candidate_id: string;
  votes_count: number;
  percentage: number;
  updated_at: string;
}

export interface AuditEntry {
  id: string;
  user_id: string;
  election_id?: string;
  action: string;
  metadata: Record<string, any>;
  timestamp: string;
}

// Form data interfaces
export interface PortfolioFormData {
  title: string;
  description: string;
}

export interface CandidateFormData {
  full_name: string;
  photo_url?: string;
  manifesto?: string;
}

// Extended Election interface with relations
export interface ElectionWithDetails {
  id: string;
  title: string;
  description?: string;
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "LIVE"
    | "CLOSED"
    | "ARCHIVED";
  start_time: string;
  end_time: string;
  is_general: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by?: string;
  portfolios?: Portfolio[];
  candidates?: Candidate[];
  ballots?: Ballot[];
}

// Tab types for Election Details navigation
export type ElectionTab =
  | "overview"
  | "portfolios"
  | "candidates"
  | "ballot-setup"
  | "audit-results";

// Component prop interfaces
export interface ElectionDetailsProps {
  electionId: string;
}

export interface PortfolioListProps {
  electionId: string;
  portfolios: Portfolio[];
  onAddPortfolio: (portfolioData: PortfolioFormData) => void;
  onEditPortfolio: (
    portfolioId: string,
    portfolioData: PortfolioFormData
  ) => void;
  onDeletePortfolio: (portfolioId: string) => void;
}

export interface CandidateListProps {
  electionId: string;
  portfolios: Portfolio[];
  candidates: Candidate[];
  onAddCandidate: (
    portfolioId: string,
    candidateData: CandidateFormData
  ) => void;
  onEditCandidate: (
    candidateId: string,
    candidateData: CandidateFormData
  ) => void;
  onDeleteCandidate: (candidateId: string) => void;
}

export interface BallotSetupProps {
  electionId: string;
  portfolios: Portfolio[];
  candidates: Candidate[];
  ballots: Ballot[];
  onUpdateBallotOrder: (ballots: Ballot[]) => void;
}
