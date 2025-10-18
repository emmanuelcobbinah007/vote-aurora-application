export interface Admin {
  id: string;
  full_name: string;
  email: string;
  role: "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  created_at: string;
  updated_at: string;
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
  // optional assignments returned by the server
  assignments?: AdminAssignment[];
  adminCount?: number;
}

export interface AdminAssignment {
  id: string;
  admin_id: string;
  election_id: string;
  assigned_by: string;
  created_at: string;
  admin: Admin;
  election: Election;
  assigner_name?: string;
}

export interface InvitationToken {
  id: string;
  email: string;
  token: string;
  role: "VOTER" | "ADMIN" | "SUPERADMIN" | "APPROVER" | "ORCHESTRATOR";
  expires_at: string;
  used: boolean;
  created_at: string;
  created_by: string | null;
}

// Mock data for development
export const mockElections: Election[] = [
  {
    id: "election-001",
    title: "Student Council Presidential Election 2025",
    description:
      "Annual election for Student Council President and Vice President positions",
    status: "DRAFT",
    start_time: "2025-10-15T09:00:00Z",
    end_time: "2025-10-17T17:00:00Z",
    created_at: "2025-09-01T10:30:00Z",
    updated_at: "2025-09-01T10:30:00Z",
    created_by: "superadmin-001",
    approved_by: null,
    creator_name: "Super Admin",
  },
  {
    id: "election-002",
    title: "Computer Science Department Rep Election",
    description:
      "Election for Computer Science Department Student Representative",
    status: "PENDING_APPROVAL",
    start_time: "2025-09-20T08:00:00Z",
    end_time: "2025-09-21T18:00:00Z",
    created_at: "2025-08-28T15:45:00Z",
    updated_at: "2025-08-28T15:45:00Z",
    created_by: "superadmin-001",
    approved_by: null,
    creator_name: "Super Admin",
  },
  {
    id: "election-003",
    title: "Business Administration Society Executive Election",
    description:
      "Annual election for Business Administration Society executive positions",
    status: "APPROVED",
    start_time: "2025-11-05T10:00:00Z",
    end_time: "2025-11-07T16:00:00Z",
    created_at: "2025-09-05T09:20:00Z",
    updated_at: "2025-09-05T14:20:00Z",
    created_by: "superadmin-001",
    approved_by: "approver-001",
    creator_name: "Super Admin",
  },
  {
    id: "election-004",
    title: "Engineering Faculty Board Election",
    description:
      "Election for student representatives on the Engineering Faculty Board",
    status: "LIVE",
    start_time: "2025-09-10T09:00:00Z",
    end_time: "2025-09-12T17:00:00Z",
    created_at: "2025-09-08T11:30:00Z",
    updated_at: "2025-09-10T09:00:00Z",
    created_by: "superadmin-001",
    approved_by: "approver-001",
    creator_name: "Super Admin",
  },
  {
    id: "election-005",
    title: "Arts & Humanities Club Leadership Election",
    description: "Election for Arts & Humanities Club leadership positions",
    status: "CLOSED",
    start_time: "2025-08-25T08:30:00Z",
    end_time: "2025-08-26T19:00:00Z",
    created_at: "2025-08-20T14:15:00Z",
    updated_at: "2025-08-26T19:00:00Z",
    created_by: "superadmin-001",
    approved_by: "approver-001",
    creator_name: "Super Admin",
  },
];

export const mockAdmins: Admin[] = [
  {
    id: "admin-001",
    full_name: "Dr. Sarah Johnson",
    email: "sarah.johnson@upsa.edu.gh",
    role: "ADMIN",
    status: "ACTIVE",
    created_at: "2025-08-15T10:30:00Z",
    updated_at: "2025-08-15T10:30:00Z",
  },
  {
    id: "admin-002",
    full_name: "Prof. Michael Brown",
    email: "michael.brown@upsa.edu.gh",
    role: "ADMIN",
    status: "ACTIVE",
    created_at: "2025-08-20T09:15:00Z",
    updated_at: "2025-08-20T09:15:00Z",
  },
  {
    id: "admin-003",
    full_name: "Dr. Grace Asante",
    email: "grace.asante@upsa.edu.gh",
    role: "ADMIN",
    status: "ACTIVE",
    created_at: "2025-09-01T08:45:00Z",
    updated_at: "2025-09-01T08:45:00Z",
  },
];

export const mockAdminAssignments: AdminAssignment[] = [
  {
    id: "assignment-001",
    admin_id: "admin-001",
    election_id: "election-001",
    assigned_by: "superadmin-001",
    created_at: "2025-09-01T10:35:00Z",
    admin: mockAdmins[0],
    election: mockElections[0],
    assigner_name: "Super Admin",
  },
  {
    id: "assignment-002",
    admin_id: "admin-002",
    election_id: "election-002",
    assigned_by: "superadmin-001",
    created_at: "2025-08-28T16:00:00Z",
    admin: mockAdmins[1],
    election: mockElections[1],
    assigner_name: "Super Admin",
  },
  {
    id: "assignment-003",
    admin_id: "admin-001",
    election_id: "election-004",
    assigned_by: "superadmin-001",
    created_at: "2025-09-08T11:45:00Z",
    admin: mockAdmins[0],
    election: mockElections[3],
    assigner_name: "Super Admin",
  },
];

export const mockInvitations: InvitationToken[] = [
  {
    id: "invite-001",
    email: "new.admin@upsa.edu.gh",
    token: "inv_abcd1234",
    role: "ADMIN",
    expires_at: "2025-09-17T10:30:00Z",
    used: false,
    created_at: "2025-09-10T10:30:00Z",
    created_by: "superadmin-001",
  },
];
