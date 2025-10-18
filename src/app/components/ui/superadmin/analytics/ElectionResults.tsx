"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Crown,
  Medal,
  Users,
  BarChart3,
  Download,
  Vote,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCandidateColor } from "../../admin/reports/utils";

interface ElectionResultsProps {
  electionData: {
    id: string;
    title: string;
    status: string;
    totalVotes: number;
    portfoliosCount: number;
    candidatesCount: number;
  };
  candidatePerformance: Array<{
    name: string;
    portfolio: string;
    votes: number;
    percentage: number;
  }>;
  portfolioDistribution: Array<{
    name: string;
    votes: number;
    percentage: number;
  }>;
}

const ElectionResults: React.FC<ElectionResultsProps> = ({
  electionData,
  candidatePerformance,
  portfolioDistribution,
}) => {
  // Group candidates by portfolio to determine winners
  const portfolioResults = portfolioDistribution.reduce((acc, portfolio) => {
    const portfolioCandidates = candidatePerformance.filter(
      (candidate) => candidate.portfolio === portfolio.name
    );

    // Sort by votes to find winner
    const sortedCandidates = [...portfolioCandidates].sort(
      (a, b) => b.votes - a.votes
    );

    acc[portfolio.name] = {
      ...portfolio,
      candidates: sortedCandidates,
      winner: sortedCandidates[0],
    };

    return acc;
  }, {} as Record<string, any>);

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Vote className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPositionStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 1:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case 2:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Election Overview Header */}
      <div className="bg-white border-2 border-amber-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-amber-600" />
              {electionData.title} - Final Results
            </h1>
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-amber-600" />
                <span>
                  {electionData.totalVotes.toLocaleString()} votes cast
                </span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-1 text-amber-600" />
                <span>{electionData.portfoliosCount} positions</span>
              </div>
              <div className="flex items-center">
                <Vote className="h-4 w-4 mr-1 text-amber-600" />
                <span>{electionData.candidatesCount} candidates</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge
              className={`${
                electionData.status === "CLOSED"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }`}
            >
              {electionData.status}
            </Badge>
            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </div>

      {/* Winners Announcement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Crown className="h-6 w-6 mr-2 text-yellow-500" />
            Election Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(portfolioResults).map(
              ([portfolioName, data]: [string, any]) => (
                <div
                  key={portfolioName}
                  className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Crown className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {portfolioName}
                    </h3>
                    <p className="text-xl font-bold text-amber-700">
                      {data.winner?.name}
                    </p>
                    <div className="mt-2 flex justify-center items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Vote className="h-3 w-3 mr-1" />
                        {data.winner?.votes.toLocaleString()} votes
                      </span>
                      <span className="font-medium text-amber-600">
                        {data.winner?.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results by Portfolio */}
      <div className="grid gap-6 lg:grid-cols-1">
        {Object.entries(portfolioResults).map(
          ([portfolioName, data]: [string, any]) => (
            <Card key={portfolioName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-amber-600" />
                    {portfolioName} - Final Standings
                  </span>
                  <Badge className="bg-amber-100 text-amber-800">
                    {data.votes.toLocaleString()} total votes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.candidates.map((candidate: any, index: number) => (
                    <div
                      key={candidate.name}
                      className={`p-4 rounded-lg border-2 ${getPositionStyle(
                        index
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getPositionIcon(index)}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {index + 1}. {candidate.name}
                            </p>
                            {index === 0 && (
                              <Badge className="mt-1 bg-yellow-100 text-yellow-800 text-xs">
                                WINNER
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {candidate.votes.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {candidate.percentage}% of votes
                          </p>
                        </div>
                      </div>

                      {/* Vote breakdown bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${candidate.percentage}%`,
                              backgroundColor: getCandidateColor(index),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Vote Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-amber-600" />
            Vote Distribution Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidatePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} votes (${
                      candidatePerformance.find((c) => c.votes === value)
                        ?.percentage
                    }%)`,
                    "Votes",
                  ]}
                  labelFormatter={(label) => {
                    const candidate = candidatePerformance.find(
                      (c) => c.name === label
                    );
                    return `${candidate?.name} - ${candidate?.portfolio}`;
                  }}
                />
                <Bar dataKey="votes" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionResults;
