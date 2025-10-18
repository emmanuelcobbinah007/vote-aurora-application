"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const DashboardShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-8 bg-gray-300 rounded-lg w-80 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-300 rounded-lg w-96 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-300 rounded-lg w-24 animate-pulse" />
              <div className="h-10 bg-gray-300 rounded-lg w-24 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, index) => (
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

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="h-6 bg-gray-300 rounded w-32 animate-pulse" />
                <div className="h-8 bg-gray-300 rounded w-20 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-48 mb-2 animate-pulse" />
                        <div className="h-3 bg-gray-300 rounded w-64 mb-2 animate-pulse" />
                        <div className="h-3 bg-gray-300 rounded w-20 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-300 rounded w-28 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-24 mb-1 animate-pulse" />
                          <div className="h-3 bg-gray-300 rounded w-32 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-gray-300 rounded animate-pulse" />
                    <div className="h-8 bg-gray-300 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Elections */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="h-6 bg-gray-300 rounded w-36 animate-pulse" />
              <div className="h-8 bg-gray-300 rounded w-20 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-4 bg-gray-300 rounded w-48 animate-pulse" />
                      <div className="h-6 bg-gray-300 rounded w-16 animate-pulse" />
                    </div>
                    <div className="h-3 bg-gray-300 rounded w-40 mb-3 animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-gray-300 rounded w-20 animate-pulse" />
                      <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-28 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-300 rounded w-40 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="h-3 bg-gray-300 rounded w-20 animate-pulse" />
                        <div className="h-4 bg-gray-300 rounded w-12 animate-pulse" />
                      </div>
                      <div className="h-2 bg-gray-300 rounded w-full mb-1 animate-pulse" />
                      <div className="h-2 bg-gray-300 rounded w-24 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="h-6 bg-gray-300 rounded w-12 mx-auto mb-1 animate-pulse" />
                    <div className="h-3 bg-gray-300 rounded w-20 mx-auto animate-pulse" />
                  </div>
                  <div>
                    <div className="h-6 bg-gray-300 rounded w-16 mx-auto mb-1 animate-pulse" />
                    <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardShimmer;
