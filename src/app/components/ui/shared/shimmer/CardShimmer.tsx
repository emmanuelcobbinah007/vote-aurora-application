import React from "react";

interface CardShimmerProps {
  height?: string;
  showActions?: boolean;
}

const CardShimmer: React.FC<CardShimmerProps> = ({
  height = "h-48",
  showActions = true,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${height}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
      </div>

      {/* Stats or additional info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex justify-end space-x-2">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default CardShimmer;
