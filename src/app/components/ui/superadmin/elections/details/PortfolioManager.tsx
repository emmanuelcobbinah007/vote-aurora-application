"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Settings,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  Users,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Portfolio, PortfolioFormData } from "./ElectionDetailsTypes";
import {
  usePortfolios,
  useCreatePortfolio,
  useUpdatePortfolio,
  useDeletePortfolio,
} from "@/hooks/usePortfolios";
import { useElectionWithDetails } from "@/hooks/useElections";
import CreatePortfolioModal from "./CreatePortfolioModal";

interface PortfolioManagerProps {
  electionId: string;
  election?: {
    status: string;
  };
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  electionId,
  election,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get election details to check status - use passed election or fetch if not provided
  const { data: fetchedElection } = useElectionWithDetails(electionId);
  const electionData = election || fetchedElection;

  // TanStack Query hooks
  const {
    data: portfolios = [],
    isLoading,
    error,
    refetch,
  } = usePortfolios(electionId);

  const createPortfolioMutation = useCreatePortfolio(electionId);
  const updatePortfolioMutation = useUpdatePortfolio(electionId);
  const deletePortfolioMutation = useDeletePortfolio(electionId);

  // Check if election is locked (LIVE or CLOSED)
  const isElectionLocked =
    electionData?.status === "LIVE" || electionData?.status === "CLOSED";

  const handleAddPortfolio = async (portfolioData: PortfolioFormData) => {
    try {
      await createPortfolioMutation.mutateAsync(portfolioData);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation hook
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleEditPortfolio = async (portfolioData: PortfolioFormData) => {
    if (!selectedPortfolio) return;

    try {
      await updatePortfolioMutation.mutateAsync({
        portfolioId: selectedPortfolio.id,
        portfolioData,
      });
      setIsEditModalOpen(false);
      setSelectedPortfolio(null);
    } catch (error) {
      // Error is handled by the mutation hook
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (isElectionLocked) return;

    const portfolio = portfolios.find((p) => p.id === portfolioId);
    if (!portfolio) return;

    const candidateCount = portfolio._count?.candidates || 0;
    const confirmMessage =
      candidateCount > 0
        ? `This portfolio has ${candidateCount} candidate(s). Please remove all candidates before deleting the portfolio.`
        : "Are you sure you want to delete this portfolio? This action cannot be undone.";

    if (candidateCount > 0) {
      // Show warning for portfolios with candidates
      return;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    await deletePortfolioMutation.mutateAsync(portfolioId);
  };

  const openEditModal = (portfolio: Portfolio) => {
    if (isElectionLocked) return;
    setSelectedPortfolio(portfolio);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2" style={{ color: "#cc910d" }} />
            Portfolio Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage the positions/portfolios for this election
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
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
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isElectionLocked}
            className="text-white flex items-center space-x-2"
            style={{
              backgroundColor: isElectionLocked ? "#9ca3af" : "#cc910d",
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Add Portfolio</span>
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
                Portfolio Management Locked
              </h4>
              <p className="text-sm text-orange-700 mt-1">
                Portfolio modifications are not allowed while the election is{" "}
                {electionData?.status?.toLowerCase()}. You can view portfolios
                but cannot add, edit, or delete them until the election ends.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Portfolios List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No portfolios yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first portfolio (position) to this
            election.
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isElectionLocked}
            className="text-white"
            style={{
              backgroundColor: isElectionLocked ? "#9ca3af" : "#cc910d",
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Portfolio
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {portfolio.title}
                  </h3>
                  {portfolio.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {portfolio.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(portfolio)}
                    disabled={isElectionLocked}
                    className="p-2"
                    title={
                      isElectionLocked
                        ? "Portfolio editing is locked while election is live or closed"
                        : "Edit portfolio"
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePortfolio(portfolio.id)}
                    disabled={isElectionLocked}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent"
                    title={
                      isElectionLocked
                        ? "Portfolio deletion is locked while election is live or closed"
                        : "Delete portfolio"
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {portfolio._count?.candidates || 0} candidate(s)
                    </span>
                  </div>
                  <span>
                    {new Date(portfolio.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              About Portfolios
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Portfolios represent the different positions or roles that
              candidates can run for in your election. Examples include
              President, Vice President, Secretary, Treasurer, etc. Each
              portfolio can have multiple candidates.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Portfolio Modal */}
      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleAddPortfolio}
        title="Create New Portfolio"
      />

      {/* Edit Portfolio Modal */}
      <CreatePortfolioModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPortfolio(null);
        }}
        onSave={handleEditPortfolio}
        selectedPortfolio={selectedPortfolio}
        title="Edit Portfolio"
      />
    </div>
  );
};

export default PortfolioManager;
