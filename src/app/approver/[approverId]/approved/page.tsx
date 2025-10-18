"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Filter,
  Search,
  Eye,
  BarChart3,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ApproverHeader from "@/components/ui/approver/ApproverHeader";
import { ApprovedElectionsShimmer } from "../../../components/ui/approver/ApproverShimmer";
import ApprovalsFilters from "@/components/ui/approver/ApprovalsFilters";
import ApprovalCard from "@/components/ui/approver/ApprovalCard";
import ApprovalDialogContent from "@/components/ui/approver/ApprovalDialogContent";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ApprovalModal from "@/components/ui/approver/ApprovalModal";

interface ApprovedElection {
  id: string;
  title: string;
  description?: string;
  department: string;
  isGeneral: boolean;
  startDate: string;
  endDate: string;
  status: "APPROVED" | "LIVE" | "CLOSED" | string;
  approvedBy?: string;
  approvedAt?: string;
  portfolios?: number;
  candidates?: number;
  expectedVoters?: number;
  actualVoters?: number;
  approverComments?: string;
}

interface ApprovedData {
  elections: ApprovedElection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    departments: string[];
    statuses: string[];
  };
}

const ApprovedElectionsPage = () => {
  const params = useParams();
  const approverId = params.approverId as string;

  const [approvedData, setApprovedData] = useState<ApprovedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedElection, setSelectedElection] =
    useState<ApprovedElection | null>(null);

  useEffect(() => {
    fetchApprovedElections();
  }, [approverId, currentPage, searchQuery, filterDepartment, filterStatus]);

  const fetchApprovedElections = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(filterDepartment !== "all" && { department: filterDepartment }),
        ...(filterStatus !== "all" && { status: filterStatus }),
      });

      const response = await fetch(
        `/api/approvers/${approverId}/approved?${params}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch approved elections");
      }
      const result = await response.json();
      setApprovedData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ApprovedElectionsShimmer />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Approved Elections
          </h2>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => fetchApprovedElections()}
            className="mt-4 bg-amber-600 hover:bg-amber-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!approvedData) {
    return null;
  }

  const { elections, pagination, filters } = approvedData;

  // Filter elections based on search query (API handles main filtering)
  const filteredElections = elections.filter((election) => {
    const matchesSearch =
      !searchQuery ||
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (election.description &&
        election.description.toLowerCase().includes(searchQuery.toLowerCase()));
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string }> = {
      APPROVED: { className: "bg-amber-100 text-amber-800", label: "Approved" },
      LIVE: { className: "bg-amber-100 text-amber-800", label: "Live" },
      CLOSED: { className: "bg-amber-100 text-amber-800", label: "Closed" },
      ARCHIVED: { className: "bg-amber-100 text-amber-800", label: "Archived" },
    };

    const config = statusConfig[status] ?? {
      className: "bg-gray-100 text-gray-800",
      label: status,
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTurnoutPercentage = (actual: number, expected: number) => {
    return ((actual / expected) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Approved</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {elections.length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Currently Live</p>
                  <p className="text-2xl font-bold text-green-600">
                    {elections.filter((e) => e.status === "LIVE").length}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {elections.filter((e) => e.status === "CLOSED").length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <ApprovalsFilters
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          department={filterDepartment}
          onDepartmentChange={setFilterDepartment}
          status={filterStatus}
          onStatusChange={setFilterStatus}
          departments={filters.departments}
        />

        {/* Elections Grid */}
        {filteredElections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No approved elections found
              </h3>
              <p className="text-gray-500">
                {searchQuery ||
                filterStatus !== "all" ||
                filterDepartment !== "all"
                  ? "Try adjusting your search filters"
                  : "You haven't approved any elections yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredElections.map((election) => (
              <div key={election.id}>
                <ApprovalCard
                  item={election as any}
                  onView={(it) => setSelectedElection(it as any)}
                  approvedPage={true}
                />

                {selectedElection?.id === election.id && (
                  <ApprovalModal
                    isOpen={true}
                    onClose={() => setSelectedElection(null)}
                    title="Election Details"
                    footer={null}
                  >
                    <ApprovalDialogContent
                      election={selectedElection}
                      comments={""}
                      setComments={() => {}}
                      onApprove={() => {}}
                      onReject={() => {}}
                      onRequestReview={() => {}}
                      isSubmitting={false}
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

export default ApprovedElectionsPage;
