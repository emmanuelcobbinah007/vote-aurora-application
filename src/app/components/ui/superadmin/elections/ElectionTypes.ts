// Types based on Prisma schema
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
  is_general: boolean;
  department: string | null;
  creator: {
    full_name: string;
    email: string;
  };
  approver?: {
    full_name: string;
    email: string;
  };
  portfolios: Array<{
    id: string;
    title: string;
    candidates: Array<{ id: string; full_name: string }>;
  }>;
  _count?: {
    votes: number;
    candidates: number;
    portfolios: number;
  };
}

export const ELECTION_STATUS_CONFIG = {
  DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
  PENDING_APPROVAL: {
    color: "bg-yellow-100 text-yellow-800",
    label: "Pending Approval",
  },
  APPROVED: { color: "bg-blue-100 text-blue-800", label: "Approved" },
  LIVE: { color: "bg-green-100 text-green-800", label: "Live" },
  CLOSED: { color: "bg-red-100 text-red-800", label: "Closed" },
  ARCHIVED: { color: "bg-purple-100 text-purple-800", label: "Archived" },
} as const;
