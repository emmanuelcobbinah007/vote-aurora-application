"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Vote,
  Users,
  TrendingUp,
  Target,
  UserCheck,
  BarChart3,
  User,
  Briefcase,
} from "lucide-react";
import { ElectionMetrics } from "./individualElectionTypes";

interface IndividualElectionMetricsProps {
  metrics: ElectionMetrics;
}

const IndividualElectionMetrics: React.FC<IndividualElectionMetricsProps> = ({
  metrics,
}) => {
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    iconColor: string;
    subtitle?: string;
  }> = ({ title, value, icon, bgColor, iconColor, subtitle }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={`h-12 w-12 ${bgColor} rounded-lg flex items-center justify-center`}
          >
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Votes Cast"
        value={metrics.totalVotes.toLocaleString()}
        icon={<Vote className="h-6 w-6" />}
        bgColor="bg-amber-100"
        iconColor="text-[#cc910d]"
        subtitle="Ballots submitted"
      />

      <MetricCard
        title="Eligible Voters"
        value={metrics.totalEligibleVoters.toLocaleString()}
        icon={<Users className="h-6 w-6" />}
        bgColor="bg-amber-50"
        iconColor="text-amber-700"
        subtitle="Total voter tokens issued"
      />

      <MetricCard
        title="Voter Turnout"
        value={`${metrics.turnoutPercentage.toFixed(1)}%`}
        icon={<TrendingUp className="h-6 w-6" />}
        bgColor="bg-yellow-100"
        iconColor="text-[#cc910d]"
        subtitle={`${metrics.usedTokens} voters participated`}
      />

      <MetricCard
        title="Voting Efficiency"
        value={`${metrics.votingEfficiency.toFixed(1)}%`}
        icon={<Target className="h-6 w-6" />}
        bgColor="bg-orange-100"
        iconColor="text-amber-700"
        subtitle="Votes per participating voter"
      />

      <MetricCard
        title="Active Tokens"
        value={metrics.usedTokens.toLocaleString()}
        icon={<UserCheck className="h-6 w-6" />}
        bgColor="bg-amber-100"
        iconColor="text-[#cc910d]"
        subtitle="Tokens used for voting"
      />

      <MetricCard
        title="Portfolios"
        value={metrics.portfoliosCount}
        icon={<Briefcase className="h-6 w-6" />}
        bgColor="bg-yellow-50"
        iconColor="text-amber-600"
        subtitle="Positions available"
      />

      <MetricCard
        title="Candidates"
        value={metrics.candidatesCount}
        icon={<User className="h-6 w-6" />}
        bgColor="bg-orange-50"
        iconColor="text-[#cc910d]"
        subtitle="Total contestants"
      />

      <MetricCard
        title="Assigned Admins"
        value={metrics.assignedAdminsCount}
        icon={<BarChart3 className="h-6 w-6" />}
        bgColor="bg-amber-50"
        iconColor="text-amber-700"
        subtitle="Election managers"
      />
    </div>
  );
};

export default IndividualElectionMetrics;
