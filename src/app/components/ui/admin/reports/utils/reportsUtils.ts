// Brand colors and utility functions for reports
export const BRAND_COLORS = {
  primary: "#cc910d", // Main brand color
  primaryLight: "#e6a827",
  primaryDark: "#a67a0a",

  // Consistent with dashboard theme - white backgrounds, gray text, amber accents
  success: "#16a34a",
  warning: "#cc910d", // Use brand color for warning/amber
  danger: "#dc2626",
  info: "#2563eb",

  // Gray scale (consistent with existing dashboard)
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
};

// Candidate differentiation colors - diverse palette with good contrast and visual distinction
export const CANDIDATE_COLORS = [
  "#cc910d", // Primary amber (1st candidate)
  "#2563eb", // Blue-600 (2nd candidate)
  "#dc2626", // Red-600 (3rd candidate)
  "#059669", // Emerald-600 (4th candidate)
  "#7c3aed", // Violet-600 (5th candidate)
  "#6b7280", // Gray-500 (6th candidate)
  "#ea580c", // Orange-600 (7th candidate)
  "#0891b2", // Cyan-600 (8th candidate)
  "#be123c", // Rose-700 (9th candidate)
  "#374151", // Gray-700 (10th candidate)
];

// Lighter versions for backgrounds and hover states
export const CANDIDATE_COLORS_LIGHT = [
  "#fef3c7", // Amber-100
  "#dbeafe", // Blue-100
  "#fee2e2", // Red-100
  "#d1fae5", // Emerald-100
  "#ede9fe", // Violet-100
  "#f3f4f6", // Gray-100
  "#ffedd5", // Orange-100
  "#cffafe", // Cyan-100
  "#ffe4e6", // Rose-100
  "#e5e7eb", // Gray-200
];

// Utility function to get candidate color by index
export const getCandidateColor = (index: number): string => {
  return CANDIDATE_COLORS[index % CANDIDATE_COLORS.length];
};

// Utility function to get candidate light color by index
export const getCandidateColorLight = (index: number): string => {
  return CANDIDATE_COLORS_LIGHT[index % CANDIDATE_COLORS_LIGHT.length];
};

// Utility function to get performance-based color
export const getPerformanceColor = (rank: number, total: number): string => {
  if (rank === 1) return CANDIDATE_COLORS[0]; // Winner - primary amber
  if (rank <= Math.ceil(total * 0.3)) return CANDIDATE_COLORS[1]; // Top 30%
  if (rank <= Math.ceil(total * 0.6)) return CANDIDATE_COLORS[2]; // Top 60%
  return CANDIDATE_COLORS[3]; // Bottom performers
}; // Format numbers with proper separators
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

// Format percentages
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format time durations
export const formatDuration = (startTime: Date, endTime: Date): string => {
  const diffInMs = endTime.getTime() - startTime.getTime();
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h`;
};

// Format time for display
export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// Format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Format full date and time
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

// Calculate time remaining
export const getTimeRemaining = (endTime: Date): string => {
  const now = new Date();
  const diffInMs = endTime.getTime() - now.getTime();

  if (diffInMs <= 0) {
    return "Election ended";
  }

  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }
  return "Just now";
};

// Generate chart colors
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    BRAND_COLORS.primary,
    BRAND_COLORS.info,
    BRAND_COLORS.success,
    BRAND_COLORS.warning,
    BRAND_COLORS.danger,
    BRAND_COLORS.gray600,
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors by varying opacity
  const colors = [...baseColors];
  while (colors.length < count) {
    colors.push(...baseColors.map((color) => `${color}80`)); // Add opacity
  }

  return colors.slice(0, count);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Export format options
export const EXPORT_FORMATS = [
  { value: "PDF", label: "PDF Report", icon: "FileText" },
  { value: "CSV", label: "CSV Data", icon: "Table" },
  { value: "EXCEL", label: "Excel Workbook", icon: "Sheet" },
  { value: "JSON", label: "JSON Data", icon: "Database" },
] as const;
