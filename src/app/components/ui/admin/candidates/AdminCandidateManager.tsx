"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  Edit,
  Trash2,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useAdminCandidates,
  useCreateAdminCandidate,
  useUpdateAdminCandidate,
  useDeleteAdminCandidate,
  AdminContext,
  CreateCandidateRequest,
  UpdateCandidateRequest,
} from "@/hooks/useAdminCandidates";
import { usePortfolios } from "@/hooks/usePortfolios";
import AdminCreateCandidateModal from "@/app/components/ui/admin/candidates/AdminCreateCandidateModal";
import { Candidate, CandidateFormData } from "@/services/adminApi";

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  election_id: string;
  created_at?: string;
}

interface AdminCandidateManagerProps {
  electionId: string;
}

const AdminCandidateManager: React.FC<AdminCandidateManagerProps> = ({
  electionId,
}) => {
  const params = useParams();
  const adminId = params.adminId as string;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [filterPortfolioId, setFilterPortfolioId] = useState<string>("all");

  const adminContext: AdminContext = { adminId, electionId };

  const { data: portfolios = [], isLoading: portfoliosLoading } =
    usePortfolios(electionId);

  const {
    data: candidates = [],
    isLoading: candidatesLoading,
    error: candidatesError,
    refetch: refetchCandidates,
  } = useAdminCandidates(adminContext);

  const createCandidateMutation = useCreateAdminCandidate(adminContext);
  const updateCandidateMutation = useUpdateAdminCandidate(adminContext);
  const deleteCandidateMutation = useDeleteAdminCandidate(adminContext);

  const handleCreateCandidate = async (
    portfolioId: string,
    candidateData: CandidateFormData
  ) => {
    try {
      const request: CreateCandidateRequest = {
        portfolioId,
        candidateData,
      };
      await createCandidateMutation.mutateAsync(request);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating candidate:", error);
      throw error;
    }
  };

  const handleUpdateCandidate = async (
    candidateId: string,
    portfolioId: string,
    candidateData: CandidateFormData
  ) => {
    try {
      const request: UpdateCandidateRequest = {
        candidateId,
        candidateData: { ...candidateData, portfolio_id: portfolioId },
      };
      await updateCandidateMutation.mutateAsync(request);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating candidate:", error);
      throw error;
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this candidate? This action cannot be undone."
      )
    ) {
      try {
        await deleteCandidateMutation.mutateAsync(candidateId);
      } catch (error) {
        console.error("Error deleting candidate:", error);
      }
    }
  };

  // Open the create modal with a pre-selected portfolio
  const openCreateModalWithPortfolio = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId);
    setIsCreateModalOpen(true);
  };

  // Open the edit modal for a candidate
  const openEditModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsEditModalOpen(true);
  };

  // Filter the candidates based on the selected portfolio
  const filteredCandidates =
    filterPortfolioId === "all"
      ? candidates
      : candidates.filter((c) => c.portfolio_id === filterPortfolioId);

  // Group candidates by portfolio for display
  const candidatesByPortfolio: Record<string, Candidate[]> = {};

  filteredCandidates.forEach((candidate) => {
    const portfolioId = candidate.portfolio_id;
    if (!candidatesByPortfolio[portfolioId]) {
      candidatesByPortfolio[portfolioId] = [];
    }
    candidatesByPortfolio[portfolioId].push(candidate);
  });

  // Error state
  if (candidatesError) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 text-red-500 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-lg font-medium">Error loading candidates</h2>
        </div>
        <p className="text-gray-600 mb-4">
          There was an error loading the candidates. Please try again later.
        </p>
        <Button
          onClick={() => refetchCandidates()}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
      </Card>
    );
  }

  // Loading state
  if (candidatesLoading || portfoliosLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="mr-2 h-6 w-6 text-amber-600" />
            Candidates Management
          </h2>
          <p className="text-gray-600">
            Add, edit, or remove candidates for this election
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Portfolio filter */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Filter by portfolio:
          </span>
          <Badge
            className={`cursor-pointer ${
              filterPortfolioId === "all"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilterPortfolioId("all")}
          >
            All Portfolios
          </Badge>
          {portfolios.map((portfolio) => (
            <Badge
              key={portfolio.id}
              className={`cursor-pointer ${
                filterPortfolioId === portfolio.id
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setFilterPortfolioId(portfolio.id)}
            >
              {portfolio.title}
            </Badge>
          ))}
        </div>
      </div>

      {/* Portfolio sections with candidates */}
      {portfolios.length > 0 ? (
        portfolios.map((portfolio) => {
          // Skip portfolios that don't match the filter
          if (
            filterPortfolioId !== "all" &&
            filterPortfolioId !== portfolio.id
          ) {
            return null;
          }

          const portfolioCandidates = candidatesByPortfolio[portfolio.id] || [];

          return (
            <Card key={portfolio.id} className="overflow-hidden">
              <div className="bg-amber-50 p-4 border-b border-amber-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-amber-900">
                    {portfolio.title}
                  </h3>
                  <Button
                    onClick={() => openCreateModalWithPortfolio(portfolio.id)}
                    variant="outline"
                    className="border-amber-200 hover:border-amber-400 text-amber-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to {portfolio.title}
                  </Button>
                </div>
              </div>

              {/* Candidates list */}
              {portfolioCandidates.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {portfolioCandidates.map((candidate) => (
                    <li
                      key={candidate.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4 mb-2 md:mb-0">
                          {candidate.photo_url ? (
                            <img
                              src={candidate.photo_url}
                              alt={candidate.full_name}
                              className="w-12 h-12 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {candidate.full_name}
                            </h4>
                            {candidate.manifesto && (
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {candidate.manifesto.substring(0, 60)}
                                {candidate.manifesto.length > 60 ? "..." : ""}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-16 md:ml-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(candidate)}
                            className="border-gray-200 hover:border-amber-300 hover:text-amber-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCandidate(candidate.id)}
                            className="border-gray-200 hover:border-red-300 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <User className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-2 text-gray-600 font-medium">
                    No candidates yet
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Click the button above to add candidates for this portfolio.
                  </p>
                </div>
              )}
            </Card>
          );
        })
      ) : (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="mt-2 text-gray-600 font-medium">
            No portfolios available
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Portfolios must be created before adding candidates.
          </p>
        </Card>
      )}

      {/* Create Candidate Modal */}
      {isCreateModalOpen && (
        <AdminCreateCandidateModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedPortfolioId("");
          }}
          onSave={handleCreateCandidate}
          portfolios={portfolios}
          preselectedPortfolioId={selectedPortfolioId}
          title="Add New Candidate"
        />
      )}

      {/* Edit Candidate Modal */}
      {isEditModalOpen && selectedCandidate && (
        <AdminCreateCandidateModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCandidate(null);
          }}
          onSave={(portfolioId, candidateData) =>
            handleUpdateCandidate(
              selectedCandidate.id,
              portfolioId,
              candidateData
            )
          }
          portfolios={portfolios}
          selectedCandidate={selectedCandidate}
          title="Edit Candidate"
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default AdminCandidateManager;
