import React from "react";
import { Calendar, Clock, Users, UserPlus, Badge } from "lucide-react";
import { Election, AdminAssignment } from "./subadminTypes";

interface ElectionCardProps {
  election: Election;
  assignments?: AdminAssignment[];
  onInviteAdmin: () => void;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({
  election,
  assignments = [],
  onInviteAdmin,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-700";
      case "APPROVED":
        return "bg-blue-100 text-blue-700";
      case "LIVE":
        return "bg-green-100 text-green-700";
      case "CLOSED":
        return "bg-red-100 text-red-700";
      case "ARCHIVED":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {election.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {election.description}
          </p>
        </div>
        <span
          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            election.status
          )}`}
        >
          {election.status.replace("_", " ")}
        </span>
      </div>

      {/* Election Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Starts: {formatDate(election.start_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Ends: {formatDate(election.end_time)}</span>
        </div>
      </div>

      {/* Assigned Admins */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
          <Users className="h-4 w-4" />
          <span>Assigned Admins ({assignments.length})</span>
        </div>

        {assignments.length > 0 ? (
          <div className="space-y-1">
            {assignments.slice(0, 2).map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <div className="w-6 h-6 bg-[#cc910d] bg-opacity-10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-[#cc910d]">
                    {assignment.admin.full_name.charAt(0)}
                  </span>
                </div>
                <span>{assignment.admin.full_name}</span>
              </div>
            ))}
            {assignments.length > 2 && (
              <div className="text-xs text-gray-500 ml-8">
                +{assignments.length - 2} more
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            No administrators assigned
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onInviteAdmin}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#cc910d] text-white rounded-lg hover:bg-[#b8820c] transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        <span>Invite Admin</span>
      </button>
    </div>
  );
};

export default ElectionCard;
