"use client";
import React from "react";
import { Calendar, Users, FileText, Eye, Edit, Trash2 } from "lucide-react";

interface Election {
  id: string;
  title: string;
  description: string | null;
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "LIVE"
    | "CLOSED"
    | "ARCHIVED";
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by: string | null;
  creator: {
    full_name: string;
    email: string;
  };
  approver?: {
    full_name: string;
    email: string;
  };
  portfolios: Array<{
    id: string;
    title: string;
    candidates: Array<{ id: string; full_name: string }>;
  }>;
  _count?: {
    votes: number;
    candidates: number;
    portfolios: number;
  };
}

interface ElectionCardProps {
  election: Election;
  onView: (election: Election) => void;
  onEdit: (election: Election) => void;
  onDelete: (electionId: string) => void;
}

const ElectionCard: React.FC<ElectionCardProps> = ({
  election,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: {
        color: "bg-gray-100 text-gray-800",
        icon: <FileText className="w-3 h-3" />,
      },
      PENDING_APPROVAL: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Calendar className="w-3 h-3" />,
      },
      APPROVED: {
        color: "bg-blue-100 text-blue-800",
        icon: <Users className="w-3 h-3" />,
      },
      LIVE: {
        color: "bg-green-100 text-green-800",
        icon: <div className="w-3 h-3 bg-red-500 rounded-full" />,
      },
      CLOSED: {
        color: "bg-red-100 text-red-800",
        icon: <div className="w-3 h-3 bg-red-900 rounded" />,
      },
      ARCHIVED: {
        color: "bg-purple-100 text-purple-800",
        icon: <FileText className="w-3 h-3" />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-black">{election.title}</div>
          {election.description && (
            <div className="text-sm text-gray-500 mt-1">
              {election.description.length > 60
                ? `${election.description.substring(0, 60)}...`
                : election.description}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">{getStatusBadge(election.status)}</td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="text-gray-900">
            Start: {formatDate(election.start_time)}
          </div>
          <div className="text-gray-500">
            End: {formatDate(election.end_time)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="flex items-center text-gray-900">
            <Users className="w-4 h-4 mr-2" />
            {election._count?.votes || 0} votes
          </div>
          <div className="flex items-center text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {election._count?.candidates || 0} candidates
          </div>
          <div className="flex items-center text-gray-500">
            <FileText className="w-4 h-4 mr-2" />
            {election._count?.portfolios || 0} portfolios
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <div className="text-gray-900">{election.creator.full_name}</div>
          <div className="text-gray-500">{election.creator.email}</div>
          {election.approver && (
            <div className="text-xs text-green-600 mt-1">
              Approved by {election.approver.full_name}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(election)}
            className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center"
            title="View Details"
          >
            <Eye className="w-4 h-4 mr-1" /> View
          </button>
          <button
            onClick={() => onEdit(election)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            title="Edit Election"
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </button>
          {(election.status === "DRAFT" || election.status === "CLOSED") && (
            <button
              onClick={() => onDelete(election.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
              title="Delete Election"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ElectionCard;
