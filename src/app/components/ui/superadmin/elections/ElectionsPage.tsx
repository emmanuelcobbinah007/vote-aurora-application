"use client";

import React, { useState, useMemo } from "react";
import {
  useElections,
  useCreateElection,
  useUpdateElection,
  useDeleteElection,
} from "@/hooks";
import { toast } from "react-toastify";
import { ElectionsPageShimmer } from "@/app/components/ui/Shimmer";
import ElectionsFilters from "./ElectionsFilters";
import ElectionsStats from "./ElectionsStats";
import ElectionsTable from "./ElectionsTable";
import CreateElectionModal from "./CreateElectionModal";
import { Election } from "./ElectionTypes"; // Use local types for UI

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
  const updateElectionMutation = useUpdateElection();
  const deleteElectionMutation = useDeleteElection();

  // Extract elections array from response and convert data elections to UI elections
  const elections = useMemo(() => {
    if (!electionsResponse) return [];

    // Handle both paginated response and direct array
    const rawElections = Array.isArray(electionsResponse)
      ? electionsResponse
      : electionsResponse.elections || [];

    return rawElections.map(adaptElectionForUI);
  }, [electionsResponse]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );

  // Filter elections based on search and status
  const filteredElections = useMemo(() => {
    let filtered = elections;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (election: Election) =>
          election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (election.description &&
            election.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (election: Election) => election.status === statusFilter
      );
    }

    return filtered;
  }, [elections, searchTerm, statusFilter]);

  const handleCreateElection = async (electionData: Partial<Election>) => {
    try {
      // Convert UI data back to data format for API
      const apiData = {
        title: electionData.title || "",
        description: electionData.description || undefined,
        status: electionData.status || "DRAFT",
        start_time: electionData.start_time || new Date().toISOString(),
        end_time: electionData.end_time || new Date().toISOString(),
        created_by: "current-user-id", // Would be from auth context
        is_general: electionData.is_general || false,
        department: electionData.department || undefined,
      };

      await createElectionMutation.mutateAsync(apiData);

      // Show success toast
      toast.success("Election created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setIsCreateModalOpen(false);
      setSelectedElection(null);
    } catch (error) {
      console.error("Error creating election:", error);

      // Show error toast
      toast.error("Failed to create election. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleEditElection = async (electionData: Partial<Election>) => {
    if (!selectedElection) return;

    try {
      // Convert form data to API format - handle null to undefined conversion
      const updates = {
        title: electionData.title,
        description:
          electionData.description === null
            ? undefined
            : electionData.description,
        start_time: electionData.start_time,
        end_time: electionData.end_time,
        is_general: electionData.is_general,
        department:
          electionData.department === null
            ? undefined
            : electionData.department,
      };

      await updateElectionMutation.mutateAsync({
        id: selectedElection.id,
        updates,
      });

      // Show success toast
      toast.success("Election updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setIsCreateModalOpen(false);
      setSelectedElection(null);
    } catch (error) {
      console.error("Error editing election:", error);

      // Show error toast
      toast.error("Failed to update election. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      throw error;
    }
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

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const openEditModal = (election: Election) => {
    setSelectedElection(election);
    setIsCreateModalOpen(true);
  };

  const handleDeleteElection = async (electionId: string) => {
    try {
      await deleteElectionMutation.mutateAsync(electionId);

      // Show success toast
      toast.success("Election deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error deleting election:", error);

      // Show error toast
      toast.error("Failed to delete election. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
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

      <ElectionsFilters
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <ElectionsTable
        elections={filteredElections}
        onEditElection={openEditModal}
        onDeleteElection={handleDeleteElection}
        onViewDetails={onViewDetails}
      />

      <CreateElectionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedElection(null);
        }}
        onSave={selectedElection ? handleEditElection : handleCreateElection}
        selectedElection={selectedElection}
      />
    </div>
  );
};

export default ElectionsPage;
