"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Users, Vote, Folder, Loader2 } from "lucide-react";
import { Election } from "./ElectionTypes";
import StatusBadge from "./StatusBadge";
import Swal from "sweetalert2";

interface ElectionsTableProps {
  elections: Election[];
  onViewElection?: (election: Election) => void;
  onEditElection?: (election: Election) => void;
  onDeleteElection?: (electionId: string) => void;
  onViewDetails?: (election: Election) => void;
}

const ElectionsTable: React.FC<ElectionsTableProps> = ({
  elections,
  onEditElection,
  onDeleteElection,
  onViewDetails,
}) => {
  const [deletingElectionId, setDeletingElectionId] = useState<string | null>(
    null
  );
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteElection = async (electionId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. This will permanently delete the election and all associated data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setDeletingElectionId(electionId);
      try {
        await onDeleteElection?.(electionId);
      } finally {
        setDeletingElectionId(null);
      }
    }
  };

  if (elections.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">
            <Vote className="h-16 w-16 mx-auto text-gray-400" />
          </div>
          <div className="text-xl font-medium text-gray-900 mb-2">
            No elections found
          </div>
          <div className="text-gray-500">
            Try adjusting your filters to see more results or create your first
            election to get started
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Elections List</CardTitle>
      </CardHeader>
      <CardContent>
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
                <tr
                  key={election.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {election.title}
                      </div>
                      {election.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {election.description.length > 60
                            ? `${election.description.substring(0, 60)}...`
                            : election.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={election.status} />
                  </td>
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
                    <div className="text-sm space-y-1">
                      <div className="flex items-center text-gray-900">
                        <Vote className="h-4 w-4 mr-2 text-[#2ecc71]" />
                        {election._count?.votes || 0} votes
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-2 text-[#2ecc71]" />
                        {election._count?.candidates || 0} candidates
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Folder className="h-4 w-4 mr-2 text-[#2ecc71]" />
                        {election._count?.portfolios || 0} portfolios
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {election.creator.full_name}
                      </div>
                      <div className="text-gray-500">
                        {election.creator.email}
                      </div>
                      {election.approver && (
                        <div className="text-xs text-green-600 mt-1">
                          Approved by {election.approver.full_name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails?.(election)}
                        className="text-[#2ecc71] hover:text-[#27ae60] hover:bg-[#2ecc71]/10"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditElection?.(election)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {(election.status === "DRAFT" ||
                        election.status === "PENDING_APPROVAL") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteElection(election.id)}
                          disabled={deletingElectionId === election.id}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingElectionId === election.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElectionsTable;
