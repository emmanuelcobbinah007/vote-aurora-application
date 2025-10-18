// Import unified types from data layer
import {
  Election,
  Portfolio,
  Candidate,
  Ballot,
  ElectionWithDetails,
} from "@/data";

// Re-export for backward compatibility
export type { Election, Portfolio, Candidate, Ballot, ElectionWithDetails };

// Tab-specific types for Election Details system
export type ElectionTab =
  | "overview"
  | "portfolios"
  | "candidates"
  | "ballot-setup"
  | "audit-results";

// Additional types specific to Election Details components
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
  details: string;
  timestamp: string;
}

// Form data types
export interface PortfolioFormData {
  title: string;
  description?: string;
}

export interface CandidateFormData {
  full_name: string;
  photo_url?: string;
  manifesto?: string;
}

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
