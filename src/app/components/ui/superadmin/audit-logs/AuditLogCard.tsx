"use client";
import React from "react";
import { Clock, User, Activity, UserPlus, Vote, Shield } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  userEmail: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

interface AuditLogCardProps {
  log: AuditLog;
  index: number;
}

const AuditLogCard: React.FC<AuditLogCardProps> = ({ log, index }) => {
  // Helper function to format action details
  const formatActionDetails = (action: string, details: string) => {
    try {
      const parsed = JSON.parse(details);

      switch (action) {
        case "ADMIN_CREATED":
          return (
            <div className="space-y-1">
              <div className="text-sm text-gray-700">
                New admin account created for{" "}
                <span className="font-medium text-green-600">
                  {parsed.full_name}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Email: {parsed.email} • Role: {parsed.role}
              </div>
            </div>
          );

        case "ELECTION_APPROVED":
          return (
            <div className="space-y-1">
              <div className="text-sm text-gray-700">
                Election approved:{" "}
                <span className="font-medium text-green-600">
                  {parsed.election_title}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Status: {parsed.status} • Approved by: {parsed.approved_by}
              </div>
            </div>
          );

        case "SECURITY_ALERT":
          return (
            <div className="space-y-1">
              <div className="text-sm text-gray-700">
                Security Alert:{" "}
                <span className="font-medium text-red-600">
                  {parsed.alert_type}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                IP: {parsed.ip_address} • Attempts: {parsed.attempts} •{" "}
                {parsed.blocked ? "Blocked" : "Active"}
              </div>
            </div>
          );

        case "SUBADMIN_SUSPENDED":
          return (
            <div className="space-y-1">
              <div className="text-sm text-gray-700">
                User suspended:{" "}
                <span className="font-medium text-orange-600">
                  {parsed.suspended_user}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Reason: {parsed.reason} • Duration: {parsed.duration}
              </div>
            </div>
          );

        case "SYSTEM_BACKUP":
          return (
            <div className="space-y-1">
              <div className="text-sm text-gray-700">
                System backup completed:{" "}
                <span className="font-medium text-[#2ecc71]">
                  {parsed.backup_type}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Size: {parsed.size} • Duration: {parsed.duration}
              </div>
            </div>
          );

        default:
          return <div className="text-sm text-gray-700">Action completed</div>;
      }
    } catch (error) {
      return (
        <div className="text-sm text-gray-700">
          {details || "No additional details"}
        </div>
      );
    }
  };

  // Helper function to get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case "USER_LOGIN":
        return <User className="w-4 h-4" />;
      case "ADMIN_CREATED":
      case "SUBADMIN_SUSPENDED":
        return <UserPlus className="w-4 h-4" />;
      case "ELECTION_APPROVED":
      case "ELECTION_CREATED":
        return <Vote className="w-4 h-4" />;
      case "SECURITY_ALERT":
        return <Shield className="w-4 h-4" />;
      case "SYSTEM_BACKUP":
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Helper function to get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case "USER_LOGIN":
        return "text-[#2ecc71] bg-green-50";
      case "ADMIN_CREATED":
        return "text-[#2ecc71] bg-green-50";
      case "ELECTION_APPROVED":
        return "text-[#2ecc71] bg-green-50";
      case "SECURITY_ALERT":
        return "text-red-600 bg-red-50";
      case "SUBADMIN_SUSPENDED":
        return "text-orange-600 bg-orange-50";
      case "SYSTEM_BACKUP":
        return "text-[#2ecc71] bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Helper function to format action text
  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
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

  const { date, time } = formatTimestamp(log.timestamp);
  const actionColor = getActionColor(log.action);

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="flex items-start space-x-4">
        {/* Action Icon */}
        <div className={`p-2 rounded-full ${actionColor}`}>
          {getActionIcon(log.action)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {formatAction(log.action)}
              </h3>
              <div className="mt-1">
                {formatActionDetails(log.action, log.details || "{}")}
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-500 ml-4">
              <Clock className="w-3 h-3 mr-1" />
              <span>{time}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4 mt-3 text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <User className="w-3 h-3" />
              <span>{log.userName}</span>
            </div>
            <div className="text-gray-500">{log.userEmail}</div>
            {log.ipAddress && (
              <div className="text-gray-500">IP: {log.ipAddress}</div>
            )}
          </div>

          {/* Entity Info */}
          {log.entityId && (
            <div className="mt-2 text-xs text-gray-500">
              {log.entityType}: {log.entityId}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="text-right">
          <div className="text-xs font-medium text-gray-900">{date}</div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogCard;
