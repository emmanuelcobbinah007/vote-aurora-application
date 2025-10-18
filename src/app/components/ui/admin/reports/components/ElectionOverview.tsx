import React from "react";
import {
  Users,
  Vote,
  BarChart3,
  Clipboard,
  UserCheck,
  Clock,
} from "lucide-react";
import type { ElectionOverviewProps } from "../types";
import { formatNumber, formatPercentage, formatDuration } from "../utils";

const ElectionOverview: React.FC<ElectionOverviewProps> = ({
  election,
  votingStats,
}) => {
  const metrics = [
    {
      label: "Total Voters",
      value: formatNumber(votingStats.totalVoters),
      icon: Users,
      color: "bg-green-500", // Consistent with dashboard theme
    },
    {
      label: "Votes Cast",
      value: formatNumber(votingStats.totalVotes),
      icon: Vote,
      color: "bg-green-600", // Consistent with dashboard theme
    },
    {
      label: "Turnout Rate",
      value: formatPercentage(votingStats.turnoutPercentage),
      icon: BarChart3,
      color: "bg-green-600", // Consistent with dashboard theme
    },
    {
      label: "Portfolios",
      value: formatNumber(election._count.portfolios),
      icon: Clipboard,
      color: "bg-green-500", // Consistent with dashboard theme
    },
    {
      label: "Candidates",
      value: formatNumber(election._count.candidates),
      icon: UserCheck,
      color: "bg-green-600", // Consistent with dashboard theme
    },
    {
      label: "Voting Rate",
      value: `${formatNumber(votingStats.votingRate)}/hr`,
      icon: Clock,
      color: "bg-green-500", // Consistent with dashboard theme
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Election Overview
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Key metrics and statistics for {election.title}
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-2 ${metric.color}`}
                >
                  <IconComponent size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional election info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {formatDuration(election.start_time, election.end_time)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Election Type
              </dt>
              <dd className="text-lg font-semibold text-gray-900">
                {election.is_general ? "General" : "Departmental"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {election.department || "All Departments"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ElectionOverview;
