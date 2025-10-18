import React from "react";

const StatCardSkeleton: React.FC = () => (
  <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const ActivityFeedSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200">
    <div className="p-4 md:p-6 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
    <div className="p-4 md:p-6">
      <div className="space-y-3 md:space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const QuickActionsSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
      ))}
    </div>
  </div>
);

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <ActivityFeedSkeleton />
      </div>

      {/* Quick Actions Skeleton */}
      <QuickActionsSkeleton />
    </div>
  );
};

export default DashboardSkeleton;
