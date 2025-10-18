"use client";
import React from "react";
import { FileText, Search } from "lucide-react";

interface EmptyApprovalsStateProps {
  searchTerm: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

const EmptyApprovalsState: React.FC<EmptyApprovalsStateProps> = ({
  searchTerm,
  hasFilters,
  onClearFilters,
}) => {
  const hasActiveFilters = searchTerm || hasFilters;

  if (hasActiveFilters) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No approvals found
          </h3>
          <p className="text-gray-600 mb-6">
            No election approvals match your search criteria.
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-[#cc910d] text-white rounded-lg hover:bg-[#b8820c] transition-colors"
          >
            Clear search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
      <div className="max-w-md mx-auto">
        <FileText className="w-12 h-12 mx-auto mb-4 text-[#cc910d]" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No approvals yet
        </h3>
        <p className="text-gray-600">
          Election proposals will appear here when they are submitted for
          approval.
        </p>
      </div>
    </div>
  );
};

export default EmptyApprovalsState;
