import React from "react";

interface ShimmerProps {
  width?: string;
  height?: string;
  className?: string;
}

const Shimmer: React.FC<ShimmerProps> = ({
  width = "w-full",
  height = "h-4",
  className = "",
}) => (
  <div
    className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`}
  />
);

export const DashboardShimmer = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto">
      {/* Header Shimmer */}
      <div className="mb-6">
        <Shimmer width="w-64" height="h-8" className="mb-2" />
        <Shimmer width="w-96" height="h-4" />
      </div>

      {/* Stats Grid Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Shimmer width="w-6" height="h-6" />
              <Shimmer width="w-16" height="h-4" />
            </div>
            <Shimmer width="w-12" height="h-8" className="mb-2" />
            <Shimmer width="w-24" height="h-4" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions Shimmer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <Shimmer width="w-32" height="h-6" />
          </div>
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Shimmer width="w-full" height="h-10" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Shimmer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <Shimmer width="w-40" height="h-6" />
          </div>
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-0"
              >
                <Shimmer width="w-8" height="h-8" className="rounded-full" />
                <div className="flex-1 space-y-2">
                  <Shimmer width="w-3/4" height="h-4" />
                  <Shimmer width="w-1/2" height="h-3" />
                </div>
                <Shimmer width="w-16" height="h-6" className="rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info Shimmer */}
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Shimmer width="w-32" height="h-6" className="mb-4" />
          <Shimmer width="w-full" height="h-32" />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Shimmer width="w-40" height="h-6" className="mb-4" />
          <Shimmer width="w-full" height="h-32" />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Shimmer width="w-36" height="h-6" className="mb-4" />
          <Shimmer width="w-full" height="h-32" />
        </div>
      </div>
    </div>
  </div>
);

export const PendingApprovalsShimmer = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Shimmer width="w-64" height="h-8" className="mb-2" />
        <Shimmer width="w-96" height="h-4" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <Shimmer width="w-64" height="h-10" />
          <Shimmer width="w-48" height="h-10" />
          <Shimmer width="w-32" height="h-10" />
        </div>
      </div>

      {/* Elections List */}
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Shimmer width="w-3/4" height="h-6" className="mb-2" />
                  <Shimmer width="w-full" height="h-4" className="mb-3" />
                  <div className="flex items-center space-x-4">
                    <Shimmer width="w-20" height="h-4" />
                    <Shimmer width="w-24" height="h-4" />
                    <Shimmer width="w-16" height="h-4" />
                  </div>
                </div>
                <Shimmer width="w-20" height="h-6" className="rounded-full" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="text-center">
                    <Shimmer
                      width="w-8"
                      height="h-8"
                      className="mx-auto mb-2"
                    />
                    <Shimmer
                      width="w-16"
                      height="h-4"
                      className="mx-auto mb-1"
                    />
                    <Shimmer width="w-20" height="h-3" className="mx-auto" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <Shimmer width="w-24" height="h-9" />
                <Shimmer width="w-20" height="h-9" />
                <Shimmer width="w-28" height="h-9" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <Shimmer key={i} width="w-10" height="h-10" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ApprovedElectionsShimmer = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Shimmer width="w-64" height="h-8" className="mb-2" />
        <Shimmer width="w-96" height="h-4" />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <Shimmer width="w-full" height="h-10" />
          </div>
          <Shimmer width="w-48" height="h-10" />
          <Shimmer width="w-32" height="h-10" />
          <Shimmer width="w-24" height="h-10" />
        </div>
      </div>

      {/* Elections Table/Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 pb-4 border-b border-gray-200">
            {[...Array(6)].map((_, i) => (
              <Shimmer key={i} width="w-full" height="h-4" />
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-4 py-4 border-b border-gray-100 last:border-0"
            >
              <div className="space-y-1">
                <Shimmer width="w-full" height="h-4" />
                <Shimmer width="w-3/4" height="h-3" />
              </div>
              <Shimmer width="w-full" height="h-4" />
              <Shimmer width="w-16" height="h-6" className="rounded-full" />
              <Shimmer width="w-full" height="h-4" />
              <div className="space-y-1">
                <Shimmer width="w-full" height="h-4" />
                <Shimmer width="w-1/2" height="h-3" />
              </div>
              <div className="flex space-x-2">
                <Shimmer width="w-8" height="h-8" />
                <Shimmer width="w-8" height="h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <Shimmer width="w-32" height="h-4" />
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <Shimmer key={i} width="w-10" height="h-10" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Shimmer;
