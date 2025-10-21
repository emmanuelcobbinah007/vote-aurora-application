"use client";
import React from "react";
import { X, RotateCcw } from "lucide-react";

interface ApprovalsSummaryProps {
  searchTerm: string;
  activeFilterCount: number;
  resultCount: number;
  totalCount: number;
  onClearAll: () => void;
}

const ApprovalsSummary: React.FC<ApprovalsSummaryProps> = ({
  searchTerm,
  activeFilterCount,
  resultCount,
  totalCount,
  onClearAll,
}) => {
  const hasActiveFilters = searchTerm || activeFilterCount > 0;
  const isFiltered = resultCount !== totalCount;

  if (!hasActiveFilters && !isFiltered) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="font-medium text-gray-900">
              {resultCount.toLocaleString()}
            </span>
            <span className="text-gray-600 ml-1">
              {resultCount === 1 ? "result" : "results"}
            </span>
            {isFiltered && (
              <>
                <span className="text-gray-500 mx-2">of</span>
                <span className="text-gray-700">
                  {totalCount.toLocaleString()} total
                </span>
              </>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filtered by:</span>
              <div className="flex items-center space-x-2">
                {searchTerm && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                    <span>Search: &ldquo;{searchTerm}&rdquo;</span>
                  </div>
                )}
                {activeFilterCount > 0 && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-[#cc910d]/10 text-[#cc910d] rounded-lg text-xs">
                    <span>
                      {activeFilterCount} filter
                      {activeFilterCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Results Message */}
      {resultCount === 0 && hasActiveFilters && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              No approvals found matching your criteria. Try adjusting your
              search or filters.
            </span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {resultCount > 0 && hasActiveFilters && (
        <div className="mt-3 text-xs text-gray-500">
          {searchTerm &&
            `Searching across titles, descriptions, creators, reviewers, and notes. `}
          {activeFilterCount > 0 &&
            `Active filters: status, priority, and department selections.`}
        </div>
      )}
    </div>
  );
};

export default ApprovalsSummary;
