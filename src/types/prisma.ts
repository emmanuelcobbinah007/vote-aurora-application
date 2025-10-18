// Types that match the Prisma schema exactly
// These should be used throughout the application for type safety

export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: "VOTER" | "ADMIN" | "SUPERADMIN" | "APPROVER" | "ORCHESTRATOR";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  created_at: string;
  updated_at: string;
}

export interface Election {
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
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by?: string;
  is_general: boolean;
  department?: string;
}

export interface Portfolio {
  id: string;
  election_id: string;
  title: string;
  description?: string;
  created_at: string;
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

export interface Ballot {
  id: string;
  election_id: string;
  portfolio_id: string;
  ballot_order: number;
  created_at: string;
}

export interface VoterToken {
  id: string;
  user_id: string;
  election_id: string;
  otp: string;
  used: boolean;
  issued_at: string;
  used_at?: string;
}

export interface AdminAssignment {
  id: string;
  admin_id: string;
  election_id: string;
  assigned_by: string;
  created_at: string;
}

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

export interface AuditTrail {
  id: string;
  user_id: string;
  election_id?: string;
  action: string;
  metadata: any; // JSON
  timestamp: string;
}

export interface InvitationToken {
  id: string;
  email: string;
  token: string;
  role: "VOTER" | "ADMIN" | "SUPERADMIN" | "APPROVER" | "ORCHESTRATOR";
  expires_at: string;
  used: boolean;
  created_at: string;
  created_by?: string;
}

// Extended types with relations for UI purposes
export interface ElectionWithDetails extends Election {
  creator?: User;
  approver?: User;
  portfolios?: Portfolio[];
  candidates?: Candidate[];
  ballots?: Ballot[];
  votes?: Vote[];
  analytics?: Analytics[];
  adminAssignments?: AdminAssignment[];
}

export interface UserWithStats extends User {
  stats?: {
    total_elections_created: number;
    total_elections_approved: number;
    total_votes_processed: number;
    last_login: string;
  };
  assigned_elections?: string[];
}

// API Response types for consistent data fetching
export interface DashboardResponse {
  superadminId: string;
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
  }>;
  upcomingElections: Election[];
  systemHealth: {
    status: "healthy" | "warning" | "error";
    uptime: string;
    activeUsers: number;
    systemLoad: number;
    databaseConnections: number;
    pendingInvitations: number;
  };
}

export interface AnalyticsResponse {
  election: ElectionWithDetails;
  portfolios: Array<{
    id: string;
    title: string;
    candidates: Array<{
      id: string;
      name: string;
      votes: number;
      percentage: number;
    }>;
  }>;
  overallStats: {
    totalVotes: number;
    turnoutPercentage: number;
    completionRate: number;
  };
}

export interface ElectionsListResponse {
  elections: ElectionWithDetails[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: {
    status?: Election["status"];
    search?: string;
    created_by?: string;
  };
}

export interface AdminsListResponse {
  admins: UserWithStats[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: {
    role?: User["role"];
    status?: User["status"];
    search?: string;
  };
}
