export interface Election {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  department: string;
  startDate: string;
  endDate: string;
  candidatesCount: number;
  votersCount: number;
  createdAt: string;
}

export interface ApprovalNote {
  id: string;
  message: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  type: "approval" | "rejection" | "review_request";
}

export interface ElectionApproval {
  id: string;
  election: Election;
  status: "pending" | "approved" | "rejected" | "review_requested";
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewedByName: string | null;
  priority: "low" | "medium" | "high";
  notes: ApprovalNote[];
  lastNote?: ApprovalNote;
}

export interface ApprovalFilters {
  status: string[];
  priority: string[];
  department: string[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
}
