"use client";
import React from "react";
import {
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { ElectionApproval } from "./approvalTypes";
import {
  formatStatus,
  getStatusColor,
  formatDateTime,
} from "./approvalHelpers";

interface ApprovalCardProps {
  approval: ElectionApproval;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ approval }) => {
  const statusColor = getStatusColor(approval.status);

  // Get status icon
  const getStatusIcon = () => {
    switch (approval.status) {
      case "approved":
        return <CheckCircle className="w-5 h-5" />;
      case "rejected":
        return <XCircle className="w-5 h-5" />;
      case "review_requested":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {approval.election.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {approval.election.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{approval.election.createdByName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(approval.submittedAt)}</span>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${statusColor}`}
        >
          {getStatusIcon()}
          <span className="font-medium">{formatStatus(approval.status)}</span>
        </div>
      </div>

      {/* Election Details */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <div className="text-sm text-gray-600">
          <strong>{approval.election.department}</strong> •{" "}
          {approval.election.candidatesCount} candidates •{" "}
          {approval.election.votersCount} voters
        </div>
        <div className="text-sm text-gray-500">
          {formatDateTime(approval.election.startDate)} -{" "}
          {formatDateTime(approval.election.endDate)}
        </div>
      </div>

      {/* Notes Section */}
      {approval.lastNote && (
        <div className="border-t pt-4">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {approval.lastNote.createdByName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDateTime(approval.lastNote.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {approval.lastNote.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalCard;
