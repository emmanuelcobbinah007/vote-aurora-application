"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Clock, Activity } from "lucide-react";
import { VotingTimeline } from "./individualElectionTypes";

interface IndividualVotingTimelineProps {
  votingTimeline: VotingTimeline;
  electionStatus: string;
}

const IndividualVotingTimeline: React.FC<IndividualVotingTimelineProps> = ({
  votingTimeline,
  electionStatus,
}) => {
  // Combine hourly votes and voters data for comprehensive timeline
  const combinedData = React.useMemo(() => {
    const votesByHour = new Map(
      votingTimeline.hourlyVotes.map((v) => [v.hour, v.votes || 0])
    );
    const votersByHour = new Map(
      votingTimeline.hourlyVoters.map((v) => [v.hour, v.voters || 0])
    );

    // Get all unique hours
    const allHours = new Set([
      ...votingTimeline.hourlyVotes.map((v) => v.hour),
      ...votingTimeline.hourlyVoters.map((v) => v.hour),
    ]);

    return Array.from(allHours)
      .sort()
      .map((hour) => ({
        hour: formatHourDisplay(hour),
        votes: votesByHour.get(hour) || 0,
        voters: votersByHour.get(hour) || 0,
        fullHour: hour,
      }));
  }, [votingTimeline]);

  function formatHourDisplay(hour: string): string {
    try {
      const date = new Date(hour);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      });
    } catch {
      return hour;
    }
  }

  const totalVotes = combinedData.reduce((sum, data) => sum + data.votes, 0);
  const totalVoters = combinedData.reduce((sum, data) => sum + data.voters, 0);
  const peakHour = combinedData.reduce(
    (peak, current) => (current.votes > peak.votes ? current : peak),
    combinedData[0] || { hour: "N/A", votes: 0 }
  );

  if (!combinedData.length) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Voting Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              {electionStatus === "DRAFT" ||
              electionStatus === "PENDING_APPROVAL"
                ? "Election has not started yet"
                : "No voting activity recorded"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Peak Hour</p>
                <p className="text-lg font-semibold text-gray-900">
                  {peakHour.hour}
                </p>
                <p className="text-xs text-gray-500">{peakHour.votes} votes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Votes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalVotes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Across all hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Periods</p>
                <p className="text-lg font-semibold text-gray-900">
                  {combinedData.length}
                </p>
                <p className="text-xs text-gray-500">Hours with activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Votes Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Votes Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "votes" ? "Votes Cast" : "Voters",
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="votes"
                  stroke="#cc910d"
                  strokeWidth={3}
                  dot={{ fill: "#cc910d", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#cc910d" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Voter Participation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Voter Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "voters" ? "Active Voters" : "Votes",
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar
                  dataKey="voters"
                  fill="#D97706"
                  name="voters"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Combined Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Combined Voting Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === "votes" ? "Votes Cast" : "Active Voters",
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="votes"
                stroke="#cc910d"
                strokeWidth={2}
                name="Votes Cast"
                dot={{ fill: "#cc910d", r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="voters"
                stroke="#D97706"
                strokeWidth={2}
                name="Active Voters"
                dot={{ fill: "#D97706", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualVotingTimeline;
