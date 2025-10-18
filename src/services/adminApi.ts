import { apiClient } from "./apiClient";

// Domain types to replace string-heavy function arguments
type AdminId = string & { readonly __brand: unique symbol };
type ElectionId = string & { readonly __brand: unique symbol };
type CandidateId = string & { readonly __brand: unique symbol };
type PortfolioId = string & { readonly __brand: unique symbol };
type AssignmentId = string & { readonly __brand: unique symbol };

// Domain type factory for validation
class AdminApiIdFactory {
  static createAdminId(id: string): AdminId {
    if (!id || id.trim().length === 0) {
      throw new Error('AdminId cannot be empty');
    }
    return id.trim() as AdminId;
  }

  static createElectionId(id: string): ElectionId {
    if (!id || id.trim().length === 0) {
      throw new Error('ElectionId cannot be empty');
    }
    return id.trim() as ElectionId;
  }

  static createCandidateId(id: string): CandidateId {
    if (!id || id.trim().length === 0) {
      throw new Error('CandidateId cannot be empty');
    }
    return id.trim() as CandidateId;
  }

  static createPortfolioId(id: string): PortfolioId {
    if (!id || id.trim().length === 0) {
      throw new Error('PortfolioId cannot be empty');
    }
    return id.trim() as PortfolioId;
  }
}

// Email domain type
type AdminEmail = string & { readonly __brand: unique symbol };

class AdminEmailFactory {
  static create(email: string): AdminEmail {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    return email.trim().toLowerCase() as AdminEmail;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export interface Admin {
  id: string;
  full_name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  created_at: string;
  updated_at: string;
  last_login: string | null;
  assignments_count: number;
}

export interface CandidateFormData {
  full_name: string;
  photo_url?: string;
  manifesto?: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  portfolio_id: string;
  full_name: string;
  photo_url?: string | null;
  manifesto?: string | null;
  created_at?: string;
  portfolio?: {
    id: string;
    title: string;
  };
  _count?: {
    votes: number;
  };
}

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface UpdateAdminProfileData {
  full_name?: string;
  email?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface AssignedElection {
  id: string;
  title: string;
  description?: string;
  status: string;
  is_general: boolean;
  department?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  portfolios?: any[];
  candidates?: any[];
  assignment?: {
    assigned_at: string;
    assigned_by: string;
  };
}

export interface AdminReportsData {
  election: any;
  overview: any;
  candidatePerformance: any[];
  votingProgress: any;
  voterEngagement: any;
  auditLogs: any[];
  ballotIntegrity: any;
}

export interface AdminAnalyticsData {
  election: any;
  summary: any;
  trends: any;
  demographics: any;
  performance: any;
}

export interface AdminAssignment {
  assignment_id: string;
  assigned_at: string;
  admin: {
    id: string;
    full_name: string;
    email: string;
    status: string;
    last_login: string | null;
  };
  assigned_by: {
    full_name: string;
    email: string;
  };
}

export interface ElectionAdmins {
  election: {
    id: string;
    title: string;
  };
  assignments: AdminAssignment[];
  count: number;
}

export interface InviteAdminData {
  email: string;
  full_name: string;
}

export interface CreateAssignmentData {
  admin_id: AdminId;
  election_id: ElectionId;
}

export const adminApi = {
  // Candidate Management with domain types
  async getCandidates(adminId: AdminId, electionId: ElectionId): Promise<Candidate[]> {
    const response = await apiClient.get(`/admin/${adminId}/election/${electionId}/candidate`);
    return response.data.candidates;
  },

  async getCandidate(adminId: AdminId, electionId: ElectionId, candidateId: CandidateId): Promise<Candidate> {
    const response = await apiClient.get(`/admin/${adminId}/election/${electionId}/candidate/${candidateId}`);
    return response.data;
  },

  async createCandidate(
    adminId: AdminId,
    electionId: ElectionId, 
    portfolioId: PortfolioId, 
    candidateData: CandidateFormData
  ): Promise<Candidate> {
    const response = await apiClient.post(`/admin/${adminId}/election/${electionId}/candidate`, {
      portfolio_id: portfolioId,
      ...candidateData,
    });
    return response.data.candidate;
  },

  async updateCandidate(
    adminId: AdminId,
    electionId: ElectionId,
    candidateId: CandidateId,
    candidateData: CandidateFormData & { portfolio_id?: PortfolioId }
  ): Promise<Candidate> {
    const response = await apiClient.put(
      `/admin/${adminId}/election/${electionId}/candidate/${candidateId}`,
      candidateData
    );
    return response.data.candidate;
  },

  async deleteCandidate(
    adminId: AdminId,
    electionId: ElectionId,
    candidateId: CandidateId
  ): Promise<void> {
    await apiClient.delete(
      `/admin/${adminId}/election/${electionId}/candidate/${candidateId}`
    );
  },

  // Get all admins
  async getAdmins(): Promise<Admin[]> {
    const response = await apiClient.get("/superadmin/admins");
    return response.data.data;
  },

  // Invite a new admin
  async inviteAdmin(adminData: InviteAdminData): Promise<any> {
    const response = await apiClient.post("/superadmin/admins", adminData);
    return response.data.data;
  },

  // Get all admin assignments
  async getAdminAssignments(): Promise<any[]> {
    const response = await apiClient.get("/superadmin/admin-assignments");
    return response.data.data;
  },

  // Create a new admin assignment
  async createAdminAssignment(assignmentData: CreateAssignmentData): Promise<any> {
    const response = await apiClient.post("/superadmin/admin-assignments", assignmentData);
    return response.data.data;
  },

  // Remove an admin assignment
  async removeAdminAssignment(assignmentId: AssignmentId): Promise<void> {
    await apiClient.delete(`/superadmin/admin-assignments/${assignmentId}`);
  },

  // Get admins for a specific election
  async getElectionAdmins(electionId: ElectionId): Promise<ElectionAdmins> {
    const response = await apiClient.get(`/superadmin/elections/${electionId}/admins`);
    return response.data.data;
  },

  // Get available admins for a specific election (not yet assigned)
  async getAvailableAdmins(electionId: ElectionId): Promise<Admin[]> {
    const response = await apiClient.get(`/superadmin/elections/${electionId}/available-admins`);
    return response.data.data.available_admins;
  },

  // Get admin dashboard data
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await apiClient.get("/superadmin/admin-dashboard");
    return response.data.data;
  },

  // Admin profile operations with domain types
  async getAdminProfile(adminId: AdminId): Promise<AdminProfile> {
    const response = await apiClient.get(`/admin/${adminId}/profile`);
    return response.data.data;
  },

  async updateAdminProfile(adminId: AdminId, profileData: UpdateAdminProfileData): Promise<AdminProfile> {
    const response = await apiClient.put(`/admin/${adminId}/profile`, profileData);
    return response.data.data;
  },

  async changeAdminPassword(adminId: AdminId, passwordData: ChangePasswordData): Promise<void> {
    await apiClient.put(`/admin/${adminId}/profile`, passwordData);
  },

  // Get admin's assigned election
  async getAssignedElection(adminId: AdminId): Promise<AssignedElection> {
    const response = await apiClient.get(`/admin/${adminId}/assigned-election`);
    return response.data;
  },

  // Get admin reports
  async getAdminReports(adminId: AdminId): Promise<AdminReportsData> {
    const response = await apiClient.get(`/admin/${adminId}/reports`);
    return response.data;
  },

  // Get admin analytics
  async getAdminAnalytics(adminId: AdminId): Promise<AdminAnalyticsData> {
    const response = await apiClient.get(`/admin/${adminId}/analytics`);
    return response.data;
  },

  // Bulk operations with domain types
  async bulkInviteAdmins(emails: AdminEmail[], full_names: string[]): Promise<BulkInviteResult> {
    const response = await apiClient.post("/superadmin/admins/bulk", {
      operation: "bulk_invite",
      emails,
      full_names,
    });
    return response.data.data;
  },

  async bulkSuspendAdmins(adminIds: AdminId[]): Promise<BulkOperationResult> {
    const response = await apiClient.post("/superadmin/admins/bulk", {
      operation: "bulk_suspend",
      adminIds,
    });
    return response.data.data;
  },

  async bulkActivateAdmins(adminIds: AdminId[]): Promise<BulkOperationResult> {
    const response = await apiClient.post("/superadmin/admins/bulk", {
      operation: "bulk_activate",
      adminIds,
    });
    return response.data.data;
  },

  async bulkDeleteAdmins(adminIds: AdminId[]): Promise<BulkDeleteResult> {
    const response = await apiClient.post("/superadmin/admins/bulk", {
      operation: "bulk_delete",
      adminIds,
    });
    return response.data.data;
  },

  // Helper methods to create domain types from raw strings
  createAdminId: AdminApiIdFactory.createAdminId,
  createElectionId: AdminApiIdFactory.createElectionId,
  createCandidateId: AdminApiIdFactory.createCandidateId,
  createPortfolioId: AdminApiIdFactory.createPortfolioId,
  createAdminEmail: AdminEmailFactory.create,
};

// Admin Dashboard Types
export interface AdminDashboardData {
  statistics: {
    totalAdmins: number;
    activeAdmins: number;
    totalAssignments: number;
    pendingInvitations: number;
  };
  recentAssignments: Array<{
    id: string;
    admin_name: string;
    admin_email: string;
    election_title: string;
    assigned_by: string;
    assigned_at: string;
  }>;
  recentInvitations: Array<{
    id: string;
    email: string;
    role: string;
    used: boolean;
    expires_at: string;
    created_at: string;
    invited_by: string;
  }>;
}

// Bulk Operations Types
export interface BulkInviteResult {
  successful_invitations: Array<{
    email: string;
    full_name: string;
    invitation_id: string;
    token: string;
    expires_at: string;
  }>;
  failed_invitations: Array<{
    email: string;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface BulkOperationResult {
  updated_count: number;
  message: string;
}

export interface BulkDeleteResult {
  deleted_assignments: number;
  deleted_users: number;
  message: string;
}