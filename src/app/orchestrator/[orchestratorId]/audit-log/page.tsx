"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  AuditLogItem,
  SearchAndFilters,
  PaginationControls,
  FilterModal,
  fetchAuditLogs,
  useFilteredLogs,
  usePagination,
  countActiveFilters,
  exportToCSV,
  exportToJSON,
  FilterOptions,
} from "../../../components/ui/orchestrator/audit-log";

const AuditLogPage = () => {
  const params = useParams();
  const orchestratorId = params.orchestratorId as string;

  // State for filtering, search, and modal
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: "",
    dateTo: "",
    userId: "",
    action: "",
    entityType: "",
    entityId: "",
  });

  // Fetch audit logs
  const {
    data: auditLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auditLogs", orchestratorId],
    queryFn: () => fetchAuditLogs(orchestratorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and search logs
  const filteredLogs = useFilteredLogs(auditLogs, searchTerm, filters);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Count active filters
  const activeFilterCount = countActiveFilters(filters);

  // Event handlers
  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      userId: "",
      action: "",
      entityType: "",
      entityId: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredLogs, "audit-logs");
  };

  const handleExportJSON = () => {
    exportToJSON(filteredLogs, "audit-logs");
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading audit logs. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:px-6 md:py-4 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      {/* Header with Search and Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterClick={() => setIsFilterModalOpen(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        activeFilterCount={activeFilterCount}
      />

      {/* Results Summary */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="text-sm text-gray-600">
          Showing {filteredLogs.length} of {auditLogs?.length || 0} results
          {(searchTerm || activeFilterCount > 0) && (
            <button
              onClick={handleClearFilters}
              className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="space-y-3 md:space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audit logs found
            </h3>
            <p className="text-gray-500 mb-4 text-sm md:text-base px-4">
              {searchTerm || activeFilterCount > 0
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : "No audit logs are available at the moment."}
            </p>
            {(searchTerm || activeFilterCount > 0) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          paginatedLogs.map((log: any, index: number) => (
            <AuditLogItem key={log.id} log={log} index={index} />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredLogs.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        onApplyFilters={() => {
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default AuditLogPage;
