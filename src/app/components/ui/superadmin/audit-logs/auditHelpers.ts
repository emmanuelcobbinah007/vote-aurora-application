import React from "react";
import { User, Activity, UserPlus, Vote, Shield } from "lucide-react";

// Helper function to format action details
export const formatActionDetails = (
  action: string,
  details: string
): React.ReactNode => {
  try {
    const parsed = JSON.parse(details);

    switch (action) {
      case "ADMIN_CREATED":
        return React.createElement(
          "div",
          { className: "space-y-1" },
          React.createElement(
            "div",
            { className: "text-sm text-gray-700" },
            "New admin account created for ",
            React.createElement(
              "span",
              { className: "font-medium text-green-600" },
              parsed.full_name
            )
          ),
          React.createElement(
            "div",
            { className: "text-xs text-gray-500" },
            `Email: ${parsed.email} • Role: ${parsed.role}`
          )
        );

      case "ELECTION_APPROVED":
        return React.createElement(
          "div",
          { className: "space-y-1" },
          React.createElement(
            "div",
            { className: "text-sm text-gray-700" },
            "Election approved: ",
            React.createElement(
              "span",
              { className: "font-medium text-green-600" },
              parsed.election_title
            )
          ),
          React.createElement(
            "div",
            { className: "text-xs text-gray-500" },
            `Status: ${parsed.status} • Approved by: ${parsed.approved_by}`
          )
        );

      case "SECURITY_ALERT":
        return React.createElement(
          "div",
          { className: "space-y-1" },
          React.createElement(
            "div",
            { className: "text-sm text-gray-700" },
            "Security Alert: ",
            React.createElement(
              "span",
              { className: "font-medium text-red-600" },
              parsed.alert_type
            )
          ),
          React.createElement(
            "div",
            { className: "text-xs text-gray-500" },
            `IP: ${parsed.ip_address} • Attempts: ${parsed.attempts} • ${
              parsed.blocked ? "Blocked" : "Active"
            }`
          )
        );

      case "SUBADMIN_SUSPENDED":
        return React.createElement(
          "div",
          { className: "space-y-1" },
          React.createElement(
            "div",
            { className: "text-sm text-gray-700" },
            "User suspended: ",
            React.createElement(
              "span",
              { className: "font-medium text-orange-600" },
              parsed.suspended_user
            )
          ),
          React.createElement(
            "div",
            { className: "text-xs text-gray-500" },
            `Reason: ${parsed.reason} • Duration: ${parsed.duration}`
          )
        );

      case "SYSTEM_BACKUP":
        return React.createElement(
          "div",
          { className: "space-y-1" },
          React.createElement(
            "div",
            { className: "text-sm text-gray-700" },
            "System backup completed: ",
            React.createElement(
              "span",
              { className: "font-medium text-blue-600" },
              parsed.backup_type
            )
          ),
          React.createElement(
            "div",
            { className: "text-xs text-gray-500" },
            `Size: ${parsed.size} • Duration: ${parsed.duration}`
          )
        );

      default:
        const keyValuePairs = Object.entries(parsed)
          .filter(([key, value]) => value !== null && value !== undefined)
          .slice(0, 3);

        if (keyValuePairs.length === 0) {
          return React.createElement(
            "div",
            { className: "text-sm text-gray-700" },
            "Action completed"
          );
        }

        return React.createElement(
          "div",
          { className: "space-y-1" },
          React.createElement(
            "div",
            { className: "text-sm text-gray-700" },
            keyValuePairs.map(([key, value], index) =>
              React.createElement(
                "div",
                {
                  key: key,
                  className:
                    index === 0 ? "font-medium" : "text-xs text-gray-500",
                },
                `${key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}: ${String(value)}`
              )
            )
          )
        );
    }
  } catch (error) {
    const truncated =
      details.length > 100 ? details.substring(0, 100) + "..." : details;
    return React.createElement(
      "div",
      {
        className:
          "text-sm text-gray-700 font-mono text-xs bg-gray-50 p-2 rounded",
      },
      truncated
    );
  }
};

// Helper function to get action icon
export const getActionIcon = (action: string): React.ReactNode => {
  switch (action) {
    case "USER_LOGIN":
      return React.createElement(User, { className: "w-4 h-4" });
    case "ADMIN_CREATED":
    case "SUBADMIN_SUSPENDED":
      return React.createElement(UserPlus, { className: "w-4 h-4" });
    case "ELECTION_APPROVED":
    case "ELECTION_CREATED":
      return React.createElement(Vote, { className: "w-4 h-4" });
    case "SECURITY_ALERT":
      return React.createElement(Shield, { className: "w-4 h-4" });
    case "SYSTEM_BACKUP":
      return React.createElement(Activity, { className: "w-4 h-4" });
    default:
      return React.createElement(Activity, { className: "w-4 h-4" });
  }
};

// Helper function to get action color
export const getActionColor = (action: string): string => {
  switch (action) {
    case "USER_LOGIN":
      return "text-blue-600 bg-blue-50";
    case "ADMIN_CREATED":
      return "text-green-600 bg-green-50";
    case "ELECTION_APPROVED":
      return "text-green-600 bg-green-50";
    case "SECURITY_ALERT":
      return "text-red-600 bg-red-50";
    case "SUBADMIN_SUSPENDED":
      return "text-orange-600 bg-orange-50";
    case "SYSTEM_BACKUP":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

// Helper function to format action text
export const formatAction = (action: string): string => {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to format timestamp
export const formatTimestamp = (
  timestamp: string
): { date: string; time: string } => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
