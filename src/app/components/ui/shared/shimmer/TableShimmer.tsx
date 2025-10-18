import React from "react";

interface TableShimmerProps {
  rows?: number;
  columns?: number;
}

const TableShimmer: React.FC<TableShimmerProps> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="w-full bg-white rounded-lg shadow overflow-hidden">
      {/* Header Shimmer */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }, (_, index) => (
            <div
              key={`header-${index}`}
              className="h-4 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Rows Shimmer */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="px-6 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              {Array.from({ length: columns }, (_, colIndex) => (
                <div key={`cell-${rowIndex}-${colIndex}`} className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  {colIndex === 0 && (
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableShimmer;
