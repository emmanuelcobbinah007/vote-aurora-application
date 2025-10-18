import { AuditLog } from "./api";

// Export functionality
export const exportToCSV = (logs: AuditLog[], filename?: string) => {
  const csvContent = convertToCSV(logs);
  downloadFile(csvContent, filename || "audit-logs.csv", "text/csv");
};

export const exportToJSON = (logs: AuditLog[], filename?: string) => {
  const jsonContent = JSON.stringify(logs, null, 2);
  downloadFile(jsonContent, filename || "audit-logs.json", "application/json");
};

const convertToCSV = (logs: AuditLog[]): string => {
  if (logs.length === 0) return "";

  const headers = [
    "ID",
    "Action",
    "User Name",
    "User Email",
    "Entity Type",
    "Entity ID",
    "Details",
    "Timestamp",
  ];

  const csvRows = [
    headers.join(","),
    ...logs.map((log) =>
      [
        `"${log.id}"`,
        `"${log.action}"`,
        `"${log.userName}"`,
        `"${log.userEmail}"`,
        `"${log.entityType}"`,
        `"${log.entityId || ""}"`,
        `"${(log.details || "").replace(/"/g, '""')}"`,
        `"${log.timestamp}"`,
      ].join(",")
    ),
  ];

  return csvRows.join("\n");
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
