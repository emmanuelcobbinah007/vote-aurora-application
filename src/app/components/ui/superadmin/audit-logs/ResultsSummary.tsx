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
    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 text-green-700">
        <span className="text-sm font-medium">
          {resultCount} result{resultCount !== 1 ? "s" : ""} found
        </span>
        {searchTerm && (
          <span className="text-sm">for &ldquo;{searchTerm}&rdquo;</span>
        )}
      </div>
      <button
        onClick={onClearAll}
        className="text-sm text-green-600 hover:text-green-800 font-medium"
      >
        Clear all
      </button>
    </div>
  );
};

export default ResultsSummary;
