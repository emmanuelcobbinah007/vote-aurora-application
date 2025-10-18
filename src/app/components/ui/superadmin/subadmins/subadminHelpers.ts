import { Admin, Election, AdminAssignment } from "./subadminTypes";

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format datetime for display
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

// Get status color for elections
export const getElectionStatusColor = (status: string): string => {
  switch (status) {
    case "draft":
      return "text-gray-700 bg-gray-100";
    case "active":
      return "text-green-700 bg-green-100";
    case "completed":
      return "text-blue-700 bg-blue-100";
    case "cancelled":
      return "text-red-700 bg-red-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

// Format status for display
export const formatStatus = (status: string): string => {
  switch (status) {
    case "draft":
      return "Draft";
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

// Get days until election
export const getDaysUntilElection = (startDate: string): number => {
  const today = new Date();
  const electionDate = new Date(startDate);
  const diffTime = electionDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if subadmin is active
export const isSubAdminActive = (subAdmin: Admin): boolean => {
  return subAdmin.status === "ACTIVE";
};

// Get subadmin's active elections count
export const getActiveElectionsCount = (
  subAdminId: string,
  assignments: AdminAssignment[]
): number => {
  return assignments.filter(
    (assignment) =>
      assignment.admin_id === subAdminId &&
      assignment.election.status !== "CLOSED" &&
      assignment.election.status !== "ARCHIVED"
  ).length;
};

// Filter admins based on search and filters
export const filterSubAdmins = (
  admins: Admin[],
  searchTerm: string,
  filters: {
    status: string;
    department: string[];
  }
): Admin[] => {
  let filtered = admins;

  // Apply search filter
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (admin) =>
        admin.full_name.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower) ||
        admin.role.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (filters.status !== "all") {
    filtered = filtered.filter((admin) => {
      if (filters.status === "active") return admin.status === "ACTIVE";
      if (filters.status === "inactive") return admin.status === "INACTIVE";
      if (filters.status === "suspended") return admin.status === "SUSPENDED";
      return true;
    });
  }

  return filtered;
};

// Filter elections based on search
export const filterElections = (
  elections: Election[],
  searchTerm: string
): Election[] => {
  if (!searchTerm.trim()) return elections;

  const searchLower = searchTerm.toLowerCase();
  return elections.filter((election) =>
    election.title.toLowerCase().includes(searchLower)
  );
};

// Get unassigned elections (elections with no assigned admins)
export const getUnassignedElections = (
  elections: Election[],
  assignments: AdminAssignment[]
): Election[] => {
  const assignedElectionIds = assignments.map(
    (assignment) => assignment.election_id
  );
  return elections.filter(
    (election) => !assignedElectionIds.includes(election.id)
  );
};

// Get elections assigned to a specific admin
export const getSubAdminElections = (
  subAdminId: string,
  assignments: AdminAssignment[]
): AdminAssignment[] => {
  return assignments.filter((assignment) => assignment.admin_id === subAdminId);
};

// Sort admins by different criteria
export const sortSubAdmins = (
  admins: Admin[],
  sortBy: "name" | "email" | "created" | "status",
  sortOrder: "asc" | "desc" = "asc"
): Admin[] => {
  return [...admins].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.full_name.localeCompare(b.full_name);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "created":
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format (basic validation)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

// Generate permissions display text
export const formatPermissions = (permissions: string[]): string => {
  const permissionMap: { [key: string]: string } = {
    manage_candidates: "Manage Candidates",
    monitor_voting: "Monitor Voting",
    generate_reports: "Generate Reports",
    send_notifications: "Send Notifications",
  };

  return permissions
    .map((permission) => permissionMap[permission] || permission)
    .join(", ");
};
