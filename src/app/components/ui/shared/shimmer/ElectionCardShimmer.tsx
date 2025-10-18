import React from "react";

interface ElectionCardShimmerProps {
  count?: number;
}

const ElectionCardShimmer: React.FC<ElectionCardShimmerProps> = ({
  count = 6,
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`election-shimmer-${index}`}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Title */}
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-4/5"></div>
              {/* Description */}
              <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
            </div>
            {/* Status badge */}
            <div className="ml-2 px-2 py-1 bg-gray-200 rounded-full animate-pulse h-6 w-16"></div>
          </div>

          {/* Election Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-28"></div>
            </div>
          </div>

          {/* Assigned Admins */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>

            {/* Admin list */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-28"></div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ElectionCardShimmer;
