"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";
import ApproverStatsGrid from "@/components/ui/approver/ApproverStatsGrid";
import { DashboardShimmer } from "../../../components/ui/approver/ApproverShimmer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface DashboardStats {
  pendingApprovals: number;
  approvedElections: number;
  totalRejected: number;
  thisMonthApprovals: number;
  averageApprovalTime: string;
}

interface RecentActivity {
  id: string;
  action: string;
  electionTitle: string;
  timestamp: string;
  status: string;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  deadline: string;
  priority: "high" | "medium" | "low";
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
}

const ApproverDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const approverId = params.approverId as string;

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/approvers/${approverId}/dashboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const result = await response.json();
        setDashboardData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (approverId) {
      fetchDashboardData();
    }
  }, [approverId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (action: string | undefined | null) => {
    if (!action) {
      return <FileText className="w-4 h-4 text-gray-600" />;
    }

    if (action.includes("APPROVE")) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (action.includes("REJECT")) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    } else {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getActivityBadge = (status: string) => {
    const statusConfig: {
      [key: string]: { className: string; label: string };
    } = {
      APPROVED: { className: "bg-green-100 text-green-800", label: "Approved" },
      REJECTED: { className: "bg-red-100 text-red-800", label: "Rejected" },
      REVIEW_REQUESTED: {
        className: "bg-green-100 text-green-800",
        label: "Review Requested",
      },
    };

    const config = statusConfig[status] || {
      className: "bg-gray-100 text-gray-800",
      label: status,
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return <DashboardShimmer />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#2ecc71] hover:bg-[#1e8e3e]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, recentActivity = [], upcomingDeadlines = [] } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        <ApproverStatsGrid
          stats={{
            pendingApprovals: stats.pendingApprovals,
            approvedElections: stats.approvedElections,
            liveElections: 0, // You might need to calculate this from approved elections
            totalVotesOverseen: 0, // This would need to be calculated separately
          }}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#2ecc71]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() =>
                  router.push(`/approver/${session?.user?.id}/pending`)
                }
                className="w-full justify-start bg-[#2ecc71] hover:bg-[#1e8e3e] text-white"
              >
                <Clock className="w-4 h-4 mr-2" />
                Review Pending Approvals ({stats.pendingApprovals})
              </Button>

              <Button
                onClick={() =>
                  router.push(`/approver/${session?.user?.id}/approved`)
                }
                variant="outline"
                className="w-full justify-start border-green-200 text-gray-700 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                View Approved Elections ({stats.approvedElections})
              </Button>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Performance Metrics
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Average Approval Time
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {stats.averageApprovalTime}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-[#2ecc71]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.action)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.electionTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    {getActivityBadge(activity.status)}
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApproverDashboard;
