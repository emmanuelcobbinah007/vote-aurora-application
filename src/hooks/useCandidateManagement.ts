"use client";

import { useState } from "react";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { Candidate } from "@/services/adminApi";

interface CandidateFormData {
  full_name: string;
  photo_url?: string;
  manifesto?: string;
}

interface Election {
  portfolios?: Array<{ id: string; title: string }>;
}

interface CreateCandidateVariables {
  portfolioId: string;
  candidateData: CandidateFormData;
}

interface UpdateCandidateVariables {
  candidateId: string;
  candidateData: CandidateFormData & { portfolio_id?: string };
}

export function useCandidateManagement(
  candidates: Candidate[],
  election: Election | undefined,
  refetchCandidates: UseQueryResult["refetch"],
  createCandidateMutation: UseMutationResult<
    Candidate,
    Error,
    CreateCandidateVariables
  >,
  updateCandidateMutation: UseMutationResult<
    Candidate,
    Error,
    UpdateCandidateVariables
  >,
  deleteCandidateMutation: UseMutationResult<void, Error, string>,
  isElectionLocked: boolean = false
) {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(
    null
  );
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const handleAddCandidate = (portfolioId: string) => {
    if (isElectionLocked) {
      alert("Cannot add candidates when election is live or closed");
      return;
    }
    const portfolio = election?.portfolios?.find((p) => p.id === portfolioId);
    if (portfolio) {
      setSelectedPortfolio(portfolioId);
      setEditingCandidate(null);
      setIsEditMode(false);
      setIsCandidateModalOpen(true);
    }
  };

  const handleEditCandidate = (candidateId: string) => {
    if (isElectionLocked) {
      alert("Cannot edit candidates when election is live or closed");
      return;
    }
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate) {
      setEditingCandidate(candidate);
      setSelectedPortfolio(candidate.portfolio_id);
      setIsEditMode(true);
      setIsCandidateModalOpen(true);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await deleteCandidateMutation.mutateAsync(candidateId);
      } catch (error) {
        console.error("Failed to delete candidate:", error);
      }
    }
  };

  const handleSaveCandidate = async (
    portfolioId: string,
    candidateData: CandidateFormData
  ) => {
    try {
      if (isEditMode && editingCandidate) {
        await updateCandidateMutation.mutateAsync({
          candidateId: editingCandidate.id,
          candidateData,
        });
      } else {
        await createCandidateMutation.mutateAsync({
          portfolioId,
          candidateData,
        });
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save candidate:", error);
      throw error;
    }
  };

  const closeModal = () => {
    setIsCandidateModalOpen(false);
    setSelectedPortfolio(null);
    setEditingCandidate(null);
    setIsEditMode(false);
  };

  return {
    selectedPortfolio,
    isCandidateModalOpen,
    editingCandidate,
    isEditMode,
    handleAddCandidate,
    handleEditCandidate,
    handleDeleteCandidate,
    handleSaveCandidate,
    closeModal,
  };
}
