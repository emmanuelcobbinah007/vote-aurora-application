"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  ElectionWithDetails,
  Portfolio,
} from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";
import { apiClient } from "@/services/apiClient";

import { useBallotOrder, useUpdateBallotOrder } from "@/hooks/useBallots";
import {
  useAdminCandidates,
  useCreateAdminCandidate,
  useUpdateAdminCandidate,
  useDeleteAdminCandidate,
  AdminContext,
} from "@/hooks/useAdminCandidates";
import { useCandidateManagement } from "@/hooks/useCandidateManagement";
import { useOrderedPortfolios } from "@/hooks/useOrderedPortfolios";

import BallotOrderSection from "@/app/components/ui/admin/ballot/BallotOrderSection";
import CandidatesSection from "@/app/components/ui/admin/ballot/CandidatesSection";
import LoadingState from "@/app/components/ui/admin/ballot/LoadingState";
import ErrorState from "@/app/components/ui/admin/ballot/ErrorState";
import AdminCreateCandidateModal from "@/app/components/ui/admin/candidates/AdminCreateCandidateModal";

const fetchAdminAssignedElection = async (
  adminId: string
): Promise<ElectionWithDetails> => {
  const response = await apiClient.get(`/admin/${adminId}/assigned-election`);
  return response.data;
};

const BallotAndCandidatesPage = () => {
  const params = useParams();
  const router = useRouter();
  const adminId = params.adminId as string;

  const {
    data: election,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-assigned-election", adminId],
    queryFn: () => fetchAdminAssignedElection(adminId),
    staleTime: 5 * 60 * 1000,
  });

  const electionId = election?.id || "";
  const adminContext: AdminContext = { adminId, electionId };
  const { data: ballotOrder } = useBallotOrder(electionId);

  const {
    data: candidates = [],
    refetch: refetchCandidates,
    isLoading: candidatesLoading,
  } = useAdminCandidates(adminContext);
  const createCandidateMutation = useCreateAdminCandidate(adminContext);
  const updateCandidateMutation = useUpdateAdminCandidate(adminContext);
  const deleteCandidateMutation = useDeleteAdminCandidate(adminContext);

  const orderedPortfolios = useOrderedPortfolios(election, ballotOrder);

  const isFullyLoading = isLoading || candidatesLoading;

  const handleBack = () => {
    router.push(`/admin/${adminId}/dashboard`);
  };

  const handleBallotOrderChange = async (newOrder: Portfolio[]) => {
    toast.warning(
      "Ballot order can only be modified by super administrators.",
      {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  // Check if election is live or closed (disable editing)
  const isElectionLocked =
    election?.status === "LIVE" || election?.status === "CLOSED";

  const {
    selectedPortfolio,
    isCandidateModalOpen,
    editingCandidate,
    isEditMode,
    handleAddCandidate,
    handleEditCandidate,
    handleDeleteCandidate,
    handleSaveCandidate,
    closeModal,
  } = useCandidateManagement(
    candidates,
    election,
    refetchCandidates,
    createCandidateMutation,
    updateCandidateMutation,
    deleteCandidateMutation,
    isElectionLocked
  );

  if (isFullyLoading) {
    return <LoadingState />;
  }

  if (isError || !election) {
    return <ErrorState onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6">
        <BallotOrderSection
          portfolios={orderedPortfolios}
          onBallotOrderChange={handleBallotOrderChange}
        />

        <CandidatesSection
          portfolios={orderedPortfolios}
          candidates={candidates}
          onAddCandidate={handleAddCandidate}
          onEditCandidate={handleEditCandidate}
          onDeleteCandidate={handleDeleteCandidate}
          isElectionLocked={isElectionLocked}
        />
      </div>

      <AdminCreateCandidateModal
        isOpen={isCandidateModalOpen}
        onClose={closeModal}
        onSave={handleSaveCandidate}
        portfolios={orderedPortfolios}
        selectedCandidate={editingCandidate}
        preselectedPortfolioId={selectedPortfolio || undefined}
        title={isEditMode ? "Edit Candidate" : "Add New Candidate"}
        isEditMode={isEditMode}
        isElectionLocked={isElectionLocked}
      />
    </div>
  );
};

export default BallotAndCandidatesPage;
