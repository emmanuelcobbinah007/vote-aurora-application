// Helper function to format date
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get status color with #cc910d theme
export const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "PENDING_APPROVAL":
      return "bg-yellow-100 text-yellow-800";
    case "APPROVED":
      return "bg-blue-100 text-blue-800";
    case "LIVE":
      return "bg-green-100 text-green-800";
    case "CLOSED":
      return "bg-purple-100 text-purple-800";
    case "ARCHIVED":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Brand color palette based on #cc910d
export const BRAND_COLORS = {
  primary: "#cc910d",
  primaryLight: "#e6a31a",
  primaryDark: "#a67a0a",
  secondary: "#f4e5b3",
  accent: "#fff8e1",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

// Chart colors using brand palette
export const CHART_COLORS = [
  BRAND_COLORS.primary,
  BRAND_COLORS.primaryLight,
  BRAND_COLORS.info,
  BRAND_COLORS.success,
  BRAND_COLORS.warning,
] as const;
