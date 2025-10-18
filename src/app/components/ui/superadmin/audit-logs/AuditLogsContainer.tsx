"use client";
import React, { useState, useMemo } from "react";
import AuditLogCard from "./AuditLogCard";
import AuditLogHeader from "./AuditLogHeader";
import AuditLogSearch from "./AuditLogSearch";
import ResultsSummary from "./ResultsSummary";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";
import { AuditLog } from "./auditTypes";
import { formatAction as formatActionHelper } from "./auditHelpers";
import { useAuditLogs } from "@/app/hooks/useAuditLogs";
import {
  SearchBarShimmer,
  AuditLogShimmer,
} from "../../shared/shimmer/DashboardStyleShimmers";

const AuditLogsContainer: React.FC = () => {
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState("");

  // Build query parameters for API
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: 20, // Fixed page size
    };

    // Add selected action filter to query params
    if (selectedAction) {
      params.action = selectedAction;
    }

    return params;
  }, [selectedAction, currentPage]);

  // Fetch audit logs using TanStack Query
  const {
    data: auditLogsResponse,
    isLoading,
    error,
    refetch,
  } = useAuditLogs(queryParams);

  const auditLogs = auditLogsResponse?.logs || [];

  console.log("Audit logs data:", auditLogs);
  console.log("Audit logs length:", auditLogs?.length);

  // Filtering and search logic (client-side for search term)
  const filteredAndSearchedLogs = useMemo(() => {
    if (!auditLogs) return [];

    let filtered = auditLogs;

    // Apply search filter (client-side)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log: AuditLog) =>
          log.action.toLowerCase().includes(searchLower) ||
          log.userName.toLowerCase().includes(searchLower) ||
          log.userEmail.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower) ||
          log.entityType.toLowerCase().includes(searchLower) ||
          formatActionHelper(log.action).toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [auditLogs, searchTerm]);

  // Get active filter count for display
  const activeFilterCount = selectedAction ? 1 : 0;

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedAction("");
    setCurrentPage(1); // Reset to first page when clearing all
  };

  // Handler for action changes that resets pagination
  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    setCurrentPage(1); // Reset to first page when action changes
  };

  // Handler for search changes that resets pagination
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handler for page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <AuditLogHeader
        selectedAction={selectedAction}
        onActionChange={handleActionChange}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <SearchBarShimmer />
          <AuditLogShimmer count={8} />
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
          {/* Search Bar */}
          <AuditLogSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

          {/* Results Summary */}
          <ResultsSummary
            searchTerm={searchTerm}
            activeFilterCount={activeFilterCount}
            resultCount={filteredAndSearchedLogs.length}
            onClearAll={handleClearAll}
          />

          {/* Audit Logs List */}
          <div className="space-y-4">
            {filteredAndSearchedLogs?.length === 0 ? (
              <EmptyState
                searchTerm={searchTerm}
                activeFilterCount={activeFilterCount}
                onClearFilters={handleClearAll}
              />
            ) : (
              filteredAndSearchedLogs?.map((log: AuditLog, index: number) => (
                <AuditLogCard key={log.id} log={log} index={index} />
              ))
            )}
          </div>

          {/* Pagination */}
          {auditLogsResponse &&
            auditLogsResponse.pagination &&
            auditLogsResponse.pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={auditLogsResponse.pagination.totalPages}
                totalCount={auditLogsResponse.pagination.totalCount}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
        </>
      )}
    </div>
  );
};

export default AuditLogsContainer;
