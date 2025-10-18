"use client";
import React from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Eye,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Admin, AdminAssignment } from "./subadminTypes";
import {
  formatDateTime,
  formatPermissions,
  getElectionStatusColor,
  formatStatus,
} from "./subadminHelpers";

interface SubAdminCardProps {
  subAdmin: Admin;
  assignments: AdminAssignment[];
  onToggleStatus: () => void;
  onViewDetails: () => void;
  onAssignElection: () => void;
}

const SubAdminCard: React.FC<SubAdminCardProps> = ({
  subAdmin,
  assignments,
  onToggleStatus,
  onViewDetails,
  onAssignElection,
}) => {
  const isActive = subAdmin.status === "ACTIVE";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-full">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {subAdmin.full_name}
            </h3>
            <p className="text-sm text-gray-600">{subAdmin.role}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Badge */}
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : subAdmin.status === "SUSPENDED"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? (
              <CheckCircle className="w-3 h-3" />
            ) : subAdmin.status === "SUSPENDED" ? (
              <Clock className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            <span>{subAdmin.status}</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{subAdmin.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Joined {formatDateTime(subAdmin.created_at)}</span>
        </div>
      </div>

      {/* Assigned Elections */}
      {assignments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Assigned Elections ({assignments.length})
          </h4>
          <div className="space-y-2">
            {assignments.slice(0, 2).map((assignment: AdminAssignment) => (
              <div key={assignment.id} className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-blue-900">
                      {assignment.election.title}
                    </h5>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getElectionStatusColor(
                      assignment.election.status
                    )}`}
                  >
                    {formatStatus(assignment.election.status)}
                  </div>
                </div>
              </div>
            ))}
            {assignments.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{assignments.length - 2} more election
                {assignments.length - 2 !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <button
            onClick={onViewDetails}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button
            onClick={onAssignElection}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[#cc910d] hover:bg-[#cc910d]/10 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Election</span>
          </button>
        </div>

        <button
          onClick={onToggleStatus}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isActive ? (
            <>
              <ToggleRight className="w-4 h-4" />
              <span>Deactivate</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span>Activate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubAdminCard;
