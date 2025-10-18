"use client";
import React, { useState, useMemo } from "react";
import ApprovalCard from "./ApprovalCard";
import ApprovalsHeader from "./ApprovalsHeader";
import ApprovalsSearch from "./ApprovalsSearch";
import EmptyApprovalsState from "./EmptyApprovalsState";
import { useApprovals } from "@/app/hooks/useApprovals";
import Pagination from "../../shared/Pagination";
import {
  SearchBarShimmer,
  ApprovalShimmer,
} from "../../shared/shimmer/DashboardStyleShimmers";

const ApprovalsContainer: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Fixed page size

  // State for UI controls
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch approvals data using TanStack Query with pagination
  const {
    data: approvalsResponse,
    isLoading,
    error,
    refetch,
  } = useApprovals({
    page: currentPage,
    limit: pageSize,
  });

  const approvals = approvalsResponse?.approvals || [];
  const pagination = approvalsResponse?.pagination;

  // Simple filter logic (client-side filtering)
  const filteredApprovals = useMemo(() => {
    let filtered = approvals;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (approval) => approval.status === statusFilter
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (approval) =>
          approval.election.title.toLowerCase().includes(searchLower) ||
          approval.election.createdByName.toLowerCase().includes(searchLower) ||
          approval.election.department.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [approvals, searchTerm, statusFilter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle clearing search (reset pagination)
  const handleClearSearch = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Handle search change (reset pagination)
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle status filter change (reset pagination)
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Simple Header */}
      <ApprovalsHeader totalCount={approvals.length} />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <SearchBarShimmer />
          <ApprovalShimmer count={6} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || "An unexpected error occurred"}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - only show when not loading and no error */}
      {!isLoading && !error && (
        <>
          {/* Simple Search */}
          <ApprovalsSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            onClearSearch={handleClearSearch}
          />

          {/* Simple Results Count */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="text-sm text-gray-600">
              Showing {filteredApprovals.length} of {approvals.length} approvals
            </div>
          )}

          {/* Approvals List */}
          <div className="space-y-4">
            {filteredApprovals.length === 0 ? (
              <EmptyApprovalsState
                searchTerm={searchTerm}
                hasFilters={statusFilter !== "all"}
                onClearFilters={handleClearSearch}
              />
            ) : (
              filteredApprovals.map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ApprovalsContainer;
