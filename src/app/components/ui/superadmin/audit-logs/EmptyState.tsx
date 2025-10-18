import React from "react";
import { Search } from "lucide-react";

interface EmptyStateProps {
  searchTerm: string;
  activeFilterCount: number;
  onClearFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  activeFilterCount,
  onClearFilters,
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No audit logs found
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm || activeFilterCount > 0
          ? "Try adjusting your search terms or filters to find what you're looking for."
          : "No audit logs are available at the moment."}
      </p>
      {(searchTerm || activeFilterCount > 0) && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default EmptyState;
