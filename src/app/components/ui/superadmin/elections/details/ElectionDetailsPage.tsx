"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Components
import ElectionHeader from "./components/ElectionHeader";
import ElectionTabs, { ElectionTab } from "./components/ElectionTabs";
import OverviewTab from "./components/OverviewTab";
import CreateElectionModal from "@/app/components/ui/superadmin/elections/CreateElectionModal";

// Managers and Shimmers
import PortfolioManager from "@/app/components/ui/superadmin/elections/details/PortfolioManager";
import {
  PortfolioManagerShimmer,
  CandidateManagerShimmer,
  BallotSetupManagerShimmer,
  AuditResultsManagerShimmer,
} from "@/app/components/ui/Shimmer";
import CandidateManager from "@/app/components/ui/superadmin/elections/details/CandidateManager";
import BallotSetupManager from "@/app/components/ui/superadmin/elections/details/BallotSetupManager";
import AuditResultsManager from "@/app/components/ui/superadmin/elections/details/AuditResultsManager";

// Types and Hooks
import { ElectionWithDetails } from "@/data";
import { Election } from "@/app/components/ui/superadmin/elections/ElectionTypes";
import { Election as DataElection } from "@/data/elections";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useCandidates } from "@/hooks/useCandidates";
import { useUpdateElection, ELECTION_QUERY_KEYS } from "@/hooks/useElections";

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
  const queryClient = useQueryClient();
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
      department: election.department ?? null,
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

      // Show success message
      toast.success("Election updated successfully!");
    } catch (error) {
      console.error("Error editing election:", error);
      toast.error("Failed to update election. Please try again.");
      // Don't close modal on error so user can retry
    }
  };

  // Handle request approval
  const handleRequestApproval = async () => {
    if (requestingApproval) return;
    setRequestingApproval(true);
    try {
      const res = await fetch(`/api/superadmin/elections/${election.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING_APPROVAL" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to request approval");
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <ElectionHeader
          election={election}
          localStatus={localStatus}
          requestingApproval={requestingApproval}
          isSuperAdminPage={isSuperAdminPage}
          onBack={onBack}
          onEditElection={openEditModal}
          onRequestApproval={handleRequestApproval}
        />

        {/* Tabs Navigation */}
        <ElectionTabs
          activeTab={activeTab}
          tabLoading={tabLoading}
          onTabChange={handleTabChange}
          setActiveTab={setActiveTab}
        />

        {/* Tab Content */}
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <OverviewTab
            election={election}
            portfolios={portfolios}
            candidates={candidates}
            ballots={ballots}
            onTabChange={setActiveTab}
          />
        )}

        {/* Other Tab Contents */}
        {activeTab === "portfolios" &&
          (tabLoading["portfolios"] ? (
            <PortfolioManagerShimmer />
          ) : (
            <PortfolioManager electionId={election.id} election={election} />
          ))}

        {activeTab === "candidates" &&
          (tabLoading["candidates"] ? (
            <CandidateManagerShimmer />
          ) : (
            <CandidateManager electionId={election.id} election={election} />
          ))}

        {activeTab === "ballot-setup" &&
          (tabLoading["ballot-setup"] ? (
            <BallotSetupManagerShimmer />
          ) : (
            <BallotSetupManager electionId={election.id} election={election} />
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
