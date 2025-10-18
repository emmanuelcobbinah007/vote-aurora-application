import React from "react";
import { Zap, Vote, Users, Building2, TrendingUp } from "lucide-react";
import type { VoterEngagementProps } from "../types";
import { formatNumber, formatPercentage, formatTime } from "../utils";

const VoterEngagement: React.FC<VoterEngagementProps> = ({
  engagement,
  totalVoters,
  distinctVotersWhoVoted,
}) => {
  const maxVotes = Math.max(
    ...engagement.hourlyVotingPattern.map((h) => h.votes)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Voter Engagement
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Participation patterns and demographics
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Hourly voting pattern */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Voting Activity Timeline
          </h4>
          <div className="space-y-2">
            {engagement.hourlyVotingPattern.map((hour, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600 text-right">
                  {hour.hour}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="h-6 bg-green-600 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                    style={{
                      width: `${
                        maxVotes > 0 ? (hour.votes / maxVotes) * 100 : 0
                      }%`,
                      minWidth: hour.votes > 0 ? "24px" : "0",
                    }}
                  >
                    {hour.votes > 0 && (
                      <span className="text-white text-xs font-medium">
                        {formatNumber(hour.votes)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-600">
                  {formatNumber(hour.cumulative)} total
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Peak voting hour: {engagement.peakVotingHour}
              </span>
            </div>
          </div>
        </div>

        {/* Voter demographics */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Voter Demographics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {engagement.voterDemographics.map((demographic, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 text-center"
              >
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(demographic.count)}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {demographic.category}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-green-600 rounded-full"
                    style={{
                      width: `${demographic.percentage}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercentage(demographic.percentage)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department participation */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Department Participation
          </h4>
          <div className="space-y-3">
            {engagement.participationByDepartment.map((dept, index) => {
              const correctPercentage =
                dept.eligible > 0 ? (dept.voted / dept.eligible) * 100 : 0;
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">
                      {dept.department}
                    </h5>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(dept.voted)} /{" "}
                        {formatNumber(dept.eligible)}
                      </div>
                      <div className="text-sm text-gray-600">voters</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(correctPercentage, 100)}%`,
                        backgroundColor:
                          correctPercentage >= 50
                            ? "#2ecc71" // High engagement - primary green
                            : correctPercentage >= 25
                            ? "#52c41a" // Medium engagement - green-500
                            : "#73d13d", // Low engagement - green-400
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-green-600">
                      {formatPercentage(correctPercentage)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatNumber(dept.eligible - dept.voted)} not voted
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engagement summary */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">
            Engagement Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Vote className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(
                  engagement.hourlyVotingPattern.reduce(
                    (sum, h) => sum + h.votes,
                    0
                  )
                )}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Total Votes Cast
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(
                  totalVoters > 0
                    ? (distinctVotersWhoVoted / totalVoters) * 100
                    : 0
                )}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Overall Turnout
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {engagement.participationByDepartment.length}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Active Departments
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(
                  engagement.participationByDepartment.length > 0
                    ? engagement.participationByDepartment.reduce(
                        (sum, d) => sum + (d.voted / d.eligible) * 100,
                        0
                      ) / engagement.participationByDepartment.length
                    : 0
                )}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Avg Dept. Turnout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterEngagement;
