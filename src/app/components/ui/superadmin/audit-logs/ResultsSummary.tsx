import React from "react";

interface ResultsSummaryProps {
  searchTerm: string;
  activeFilterCount: number;
  resultCount: number;
  onClearAll: () => void;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  searchTerm,
  activeFilterCount,
  resultCount,
  onClearAll,
}) => {
  if (!searchTerm && activeFilterCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 text-amber-700">
        <span className="text-sm font-medium">
          {resultCount} result{resultCount !== 1 ? "s" : ""} found
        </span>
        {searchTerm && <span className="text-sm">for "{searchTerm}"</span>}
      </div>
      <button
        onClick={onClearAll}
        className="text-sm text-amber-600 hover:text-amber-800 font-medium"
      >
        Clear all
      </button>
    </div>
  );
};

export default ResultsSummary;
