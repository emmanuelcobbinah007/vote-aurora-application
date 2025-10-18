"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Settings,
  BarChart3,
  Edit,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { ElectionWithDetails } from "@/data";
import { Election as DataElection } from "@/data/elections";
import { ElectionTab } from "./ElectionDetailsTypes";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useCandidates } from "@/hooks/useCandidates";
import { useUpdateElection, ELECTION_QUERY_KEYS } from "@/hooks/useElections";
import { useQueryClient } from "@tanstack/react-query";
import {
  PortfolioManagerShimmer,
  CandidateManagerShimmer,
  BallotSetupManagerShimmer,
  AuditResultsManagerShimmer,
} from "@/app/components/ui/Shimmer";
import PortfolioManager from "./PortfolioManager";
import CandidateManager from "./CandidateManager";
import BallotSetupManager from "./BallotSetupManager";
import AuditResultsManager from "./AuditResultsManager";
import CreateElectionModal from "../CreateElectionModal";
import type { Election } from "../ElectionTypes";

interface ElectionDetailsPageProps {
  election: ElectionWithDetails;
  onBack: () => void;
  isSuperAdminPage?: boolean;
}

const ElectionDetailsPage: React.FC<ElectionDetailsPageProps> = ({
  election,
  onBack,
  isSuperAdminPage = true,
}) => {
  const [activeTab, setActiveTab] = useState<ElectionTab>("overview");
  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});
  const [requestingApproval, setRequestingApproval] = useState(false);
  const [localStatus, setLocalStatus] = useState(election.status);

  // Modal state for editing election
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );

  // TanStack Query hooks for portfolios and candidates
  const { data: portfolios = [] } = usePortfolios(election.id);
  const { data: candidates = [] } = useCandidates(election.id);

  // Update election mutation and query client for manual invalidation
  const updateElectionMutation = useUpdateElection();
  const queryClient = useQueryClient(); // Mock data - these would come from API calls
  const [ballots, setBallots] = useState(election.ballots || []);

  // Handle tab changes with loading simulation
  const handleTabChange = (tab: ElectionTab) => {
    if (tab !== activeTab) {
      setTabLoading((prev) => ({ ...prev, [tab]: true }));

      // Simulate API loading delay
      setTimeout(() => {
        setActiveTab(tab);
        setTabLoading((prev) => ({ ...prev, [tab]: false }));
      }, 800);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "LIVE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CLOSED":
        return "bg-red-100 text-red-800 border-red-200";
      case "ARCHIVED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "LIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING_APPROVAL":
        return <AlertCircle className="h-4 w-4" />;
      case "CLOSED":
      case "ARCHIVED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Open edit modal with current election data
  const openEditModal = () => {
    // Convert ElectionWithDetails to Election format for the modal
    const electionForModal: Election = {
      id: election.id,
      title: election.title,
      description: election.description || null,
      status: election.status,
      start_time: election.start_time,
      end_time: election.end_time,
      created_at: election.created_at,
      updated_at: election.updated_at,
      created_by: election.created_by || "current-user-id",
      approved_by: election.approved_by || null,
      is_general: election.is_general || false,
      department: election.department || null,
      creator: {
        full_name: "Current User", // TODO: Get from auth context
        email: "user@example.com", // TODO: Get from auth context
      },
      portfolios: [], // Modal doesn't need portfolios data
    };

    setSelectedElection(electionForModal);
    setIsEditModalOpen(true);
  };

  // Handle election edit submission
  const handleEditElection = async (electionData: Partial<Election>) => {
    if (!selectedElection) return;

    try {
      // Convert form data to API format - handle null to undefined conversion
      const updates: Partial<DataElection> = {
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

      // Close modal
      setIsEditModalOpen(false);
      setSelectedElection(null);

      // Manually invalidate the election details query to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ELECTION_QUERY_KEYS.detail(selectedElection.id),
      });

      // Show success message - you might want to add toast notification here
      toast.success("Election updated successfully!");
    } catch (error) {
      console.error("Error editing election:", error);
      toast.error("Failed to update election. Please try again.");
      // Don't close modal on error so user can retry
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {isSuperAdminPage && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="p-2 hover:cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {election.title}
              </h1>
              <p className="text-gray-600 mt-1">
                Election Details & Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge
              className={`flex items-center space-x-1 ${getStatusColor(
                localStatus
              )}`}
            >
              {getStatusIcon(localStatus)}
              <span>{localStatus.replace(/_/g, " ")}</span>
            </Badge>
            {/* Request Approval Button - visible only for superadmins and when not already pending/approved/live */}
            {isSuperAdminPage &&
              localStatus !== "PENDING_APPROVAL" &&
              localStatus !== "APPROVED" &&
              localStatus !== "LIVE" &&
              localStatus !== "CLOSED" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    if (requestingApproval) return;
                    setRequestingApproval(true);
                    try {
                      const res = await fetch(
                        `/api/superadmin/elections/${election.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "PENDING_APPROVAL" }),
                        }
                      );
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(
                          err?.message || "Failed to request approval"
                        );
                      }
                      const updated = await res.json();
                      // update local status for immediate UI feedback
                      setLocalStatus(updated.status);
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.error(e);
                    } finally {
                      setRequestingApproval(false);
                    }
                  }}
                  className="flex items-center space-x-2"
                >
                  {requestingApproval ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Request Approval</span>
                  )}
                </Button>
              )}
            <Button
              variant="outline"
              onClick={openEditModal}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Election</span>
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              disabled={tabLoading["overview"]}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "overview"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${
                tabLoading["overview"] ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={
                activeTab === "overview"
                  ? { borderColor: "#cc910d", color: "#cc910d" }
                  : {}
              }
            >
              <FileText className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleTabChange("portfolios")}
              disabled={tabLoading["portfolios"]}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "portfolios"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${
                tabLoading["portfolios"] ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={
                activeTab === "portfolios"
                  ? { borderColor: "#cc910d", color: "#cc910d" }
                  : {}
              }
            >
              <Settings className="h-4 w-4" />
              <span>Portfolios</span>
            </button>
            <button
              onClick={() => handleTabChange("candidates")}
              disabled={tabLoading["candidates"]}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "candidates"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${
                tabLoading["candidates"] ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={
                activeTab === "candidates"
                  ? { borderColor: "#cc910d", color: "#cc910d" }
                  : {}
              }
            >
              <Users className="h-4 w-4" />
              <span>Candidates</span>
            </button>
            <button
              onClick={() => handleTabChange("ballot-setup")}
              disabled={tabLoading["ballot-setup"]}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "ballot-setup"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${
                tabLoading["ballot-setup"]
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={
                activeTab === "ballot-setup"
                  ? { borderColor: "#cc910d", color: "#cc910d" }
                  : {}
              }
            >
              <Calendar className="h-4 w-4" />
              <span>Ballot Setup</span>
            </button>
            <button
              onClick={() => handleTabChange("audit-results")}
              disabled={tabLoading["audit-results"]}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === "audit-results"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${
                tabLoading["audit-results"]
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={
                activeTab === "audit-results"
                  ? { borderColor: "#cc910d", color: "#cc910d" }
                  : {}
              }
            >
              <BarChart3 className="h-4 w-4" />
              <span>Audit & Results</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Election Info Card */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText
                    className="h-5 w-5 mr-2"
                    style={{ color: "#cc910d" }}
                  />
                  Election Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <p className="text-gray-900 mt-1">{election.title}</p>
                  </div>
                  {election.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <p className="text-gray-600 mt-1">
                        {election.description}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <p className="text-gray-900 mt-1 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-green-600" />
                        {formatDate(election.start_time)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <p className="text-gray-900 mt-1 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-red-600" />
                        {formatDate(election.end_time)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Stats Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3
                    className="h-5 w-5 mr-2"
                    style={{ color: "#cc910d" }}
                  />
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Portfolios</span>
                    <span className="font-semibold text-gray-900">
                      {portfolios.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Candidates</span>
                    <span className="font-semibold text-gray-900">
                      {candidates.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ballot Items</span>
                    <span className="font-semibold text-gray-900">
                      {ballots.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <Badge className={getStatusColor(election.status)}>
                      {election.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Next Steps Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Next Steps
              </h3>
              <div className="space-y-3">
                {portfolios.length === 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-yellow-600 mr-3" />
                      <span className="text-yellow-800">
                        Add portfolios (positions) to your election
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("portfolios")}
                      style={{ backgroundColor: "#cc910d" }}
                      className="text-white"
                    >
                      Add Portfolios
                    </Button>
                  </div>
                )}
                {portfolios.length > 0 && candidates.length === 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-blue-800">
                        Add candidates to your portfolios
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("candidates")}
                      style={{ backgroundColor: "#cc910d" }}
                      className="text-white"
                    >
                      Add Candidates
                    </Button>
                  </div>
                )}
                {candidates.length > 0 && ballots.length === 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-green-800">
                        Configure ballot order and structure
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("ballot-setup")}
                      style={{ backgroundColor: "#cc910d" }}
                      className="text-white"
                    >
                      Setup Ballot
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Other Tab Contents */}
        {activeTab === "portfolios" &&
          (tabLoading["portfolios"] ? (
            <PortfolioManagerShimmer />
          ) : (
            <PortfolioManager electionId={election.id} />
          ))}

        {activeTab === "candidates" &&
          (tabLoading["candidates"] ? (
            <CandidateManagerShimmer />
          ) : (
            <CandidateManager electionId={election.id} />
          ))}

        {activeTab === "ballot-setup" &&
          (tabLoading["ballot-setup"] ? (
            <BallotSetupManagerShimmer />
          ) : (
            <BallotSetupManager electionId={election.id} />
          ))}

        {activeTab === "audit-results" &&
          (tabLoading["audit-results"] ? (
            <AuditResultsManagerShimmer />
          ) : (
            <AuditResultsManager election={election} />
          ))}
      </div>

      {/* Edit Election Modal */}
      <CreateElectionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedElection(null);
        }}
        onSave={handleEditElection}
        selectedElection={selectedElection}
      />
    </div>
  );
};

export default ElectionDetailsPage;
