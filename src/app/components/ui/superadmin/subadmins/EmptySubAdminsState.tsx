"use client";
import React from "react";
import { Users, Search, Plus } from "lucide-react";

interface EmptySubAdminsStateProps {
  searchTerm: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  onAddSubAdmin: () => void;
}

const EmptySubAdminsState: React.FC<EmptySubAdminsStateProps> = ({
  searchTerm,
  hasFilters,
  onClearFilters,
  onAddSubAdmin,
}) => {
  const hasActiveFilters = searchTerm || hasFilters;

  if (hasActiveFilters) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No administrators found
          </h3>
          <p className="text-gray-600 mb-6">
            No administrators match your search criteria.
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
        <Users className="w-12 h-12 mx-auto mb-4 text-[#cc910d]" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No administrators yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start by adding election administrators who will help manage specific
          elections.
        </p>
        <button
          onClick={onAddSubAdmin}
          className="flex items-center space-x-2 mx-auto px-4 py-2 bg-[#cc910d] text-white rounded-lg hover:bg-[#b8820c] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Administrator</span>
        </button>
      </div>
    </div>
  );
};

export default EmptySubAdminsState;
