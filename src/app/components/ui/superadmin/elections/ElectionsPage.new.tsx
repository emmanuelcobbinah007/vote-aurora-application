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

const ElectionsPage: React.FC<ElectionsPageProps> = ({ onViewDetails }) => {
  // Use TanStack Query for data fetching - following orchestrator pattern
  const {
    data: elections = [],
    isLoading,
    error,
  } = useElections();
  
  const createElectionMutation = useCreateElection();

  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );

  // Update filtered elections when elections data changes
  React.useEffect(() => {
    setFilteredElections(elections);
  }, [elections]);

  const handleCreateElection = async (electionData: Partial<Election>) => {
    try {
      await createElectionMutation.mutateAsync({
        title: electionData.title || "",
        description: electionData.description || "",
        status: electionData.status || "DRAFT",
        start_time: electionData.start_time || new Date().toISOString(),
        end_time: electionData.end_time || new Date().toISOString(),
        created_by: "current-user-id", // Would be from auth context
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
            {error instanceof Error ? error.message : 'Something went wrong'}
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
      <ElectionsStats elections={elections} />

      {/* Filters */}
      <ElectionsFilters
        elections={elections}
        onFilter={setFilteredElections}
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
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateElection}
          isSubmitting={createElectionMutation.isPending}
        />
      )}
    </div>
  );
};

export default ElectionsPage;
