"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Vote,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
} from "lucide-react";

interface OverviewData {
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
}

interface DashboardSummaryCardsProps {
  overview: OverviewData;
}

const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  overview,
}) => {
  const summaryCards = [
    {
      title: "Total Elections",
      value: overview.totalElections,
      icon: Calendar,
      description: "All elections in system",
      color: "text-[#2ecc71]",
      bgColor: "bg-[#e6f9f1]",
    },
    {
      title: "Active Elections",
      value: overview.activeElections,
      icon: Clock,
      description: "Currently LIVE",
      color: "text-[#2ecc71]",
      bgColor: "bg-[#e6f9f1]",
    },
    {
      title: "Completed Elections",
      value: overview.completedElections,
      icon: CheckCircle,
      description: "Status: CLOSED",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Pending Approval",
      value: overview.pendingElections,
      icon: FileText,
      description: "Awaiting approval",
      color: "text-[#2ecc71]",
      bgColor: "bg-[#e6f9f1]",
    },
    {
      title: "Total Votes Cast",
      value: overview.totalVotes.toLocaleString(),
      icon: Vote,
      description: "Across all elections",
      color: "text-[#2ecc71]",
      bgColor: "bg-[#e6f9f1]",
    },
    {
      title: "Registered Users",
      value: overview.totalUsers.toLocaleString(),
      icon: Users,
      description: "All system users",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "System Administrators",
      value: overview.totalAdmins,
      icon: UserCheck,
      description: "Active admins",
      color: "text-[#2ecc71]",
      bgColor: "bg-[#e6f9f1]",
    },
    {
      title: "Total Portfolios",
      value: overview.totalPortfolios,
      icon: TrendingUp,
      description: "Election positions",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardSummaryCards;
