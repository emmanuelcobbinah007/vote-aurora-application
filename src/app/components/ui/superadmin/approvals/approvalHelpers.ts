import { ElectionApproval } from "./approvalTypes";

// Format status for display
export const formatStatus = (status: string): string => {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "review_requested":
      return "Review Requested";
    default:
      return status;
  }
};

// Get status color classes
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "text-yellow-700 bg-yellow-100 border-yellow-200";
    case "approved":
      return "text-green-700 bg-green-100 border-green-200";
    case "rejected":
      return "text-red-700 bg-red-100 border-red-200";
    case "review_requested":
      return "text-blue-700 bg-blue-100 border-blue-200";
    default:
      return "text-gray-700 bg-gray-100 border-gray-200";
  }
};

// Get priority color classes
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-50";
    case "medium":
      return "text-yellow-600 bg-yellow-50";
    case "low":
      return "text-green-600 bg-green-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

// Format priority for display
export const formatPriority = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time for display
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate days until election
export const getDaysUntilElection = (startDate: string): number => {
  const today = new Date();
  const electionDate = new Date(startDate);
  const diffTime = electionDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get election timeline status
export const getElectionTimelineStatus = (
  startDate: string,
  endDate: string
): {
  status: "upcoming" | "active" | "completed";
  message: string;
} => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    const daysUntil = getDaysUntilElection(startDate);
    return {
      status: "upcoming",
      message: `Starts in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`,
    };
  } else if (now >= start && now <= end) {
    return {
      status: "active",
      message: "Election is active",
    };
  } else {
    return {
      status: "completed",
      message: "Election completed",
    };
  }
};

// Filter approvals based on search and filters
export const filterApprovals = (
  approvals: ElectionApproval[],
  searchTerm: string,
  filters: {
    status: string[];
    priority: string[];
    department: string[];
  }
): ElectionApproval[] => {
  let filtered = approvals;

  // Apply search filter
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (approval) =>
        approval.election.title.toLowerCase().includes(searchLower) ||
        approval.election.description.toLowerCase().includes(searchLower) ||
        approval.election.createdByName.toLowerCase().includes(searchLower) ||
        approval.election.department.toLowerCase().includes(searchLower) ||
        approval.reviewedByName?.toLowerCase().includes(searchLower) ||
        approval.lastNote?.message.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filters
  if (filters.status.length > 0) {
    filtered = filtered.filter((approval) =>
      filters.status.includes(approval.status)
    );
  }

  // Apply priority filters
  if (filters.priority.length > 0) {
    filtered = filtered.filter((approval) =>
      filters.priority.includes(approval.priority)
    );
  }

  // Apply department filters
  if (filters.department.length > 0) {
    filtered = filtered.filter((approval) =>
      filters.department.includes(approval.election.department)
    );
  }

  return filtered;
};

// Sort approvals by different criteria
export const sortApprovals = (
  approvals: ElectionApproval[],
  sortBy: "date" | "priority" | "status" | "title",
  sortOrder: "asc" | "desc" = "desc"
): ElectionApproval[] => {
  return [...approvals].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison =
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison =
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder];
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "title":
        comparison = a.election.title.localeCompare(b.election.title);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
};
