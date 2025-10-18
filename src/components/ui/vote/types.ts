export interface Candidate {
  id: string;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  title: string;
  description?: string;
  candidates: Candidate[];
  ballot_order: number;
}

export interface Election {
  id: string;
  title: string;
  description?: string;
  is_general: boolean;
  department?: string;
  end_time: string;
  positions: Portfolio[];
}

export interface BallotData {
  voter: {
    id: string;
    student_id: string;
    verified_at: string;
  };
  election: Election;
  session: any;
}

export interface VoteSelection {
  portfolio_id: string;
  candidate_id: string | null; // Allow null for "no" votes in single candidate portfolios
  portfolio_title: string;
  candidate_name: string;
}
