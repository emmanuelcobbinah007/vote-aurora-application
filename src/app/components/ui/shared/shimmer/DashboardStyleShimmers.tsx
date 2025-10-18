import React from "react";

// Base shimmer animation component matching the existing style
const ShimmerBase: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = "", style }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] ${className}`}
    style={style}
  />
);

// Search bar shimmer component
export const SearchBarShimmer: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <div className="flex flex-col md:flex-row gap-4">
      <ShimmerBase className="h-10 flex-1 rounded-lg" />
      <div className="flex gap-3">
        <ShimmerBase className="h-10 w-48 rounded-lg" />
        <ShimmerBase className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

// Audit log shimmer matching dashboard style
export const AuditLogShimmer: React.FC<{ count?: number }> = ({
  count = 5,
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, index) => (
      <div
        key={`audit-shimmer-${index}`}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-start space-x-4">
          {/* Action Icon */}
          <ShimmerBase className="w-10 h-10 rounded-full" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Action title */}
                <ShimmerBase className="h-4 w-1/3 rounded mb-2" />
                {/* Action details */}
                <div className="space-y-1">
                  <ShimmerBase className="h-3 w-3/4 rounded" />
                  <ShimmerBase className="h-3 w-1/2 rounded" />
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center ml-4">
                <ShimmerBase className="w-3 h-3 rounded mr-1" />
                <ShimmerBase className="h-3 w-12 rounded" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-1">
                <ShimmerBase className="w-3 h-3 rounded" />
                <ShimmerBase className="h-3 w-20 rounded" />
              </div>
              <ShimmerBase className="h-3 w-32 rounded" />
              <ShimmerBase className="h-3 w-24 rounded" />
            </div>

            {/* Entity Info */}
            <div className="mt-2">
              <ShimmerBase className="h-3 w-40 rounded" />
            </div>
          </div>

          {/* Date */}
          <div className="text-right">
            <ShimmerBase className="h-3 w-16 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Approval shimmer matching actual approval structure
export const ApprovalShimmer: React.FC<{ count?: number }> = ({
  count = 6,
}) => (
  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
    {Array.from({ length: count }, (_, index) => (
      <div
        key={`approval-shimmer-${index}`}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Title */}
            <ShimmerBase className="h-5 w-3/4 rounded mb-2" />
            {/* Description */}
            <ShimmerBase className="h-4 w-full rounded mb-2" />
            {/* User and date info */}
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <ShimmerBase className="w-4 h-4 rounded" />
                <ShimmerBase className="h-3 w-16 rounded" />
              </div>
              <div className="flex items-center space-x-1">
                <ShimmerBase className="w-4 h-4 rounded" />
                <ShimmerBase className="h-3 w-20 rounded" />
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center space-x-2 px-3 py-2 border rounded-lg">
            <ShimmerBase className="w-5 h-5 rounded-full" />
            <ShimmerBase className="h-4 w-16 rounded" />
          </div>
        </div>

        {/* Election Details */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <ShimmerBase className="h-3 w-2/3 rounded" />
            <ShimmerBase className="h-3 w-1/4 rounded" />
          </div>
        </div>

        {/* Notes Section */}
        <div className="border-t pt-4">
          <div className="flex items-start space-x-2">
            <ShimmerBase className="w-4 h-4 rounded mt-1" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <ShimmerBase className="h-3 w-16 rounded" />
                <ShimmerBase className="h-3 w-12 rounded" />
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <ShimmerBase className="h-3 w-full rounded mb-1" />
                <ShimmerBase className="h-3 w-3/4 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Election card shimmer matching dashboard style
export const ElectionCardShimmer: React.FC<{ count?: number }> = ({
  count = 6,
}) => (
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
            <ShimmerBase className="h-5 w-4/5 rounded mb-2" />
            {/* Description */}
            <ShimmerBase className="h-4 w-full rounded" />
          </div>
          {/* Status badge */}
          <ShimmerBase className="ml-2 px-2 py-1 h-6 w-16 rounded-full" />
        </div>

        {/* Election Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <ShimmerBase className="h-4 w-4 rounded" />
            <ShimmerBase className="h-3 w-32 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <ShimmerBase className="h-4 w-4 rounded" />
            <ShimmerBase className="h-3 w-28 rounded" />
          </div>
        </div>

        {/* Assigned Admins */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShimmerBase className="h-4 w-4 rounded" />
            <ShimmerBase className="h-4 w-32 rounded" />
          </div>

          {/* Admin list */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShimmerBase className="w-6 h-6 rounded-full" />
              <ShimmerBase className="h-3 w-24 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <ShimmerBase className="w-6 h-6 rounded-full" />
              <ShimmerBase className="h-3 w-28 rounded" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <ShimmerBase className="h-8 w-24 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export { ShimmerBase };
