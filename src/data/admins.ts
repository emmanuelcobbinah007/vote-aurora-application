export interface ElectionAdmin {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: "VOTER" | "ADMIN" | "SUPERADMIN" | "APPROVER" | "ORCHESTRATOR";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  created_at: string;
  updated_at: string;
  // UI-specific fields (not in database)
  avatar_url?: string;
  last_active?: string;
  permissions?: string[];
  assigned_elections?: string[];
}

export interface AdminStats {
  total_elections_created: number;
  total_elections_approved: number;
  total_votes_processed: number;
  last_login: string;
}

// Mock Election Admins Data
export const mockElectionAdmins: ElectionAdmin[] = [
  {
    id: "admin-001",
    full_name: "Dr. Sarah Williams",
    email: "sarah.williams@university.edu",
    password_hash: "$2a$10$example.hash.for.sarah", // In real app, this would be properly hashed
    role: "SUPERADMIN",
    created_at: "2023-09-01T08:00:00Z",
    updated_at: "2024-03-15T14:30:00Z",
    status: "ACTIVE",
    avatar_url:
      "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face",
    last_active: "2024-03-15T14:30:00Z",
    permissions: [
      "CREATE_ELECTION",
      "APPROVE_ELECTION",
      "MANAGE_USERS",
      "VIEW_AUDIT_LOGS",
      "SYSTEM_CONFIG",
    ],
    assigned_elections: ["1", "4"],
  },
  {
    id: "admin-002",
    full_name: "Prof. Michael Thompson",
    email: "michael.thompson@university.edu",
    password_hash: "$2a$10$example.hash.for.michael",
    role: "ADMIN",
    created_at: "2023-10-15T10:30:00Z",
    updated_at: "2024-03-14T16:45:00Z",
    status: "ACTIVE",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    last_active: "2024-03-14T16:45:00Z",
    permissions: [
      "CREATE_ELECTION",
      "EDIT_ELECTION",
      "VIEW_RESULTS",
      "MANAGE_CANDIDATES",
    ],
    assigned_elections: ["2"],
  },
  {
    id: "admin-003",
    full_name: "Ms. Jennifer Davis",
    email: "jennifer.davis@university.edu",
    password_hash: "$2a$10$example.hash.for.jennifer",
    role: "ADMIN",
    created_at: "2023-11-01T09:15:00Z",
    updated_at: "2024-03-13T11:20:00Z",
    status: "ACTIVE",
    avatar_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    last_active: "2024-03-13T11:20:00Z",
    permissions: [
      "CREATE_ELECTION",
      "EDIT_ELECTION",
      "VIEW_RESULTS",
      "MANAGE_CANDIDATES",
    ],
    assigned_elections: ["3"],
  },
  {
    id: "admin-004",
    full_name: "Mr. David Rodriguez",
    email: "david.rodriguez@university.edu",
    password_hash: "$2a$10$example.hash.for.david",
    role: "ADMIN",
    created_at: "2024-01-10T14:20:00Z",
    updated_at: "2024-03-12T09:30:00Z",
    status: "ACTIVE",
    avatar_url:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    last_active: "2024-03-12T09:30:00Z",
    permissions: [
      "CREATE_ELECTION",
      "EDIT_ELECTION",
      "VIEW_RESULTS",
      "MANAGE_CANDIDATES",
    ],
    assigned_elections: ["5"],
  },
  {
    id: "approver-001",
    full_name: "Dean Robert Johnson",
    email: "robert.johnson@university.edu",
    password_hash: "$2a$10$example.hash.for.robert",
    role: "APPROVER",
    created_at: "2023-09-01T08:00:00Z",
    updated_at: "2024-03-14T13:15:00Z",
    status: "ACTIVE",
    avatar_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    last_active: "2024-03-14T13:15:00Z",
    permissions: ["APPROVE_ELECTION", "VIEW_ELECTIONS", "VIEW_AUDIT_LOGS"],
    assigned_elections: [],
  },
  {
    id: "approver-002",
    full_name: "Vice Chancellor Lisa Anderson",
    email: "lisa.anderson@university.edu",
    password_hash: "$2a$10$example.hash.for.lisa",
    role: "APPROVER",
    created_at: "2023-09-01T08:00:00Z",
    updated_at: "2024-03-15T10:45:00Z",
    status: "ACTIVE",
    avatar_url:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    last_active: "2024-03-15T10:45:00Z",
    permissions: [
      "APPROVE_ELECTION",
      "VIEW_ELECTIONS",
      "VIEW_AUDIT_LOGS",
      "FINAL_APPROVAL",
    ],
    assigned_elections: [],
  },
  {
    id: "orchestrator-001",
    full_name: "IT Manager Kevin Brown",
    email: "kevin.brown@university.edu",
    password_hash: "$2a$10$example.hash.for.kevin",
    role: "ORCHESTRATOR",
    created_at: "2023-09-15T12:00:00Z",
    updated_at: "2024-03-15T15:20:00Z",
    status: "ACTIVE",
    avatar_url:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
    last_active: "2024-03-15T15:20:00Z",
    permissions: [
      "START_ELECTION",
      "END_ELECTION",
      "MONITOR_SYSTEM",
      "VIEW_LOGS",
      "TECHNICAL_SUPPORT",
    ],
    assigned_elections: ["1", "2", "3"],
  },
  {
    id: "admin-005",
    full_name: "Dr. Patricia Miller",
    email: "patricia.miller@university.edu",
    password_hash: "$2a$10$example.hash.for.patricia",
    role: "ADMIN",
    created_at: "2023-12-01T11:30:00Z",
    updated_at: "2024-03-11T14:10:00Z",
    status: "INACTIVE",
    avatar_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    last_active: "2024-03-11T14:10:00Z",
    permissions: ["CREATE_ELECTION", "EDIT_ELECTION", "VIEW_RESULTS"],
    assigned_elections: [],
  },
];

// Mock Admin Stats Data
export const mockAdminStats: { [key: string]: AdminStats } = {
  "admin-001": {
    total_elections_created: 8,
    total_elections_approved: 15,
    total_votes_processed: 5420,
    last_login: "2024-03-15T14:30:00Z",
  },
  "admin-002": {
    total_elections_created: 3,
    total_elections_approved: 0,
    total_votes_processed: 1200,
    last_login: "2024-03-14T16:45:00Z",
  },
  "admin-003": {
    total_elections_created: 4,
    total_elections_approved: 0,
    total_votes_processed: 2100,
    last_login: "2024-03-13T11:20:00Z",
  },
  "admin-004": {
    total_elections_created: 2,
    total_elections_approved: 0,
    total_votes_processed: 450,
    last_login: "2024-03-12T09:30:00Z",
  },
  "approver-001": {
    total_elections_created: 0,
    total_elections_approved: 12,
    total_votes_processed: 0,
    last_login: "2024-03-14T13:15:00Z",
  },
  "approver-002": {
    total_elections_created: 0,
    total_elections_approved: 18,
    total_votes_processed: 0,
    last_login: "2024-03-15T10:45:00Z",
  },
  "orchestrator-001": {
    total_elections_created: 0,
    total_elections_approved: 0,
    total_votes_processed: 8200,
    last_login: "2024-03-15T15:20:00Z",
  },
  "admin-005": {
    total_elections_created: 1,
    total_elections_approved: 0,
    total_votes_processed: 150,
    last_login: "2024-03-11T14:10:00Z",
  },
};

// Helper function to get admin with stats
export const getAdminWithStats = (
  adminId: string
): (ElectionAdmin & { stats: AdminStats }) | null => {
  const admin = mockElectionAdmins.find((a) => a.id === adminId);
  const stats = mockAdminStats[adminId];

  if (!admin || !stats) return null;

  return {
    ...admin,
    stats,
  };
};

// Helper function to get admins by role
export const getAdminsByRole = (
  role: ElectionAdmin["role"]
): ElectionAdmin[] => {
  return mockElectionAdmins.filter((admin) => admin.role === role);
};

// Helper function to get active admins
export const getActiveAdmins = (): ElectionAdmin[] => {
  return mockElectionAdmins.filter((admin) => admin.status === "ACTIVE");
};

// Helper function to get admin by election assignment
export const getAdminsByElection = (electionId: string): ElectionAdmin[] => {
  return mockElectionAdmins.filter((admin) =>
    admin.assigned_elections?.includes(electionId)
  );
};
