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
  start_time: string; // ISO string, maps to DateTime in Prisma
  end_time: string; // ISO string, maps to DateTime in Prisma
  created_at: string; // ISO string, maps to DateTime in Prisma
  updated_at: string; // ISO string, maps to DateTime in Prisma
  created_by: string; // UUID reference to Users table
  approved_by?: string; // UUID reference to Users table (optional)
  is_general: boolean; // New field for election type
  department?: string; // New field for department-specific elections
  // UI-computed fields (not in database)
  total_voters?: number;
  total_votes?: number;
}

export interface Portfolio {
  id: string;
  title: string;
  description?: string;
  election_id: string;
  created_at: string;
  _count?: {
    candidates: number;
  };
}

export interface Candidate {
  id: string;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  portfolio_id: string;
  election_id: string;
  created_at: string;
  portfolio?: {
    id: string;
    title: string;
  };
  _count?: {
    votes: number;
  };
}

export interface Ballot {
  id: string;
  election_id: string;
  portfolio_id: string;
  ballot_order: number;
  created_at: string;
}

export interface ElectionWithDetails extends Election {
  portfolios?: Portfolio[];
  candidates?: Candidate[];
  ballots?: Ballot[];
}

// Mock Elections Data
export const mockElections: Election[] = [
  {
    id: "1",
    title: "Student Union Executive Elections 2024",
    description:
      "Annual elections for Student Union executive positions including President, Vice President, and other key roles.",
    start_time: "2024-03-15T09:00:00Z",
    end_time: "2024-03-17T17:00:00Z",
    status: "LIVE",
    created_at: "2024-02-15T10:00:00Z",
    updated_at: "2024-03-15T08:00:00Z",
    created_by: "admin-001",
    is_general: true,
    department: "General",
    total_voters: 2500,
    total_votes: 1847,
  },
  {
    id: "2",
    title: "Faculty Representative Elections",
    description:
      "Election for faculty representatives across all departments and schools.",
    start_time: "2024-04-01T08:00:00Z",
    end_time: "2024-04-03T20:00:00Z",
    status: "APPROVED",
    created_at: "2024-03-01T14:30:00Z",
    updated_at: "2024-03-25T16:45:00Z",
    created_by: "admin-002",
    is_general: true,
    department: "General",
    total_voters: 850,
    total_votes: 0,
  },
  {
    id: "3",
    title: "Class Representative Elections - Year 1",
    description:
      "Elections for first-year class representatives across all programs.",
    start_time: "2024-02-01T09:00:00Z",
    end_time: "2024-02-03T18:00:00Z",
    status: "CLOSED",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-02-03T18:00:00Z",
    created_by: "admin-003",
    is_general: true,
    department: "General",
    total_voters: 1200,
    total_votes: 945,
  },
  {
    id: "4",
    title: "Computer Science Department Elections",
    description:
      "Annual elections for Computer Science department student representative positions.",
    start_time: "2024-05-15T10:00:00Z",
    end_time: "2024-05-17T19:00:00Z",
    status: "PENDING_APPROVAL",
    created_at: "2024-04-10T11:20:00Z",
    updated_at: "2024-04-20T13:30:00Z",
    created_by: "admin-001",
    is_general: false,
    department: "Computer Science and Engineering",
    total_voters: 450,
    total_votes: 0,
  },
  {
    id: "5",
    title: "Mechanical Engineering Student Council",
    description:
      "Elections for leadership positions in the Mechanical Engineering student council.",
    start_time: "2024-06-01T09:00:00Z",
    end_time: "2024-06-02T17:00:00Z",
    status: "DRAFT",
    created_at: "2024-05-15T15:45:00Z",
    updated_at: "2024-05-20T10:22:00Z",
    created_by: "admin-004",
    is_general: false,
    department: "Mechanical Engineering",
    total_voters: 320,
    total_votes: 0,
  },
];

// Mock Portfolios Data
export const mockPortfolios: Portfolio[] = [
  // Student Union Executive Elections
  {
    id: "p1",
    title: "President",
    description: "Lead the student union and represent all students",
    election_id: "1",
    created_at: "2024-02-15T10:05:00Z",
  },
  {
    id: "p2",
    title: "Vice President",
    description: "Support the president and oversee academic affairs",
    election_id: "1",
    created_at: "2024-02-15T10:06:00Z",
  },
  {
    id: "p3",
    title: "Secretary",
    description: "Handle administrative duties and record keeping",
    election_id: "1",
    created_at: "2024-02-15T10:07:00Z",
  },
  {
    id: "p4",
    title: "Treasurer",
    description: "Manage student union finances and budget",
    election_id: "1",
    created_at: "2024-02-15T10:08:00Z",
  },
  // Faculty Representative Elections
  {
    id: "p5",
    title: "Engineering Faculty Rep",
    description: "Representative for College of Engineering",
    election_id: "2",
    created_at: "2024-03-01T14:35:00Z",
  },
  {
    id: "p6",
    title: "Business Faculty Rep",
    description: "Representative for School of Business",
    election_id: "2",
    created_at: "2024-03-01T14:36:00Z",
  },
];

// Mock Candidates Data
export const mockCandidates: Candidate[] = [
  // President candidates
  {
    id: "c1",
    full_name: "Sarah Johnson",
    photo_url:
      "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=400&h=400&fit=crop&crop=face",
    manifesto: "Third-year Business major with extensive leadership experience",
    portfolio_id: "p1",
    election_id: "1",
    created_at: "2024-02-20T09:00:00Z",
  },
  {
    id: "c2",
    full_name: "Michael Chen",
    photo_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    manifesto: "Computer Science student passionate about student advocacy",
    portfolio_id: "p1",
    election_id: "1",
    created_at: "2024-02-20T09:15:00Z",
  },
  // Vice President candidates
  {
    id: "c3",
    full_name: "Emma Rodriguez",
    photo_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    manifesto:
      "Psychology major with focus on student mental health initiatives",
    portfolio_id: "p2",
    election_id: "1",
    created_at: "2024-02-20T10:30:00Z",
  },
  {
    id: "c4",
    full_name: "David Kim",
    photo_url:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    manifesto: "Engineering student with experience in student government",
    portfolio_id: "p2",
    election_id: "1",
    created_at: "2024-02-20T10:45:00Z",
  },
  // Secretary candidates
  {
    id: "c5",
    full_name: "Lisa Wang",
    photo_url:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face",
    manifesto: "Communications major with excellent organizational skills",
    portfolio_id: "p3",
    election_id: "1",
    created_at: "2024-02-20T11:00:00Z",
  },
  // Treasurer candidates
  {
    id: "c6",
    full_name: "James Taylor",
    photo_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    manifesto:
      "Finance major with internship experience in financial management",
    portfolio_id: "p4",
    election_id: "1",
    created_at: "2024-02-20T11:15:00Z",
  },
];

// Mock Ballots Data
export const mockBallots: Ballot[] = [
  // Student Union Executive Elections ballots
  {
    id: "b1",
    election_id: "1",
    portfolio_id: "p1",
    ballot_order: 1,
    created_at: "2024-03-10T10:00:00Z",
  },
  {
    id: "b2",
    election_id: "1",
    portfolio_id: "p1",
    ballot_order: 2,
    created_at: "2024-03-10T10:01:00Z",
  },
  {
    id: "b3",
    election_id: "1",
    portfolio_id: "p2",
    ballot_order: 1,
    created_at: "2024-03-10T10:02:00Z",
  },
  {
    id: "b4",
    election_id: "1",
    portfolio_id: "p2",
    ballot_order: 2,
    created_at: "2024-03-10T10:03:00Z",
  },
  {
    id: "b5",
    election_id: "1",
    portfolio_id: "p3",
    ballot_order: 1,
    created_at: "2024-03-10T10:04:00Z",
  },
  {
    id: "b6",
    election_id: "1",
    portfolio_id: "p4",
    ballot_order: 1,
    created_at: "2024-03-10T10:05:00Z",
  },
];

// Helper function to get election with all details
export const getElectionWithDetails = (
  electionId: string
): ElectionWithDetails | null => {
  const election = mockElections.find((e) => e.id === electionId);
  if (!election) return null;

  const portfolios = mockPortfolios.filter((p) => p.election_id === electionId);
  const candidates = mockCandidates.filter((c) => c.election_id === electionId);
  const ballots = mockBallots.filter((b) => b.election_id === electionId);

  return {
    ...election,
    portfolios,
    candidates,
    ballots,
  };
};

// Helper function to get all elections with details
export const getAllElectionsWithDetails = (): ElectionWithDetails[] => {
  return mockElections.map((election) => {
    const portfolios = mockPortfolios.filter(
      (p) => p.election_id === election.id
    );
    const candidates = mockCandidates.filter(
      (c) => c.election_id === election.id
    );
    const ballots = mockBallots.filter((b) => b.election_id === election.id);

    return {
      ...election,
      portfolios,
      candidates,
      ballots,
    };
  });
};
