import React from "react";

interface AuditLogShimmerProps {
  count?: number;
}

const AuditLogShimmer: React.FC<AuditLogShimmerProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={`audit-shimmer-${index}`}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-start space-x-4">
            {/* Action Icon */}
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Action title */}
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3 mb-2"></div>
                  {/* Action details */}
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center ml-4">
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse mr-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>

              {/* Entity Info */}
              <div className="mt-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-40"></div>
              </div>
            </div>

            {/* Date */}
            <div className="text-right">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuditLogShimmer;
