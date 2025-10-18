"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const AnalyticsShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded-lg w-64 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-300 rounded-lg w-96 animate-pulse" />
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse" />
                <div className="h-8 w-8 bg-gray-300 rounded-lg animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-300 rounded w-16 mb-1 animate-pulse" />
                <div className="h-3 bg-gray-300 rounded w-20 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Chart */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-300 rounded animate-pulse" />
            </CardContent>
          </Card>

          {/* Right Chart */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-36 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-300 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Elections Table Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="h-6 bg-gray-300 rounded w-32 animate-pulse" />
            <div className="h-8 bg-gray-300 rounded w-20 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 pb-2 border-b border-gray-200">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-3 bg-gray-300 rounded animate-pulse"
                  />
                ))}
              </div>

              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-6 gap-4 py-2">
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="h-4 bg-gray-300 rounded animate-pulse"
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voting Trends Chart Skeleton */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-28 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-300 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Performance Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-5 bg-gray-300 rounded w-24 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-300 rounded w-20 mb-1 animate-pulse" />
                        <div className="h-2 bg-gray-300 rounded w-full animate-pulse" />
                      </div>
                      <div className="h-3 bg-gray-300 rounded w-12 animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsShimmer;
