import React from "react";

const ReportsShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header shimmer */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-6">
            <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview shimmer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Voting Progress shimmer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voter Engagement shimmer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="w-36 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-56 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Candidate Performance shimmer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-72 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
                {[...Array(2)].map((_, portfolioIndex) => (
                  <div
                    key={portfolioIndex}
                    className="border border-gray-200 rounded-lg"
                  >
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="p-4 space-y-3">
                      {[...Array(3)].map((_, candidateIndex) => (
                        <div
                          key={candidateIndex}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                          <div className="text-right">
                            <div className="w-12 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsShimmer;
