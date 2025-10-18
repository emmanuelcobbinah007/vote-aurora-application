import React from "react";

interface ApprovalCardShimmerProps {
  count?: number;
}

const ApprovalCardShimmer: React.FC<ApprovalCardShimmerProps> = ({
  count = 6,
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`approval-shimmer-${index}`}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Title */}
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
              {/* Description */}
              <div className="h-4 bg-gray-100 rounded animate-pulse mb-2 w-full"></div>
              {/* User and date info */}
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center space-x-2 px-3 py-2 border rounded-lg">
              <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>

          {/* Election Details */}
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="border-t pt-4">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mt-1"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalCardShimmer;
