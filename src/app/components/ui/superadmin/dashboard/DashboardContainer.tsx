"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, BarChart3 } from "lucide-react";
import DashboardSummaryCards from "./DashboardSummaryCards";
import RecentActivity from "./RecentActivity";
import UpcomingElections from "./UpcomingElections";
import SystemHealth from "./SystemHealth";
import QuickActions from "./QuickActions";

export interface DashboardData {
  superadminId: string;
  overview: {
    totalElections: number;
    activeElections: number;
    completedElections: number;
    pendingElections: number;
    draftElections: number;
    totalVotes: number;
    totalUsers: number;
    totalAdmins: number;
    totalPortfolios: number;
    totalCandidates: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    type: string;
  }>;
  upcomingElections: Array<{
    id: string;
    title: string;
    start_time: string;
    status: string;
  }>;
  systemHealth: {
    status: string;
    uptime: string;
    activeUsers: number;
    systemLoad: number;
    databaseConnections?: number;
    pendingInvitations?: number;
  };
}

interface DashboardContainerProps {
  superadminId: string;
  dashboardData: DashboardData;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  superadminId,
  dashboardData,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-6 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 mt-2">
                Welcome back! Here's an overview of VoteAurora.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={`/superadmin/${superadminId}/analytics`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Button>
              </Link>
              <Link href={`/superadmin/${superadminId}/settings`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <DashboardSummaryCards overview={dashboardData.overview} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <RecentActivity
              activities={dashboardData.recentActivity}
              superadminId={superadminId}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions superadminId={superadminId} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Elections */}
          <UpcomingElections
            elections={dashboardData.upcomingElections}
            superadminId={superadminId}
          />

          {/* System Health */}
          <SystemHealth healthData={dashboardData.systemHealth} />
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
