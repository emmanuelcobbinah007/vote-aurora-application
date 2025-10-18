"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { FileText, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ApprovalsFilters from "@/components/ui/approver/ApprovalsFilters";
import ApprovalCard from "@/components/ui/approver/ApprovalCard";
import ApprovalDialogContent from "@/components/ui/approver/ApprovalDialogContent";
import { PendingApprovalsShimmer } from "../../../components/ui/approver/ApproverShimmer";
import ApprovalModal from "@/components/ui/approver/ApprovalModal";
import { toast } from "react-toastify";

interface Portfolio {
  id: string;
  title: string;
  description: string;
  election_id: string;
}

interface Candidate {
  id: string;
  full_name: string;
  photo_url: string | null;
  manifesto: string | null;
  portfolio_id: string;
  election_id: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  department: string;
  isGeneral: boolean;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  createdAt: string;
  portfolios: Portfolio[];
  candidates: Candidate[];
  expectedVoters: number;
}

interface PendingData {
  elections: Election[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    departments: string[];
  };
}

const PendingApprovalsPage: React.FC = () => {
  const params = useParams();
  const approverId = params.approverId as string;

  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [comments, setComments] = useState("");
  const [requestReview, setRequestReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler for opening election modal
  const handleViewElection = useCallback((election: Election) => {
    console.log("Setting selected election:", election);
    setSelectedElection(election);
  }, []);

  // Use ref to store current comments value to avoid closure issues
  const commentsRef = useRef("");
  commentsRef.current = comments;

  // Stable setComments function to prevent re-renders
  const handleSetComments = useCallback((value: string) => {
    setComments(value);
    commentsRef.current = value;
  }, []);

  useEffect(() => {
    fetchPendingElections();
  }, [approverId, currentPage, filterDepartment]);

  // Separate effect for search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchPendingElections();
      } else {
        setCurrentPage(1); // This will trigger the other useEffect
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchPendingElections = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(filterDepartment !== "all" && { department: filterDepartment }),
      });

      const response = await fetch(
        `/api/approvers/${approverId}/pending?${params}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pending elections");
      }
      const result = await response.json();
      setPendingData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [approverId, currentPage, searchQuery, filterDepartment]);

  const handleAction = useCallback(
    async (action: "approve" | "reject") => {
      if (!selectedElection) return;

      try {
        setIsSubmitting(true);

        const response = await fetch(`/api/approvers/${approverId}/actions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            electionId: selectedElection.id,
            action: action,
            comments: commentsRef.current || undefined,
            requestReview: action === "reject" ? requestReview : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process action");
        }

        const result = await response.json();
        toast.success(result.message);

        // Refresh the pending elections list
        await fetchPendingElections();

        // Close modal
        setSelectedElection(null);
        setActionType(null);
        setComments("");
        setRequestReview(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Action failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedElection, approverId, fetchPendingElections, requestReview]
  );

  const handleApprove = useCallback(() => {
    handleAction("approve");
  }, [handleAction]);

  const handleReject = useCallback(() => {
    handleAction("reject");
  }, [handleAction]);

  const handleRequestReview = useCallback(() => {
    setRequestReview(true);
    handleAction("reject");
  }, [handleAction]);

  if (loading) {
    return <PendingApprovalsShimmer />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Pending Approvals
          </h2>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => fetchPendingElections()}
            className="mt-4 bg-[#2ecc71] hover:bg-[#1e8e3e]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!pendingData) {
    return null;
  }

  const { elections, pagination, filters } = pendingData;

  // Filter elections based on search query (API handles main filtering)
  const filteredElections = elections.filter((election) => {
    const matchesSearch =
      !searchQuery ||
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        <ApprovalsFilters
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          department={filterDepartment}
          onDepartmentChange={setFilterDepartment}
          departments={filters.departments}
        />

        {/* Elections Grid */}
        {filteredElections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending elections found
              </h3>
              <p className="text-gray-500">
                {searchQuery || filterDepartment !== "all"
                  ? "Try adjusting your search filters"
                  : "There are no elections waiting for approval"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredElections.map((election) => (
              <div key={election.id}>
                <ApprovalCard item={election} onView={handleViewElection} />

                {selectedElection?.id === election.id && (
                  <ApprovalModal
                    isOpen={true}
                    onClose={() => setSelectedElection(null)}
                    title="Review Election"
                    footer={null}
                  >
                    <ApprovalDialogContent
                      election={selectedElection}
                      comments={comments}
                      setComments={handleSetComments}
                      requestReview={requestReview}
                      setRequestReview={setRequestReview}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      isSubmitting={isSubmitting}
                    />
                  </ApprovalModal>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovalsPage;
