"use client";
import React from "react";
import { Vote } from "lucide-react";
import ElectionCard from "./ElectionCard";

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

interface ElectionTableProps {
  elections: Election[];
  searchTerm: string;
  statusFilter: string;
  onView: (election: Election) => void;
  onEdit: (election: Election) => void;
  onDelete: (electionId: string) => void;
}

const ElectionTable: React.FC<ElectionTableProps> = ({
  elections,
  searchTerm,
  statusFilter,
  onView,
  onEdit,
  onDelete,
}) => {
  if (elections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Elections List</h2>
        </div>
        <div className="p-8 text-center">
          <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-xl font-medium text-gray-900 mb-2">
            No elections found
          </div>
          <div className="text-gray-500">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your filters to see more results"
              : "Create your first election to get started"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-black">Elections List</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Election
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {elections.map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ElectionTable;
