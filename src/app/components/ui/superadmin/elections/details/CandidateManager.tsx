"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  Edit,
  Trash2,
  User,
  FileText,
  AlertCircle,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  Lock,
} from "lucide-react";
import {
  Portfolio,
  Candidate,
  CandidateFormData,
} from "./ElectionDetailsTypes";
import {
  useCandidates,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate,
} from "@/hooks/useCandidates";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useElectionWithDetails } from "@/hooks/useElections";
import CreateCandidateModal from "./CreateCandidateModal";

interface CandidateManagerProps {
  electionId: string;
  election?: {
    status: string;
  };
}

const CandidateManager: React.FC<CandidateManagerProps> = ({
  electionId,
  election,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [filterPortfolioId, setFilterPortfolioId] = useState<string>("all");

  // Get election details to check status - use passed election or fetch if not provided
  const { data: fetchedElection } = useElectionWithDetails(electionId);
  const electionData = election || fetchedElection;

  // TanStack Query hooks
  const { data: portfolios = [], isLoading: portfoliosLoading } =
    usePortfolios(electionId);

  const {
    data: candidates = [],
    isLoading: candidatesLoading,
    error: candidatesError,
    refetch: refetchCandidates,
  } = useCandidates(electionId);

  const createCandidateMutation = useCreateCandidate(electionId);
  const updateCandidateMutation = useUpdateCandidate(electionId);
  const deleteCandidateMutation = useDeleteCandidate(electionId);

  const isLoading = candidatesLoading || portfoliosLoading;

  // Check if election is locked (LIVE or CLOSED)
  const isElectionLocked =
    electionData?.status === "LIVE" || electionData?.status === "CLOSED";

  const handleAddCandidate = async (
    portfolioId: string,
    candidateData: CandidateFormData
  ) => {
    try {
      await createCandidateMutation.mutateAsync({ portfolioId, candidateData });
      setIsCreateModalOpen(false);
      setSelectedPortfolioId("");
    } catch (error) {
      // Error is handled by the mutation hook
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleEditCandidate = async (candidateData: CandidateFormData) => {
    if (!selectedCandidate) return;

    try {
      await updateCandidateMutation.mutateAsync({
        candidateId: selectedCandidate.id,
        candidateData,
      });
      setIsEditModalOpen(false);
      setSelectedCandidate(null);
    } catch (error) {
      // Error is handled by the mutation hook
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (isElectionLocked) return;

    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const voteCount = candidate._count?.votes || 0;
    const confirmMessage =
      voteCount > 0
        ? `This candidate has received ${voteCount} vote(s). Cannot delete candidates with votes.`
        : "Are you sure you want to delete this candidate? This action cannot be undone.";

    if (voteCount > 0) {
      // Show warning for candidates with votes
      return;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    await deleteCandidateMutation.mutateAsync(candidateId);
  };

  const openCreateModal = (portfolioId?: string) => {
    if (isElectionLocked) return;
    setSelectedPortfolioId(portfolioId || "");
    setIsCreateModalOpen(true);
  };

  const openEditModal = (candidate: Candidate) => {
    if (isElectionLocked) return;
    setSelectedCandidate(candidate);
    setIsEditModalOpen(true);
  };

  const getPortfolioName = (portfolioId: string) => {
    const portfolio = portfolios.find((p) => p.id === portfolioId);
    return portfolio?.title || "Unknown Portfolio";
  };

  const filteredCandidates =
    filterPortfolioId === "all"
      ? candidates
      : candidates.filter(
          (candidate) => candidate.portfolio_id === filterPortfolioId
        );

  const getCandidatesByPortfolio = () => {
    const result: { [portfolioId: string]: Candidate[] } = {};
    filteredCandidates.forEach((candidate) => {
      if (!result[candidate.portfolio_id]) {
        result[candidate.portfolio_id] = [];
      }
      result[candidate.portfolio_id].push(candidate);
    });
    return result;
  };

  if (portfolios.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No portfolios available
        </h3>
        <p className="text-gray-500 mb-4">
          You need to create portfolios first before adding candidates.
        </p>
        <Button variant="outline" className="text-gray-600">
          Go to Portfolios Tab
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2" style={{ color: "#cc910d" }} />
            Candidate Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage candidates for each portfolio in this election
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetchCandidates()}
            variant="outline"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => openCreateModal()}
            disabled={isElectionLocked}
            className="text-white flex items-center space-x-2"
            style={{
              backgroundColor: isElectionLocked ? "#9ca3af" : "#cc910d",
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Candidate</span>
          </Button>
        </div>
      </div>

      {/* Election Locked Warning */}
      {isElectionLocked && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-orange-900">
                Candidate Management Locked
              </h4>
              <p className="text-sm text-orange-700 mt-1">
                Candidate modifications are not allowed while the election is{" "}
                {electionData?.status?.toLowerCase()}. You can view candidates
                but cannot add, edit, or delete them until the election ends.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Filter by Portfolio:
            </span>
            <select
              value={filterPortfolioId}
              onChange={(e) => setFilterPortfolioId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-opacity-50"
              style={
                {
                  "--tw-ring-color": "#cc910d",
                } as React.CSSProperties
              }
            >
              <option value="all">All Portfolios</option>
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.title}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredCandidates.length} candidate
            {filteredCandidates.length !== 1 ? "s" : ""} total
          </div>
        </div>
      </Card>

      {/* Candidates Display */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <Card key={j} className="p-4">
                    <div className="animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterPortfolioId === "all"
              ? "No candidates yet"
              : `No candidates for ${getPortfolioName(filterPortfolioId)}`}
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding candidates to your portfolios.
          </p>
          <Button
            onClick={() =>
              openCreateModal(
                filterPortfolioId !== "all" ? filterPortfolioId : ""
              )
            }
            disabled={isElectionLocked}
            className="text-white"
            style={{
              backgroundColor: isElectionLocked ? "#9ca3af" : "#cc910d",
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Candidate
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(getCandidatesByPortfolio()).map(
            ([portfolioId, portfolioCandidates]) => (
              <div key={portfolioId}>
                {/* Portfolio Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getPortfolioName(portfolioId)}
                    </h3>
                    <Badge variant="secondary">
                      {portfolioCandidates.length} candidate
                      {portfolioCandidates.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCreateModal(portfolioId)}
                    disabled={isElectionLocked}
                    className="flex items-center space-x-1"
                    title={
                      isElectionLocked
                        ? "Candidate creation is locked while election is live or closed"
                        : "Add candidate"
                    }
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Candidate</span>
                  </Button>
                </div>

                {/* Candidates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Candidate Photo */}
                        <div className="flex-shrink-0">
                          {candidate.photo_url ? (
                            <img
                              src={candidate.photo_url}
                              alt={candidate.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {candidate.full_name}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
                            {getPortfolioName(candidate.portfolio_id)}
                          </p>

                          {candidate.manifesto && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {candidate.manifesto}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                            <div className="flex flex-col text-xs text-gray-500">
                              <span>
                                Added{" "}
                                {new Date(
                                  candidate.created_at
                                ).toLocaleDateString()}
                              </span>
                              {candidate._count?.votes !== undefined && (
                                <span className="text-blue-600 font-medium">
                                  {candidate._count.votes} vote(s)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(candidate)}
                                disabled={isElectionLocked}
                                className="p-1.5"
                                title={
                                  isElectionLocked
                                    ? "Candidate editing is locked while election is live or closed"
                                    : "Edit candidate"
                                }
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCandidate(candidate.id)
                                }
                                disabled={isElectionLocked}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent"
                                title={
                                  isElectionLocked
                                    ? "Candidate deletion is locked while election is live or closed"
                                    : "Delete candidate"
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              About Candidates
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Candidates are individuals who are running for specific portfolios
              in your election. Each candidate must be assigned to exactly one
              portfolio. You can add photos and manifestos to help voters make
              informed decisions.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Candidate Modal */}
      <CreateCandidateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedPortfolioId("");
        }}
        onSave={handleAddCandidate}
        portfolios={portfolios}
        preselectedPortfolioId={selectedPortfolioId}
        title="Add New Candidate"
      />

      {/* Edit Candidate Modal */}
      <CreateCandidateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCandidate(null);
        }}
        onSave={(_: string, candidateData: CandidateFormData) =>
          handleEditCandidate(candidateData)
        }
        portfolios={portfolios}
        selectedCandidate={selectedCandidate}
        title="Edit Candidate"
        isEditMode
      />
    </div>
  );
};

export default CandidateManager;
