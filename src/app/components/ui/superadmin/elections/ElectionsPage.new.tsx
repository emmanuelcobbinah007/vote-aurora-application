"use client";

import React, { useState } from "react";
import { useElections, useCreateElection } from "@/hooks";
import { ElectionsPageShimmer } from "@/app/components/ui/Shimmer";
import ElectionsFilters from "./ElectionsFilters";
import ElectionsStats from "./ElectionsStats";
import ElectionsTable from "./ElectionsTable";
import CreateElectionModal from "./CreateElectionModal";
import { Election } from "./ElectionTypes";

interface ElectionsPageProps {
  onViewDetails?: (election: Election) => void;
}

// Adapter function to convert data types to UI types
const adaptElectionForUI = (dataElection: any): Election => {
  // The API already returns the correct structure, so we just need to ensure type compatibility
  return {
    ...dataElection,
    description: dataElection.description || null, // Convert undefined to null
    department: dataElection.department || null, // Convert undefined to null
    approved_by: dataElection.approved_by || null,
    // API already provides creator, portfolios, and _count, so use them as-is
    creator: dataElection.creator || {
      full_name: "Unknown User",
      email: "unknown@uni.edu",
    },
    portfolios: dataElection.portfolios || [],
    _count: dataElection._count || { votes: 0, candidates: 0, portfolios: 0 },
  };
};

const ElectionsPage: React.FC<ElectionsPageProps> = ({ onViewDetails }) => {
  // Use TanStack Query for data fetching - following orchestrator pattern
  const { data: electionsResponse, isLoading, error } = useElections();

  const createElectionMutation = useCreateElection();

  // Extract elections array from response
  const elections = electionsResponse?.elections.map(adaptElectionForUI) || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  ); // Update filtered elections when elections data changes
  React.useEffect(() => {
    setFilteredElections(elections);
  }, [elections]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleCreateElection = async (electionData: Partial<Election>) => {
    try {
      await createElectionMutation.mutateAsync({
        title: electionData.title || "",
        description: electionData.description || "",
        status: electionData.status || "DRAFT",
        start_time: electionData.start_time || new Date().toISOString(),
        end_time: electionData.end_time || new Date().toISOString(),
        created_by: "current-user-id", // Would be from auth context
        is_general: electionData.is_general || false,
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating election:", error);
      // Handle error appropriately (show toast, etc.)
    }
  };

  const handleDeleteElection = (electionId: string) => {
    if (!confirm("Are you sure you want to delete this election?")) return;

    // TODO: Implement delete mutation
    const updatedElections = filteredElections.filter(
      (election) => election.id !== electionId
    );
    setFilteredElections(updatedElections);
  };

  // Show loading shimmer following orchestrator pattern
  if (isLoading) {
    return <ElectionsPageShimmer />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading elections</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Elections</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Election
        </button>
      </div>

      {/* Stats */}
      <ElectionsStats
        totalElections={filteredElections.length}
        liveElections={
          filteredElections.filter((e: Election) => e.status === "LIVE").length
        }
        draftElections={
          filteredElections.filter((e: Election) => e.status === "DRAFT").length
        }
        closedElections={
          filteredElections.filter((e: Election) => e.status === "CLOSED")
            .length
        }
      />

      {/* Filters */}
      <ElectionsFilters
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* Table */}
      <ElectionsTable
        elections={filteredElections}
        onViewDetails={onViewDetails}
        onDeleteElection={handleDeleteElection}
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateElectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateElection}
          selectedElection={null}
        />
      )}
    </div>
  );
};

export default ElectionsPage;
