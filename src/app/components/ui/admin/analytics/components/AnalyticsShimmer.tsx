import React from "react";

const AnalyticsShimmer: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Header Shimmer */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
      </div>

      {/* Stats Cards Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white p-6 rounded-lg shadow-sm border animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Charts Section Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Table Shimmer */}
      <div className="bg-white rounded-lg shadow-sm border animate-pulse">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-4 flex items-center space-x-4">
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/6"></div>
              <div className="h-4 bg-gray-100 rounded w-1/5"></div>
              <div className="h-4 bg-gray-100 rounded w-1/8"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Content Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white p-6 rounded-lg shadow-sm border animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-100 rounded w-full"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
              <div className="h-3 bg-gray-100 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsShimmer;
