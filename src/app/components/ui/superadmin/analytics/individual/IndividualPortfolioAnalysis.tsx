"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Briefcase, Users, Vote, TrendingUp } from "lucide-react";
import { PortfolioDistribution } from "./individualElectionTypes";

interface IndividualPortfolioAnalysisProps {
  portfolioDistribution: PortfolioDistribution[];
  totalVotes: number;
}

const IndividualPortfolioAnalysis: React.FC<
  IndividualPortfolioAnalysisProps
> = ({ portfolioDistribution, totalVotes }) => {
  // Color palette for portfolios
  const portfolioColors = [
    "#D97706", // Amber
    "#3B82F6", // Blue
    "#10B981", // Green
    "#8B5CF6", // Purple
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#F97316", // Orange
  ];

  const chartData = portfolioDistribution.map((portfolio, index) => ({
    ...portfolio,
    color: portfolioColors[index % portfolioColors.length],
    shortTitle:
      portfolio.portfolioTitle.length > 15
        ? portfolio.portfolioTitle.substring(0, 15) + "..."
        : portfolio.portfolioTitle,
  }));

  if (!portfolioDistribution || portfolioDistribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Portfolio Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No portfolio data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const topPerformingPortfolio = portfolioDistribution[0];
  const leastPerformingPortfolio =
    portfolioDistribution[portfolioDistribution.length - 1];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Portfolio</p>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {topPerformingPortfolio?.portfolioTitle.substring(0, 20) ||
                    "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  {topPerformingPortfolio?.percentage.toFixed(1) || "0"}% of
                  votes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Portfolios</p>
                <p className="text-lg font-semibold text-gray-900">
                  {portfolioDistribution.length}
                </p>
                <p className="text-xs text-gray-500">Positions available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Candidates</p>
                <p className="text-lg font-semibold text-gray-900">
                  {portfolioDistribution.reduce(
                    (sum, p) => sum + p.candidatesCount,
                    0
                  )}
                </p>
                <p className="text-xs text-gray-500">Across all portfolios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Portfolio Vote Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.portfolioTitle.substring(
                      0,
                      10
                    )}... ${entry.percentage.toFixed(1)}%`
                  }
                  outerRadius={80}
                  fill="#cc910d"
                  dataKey="votes"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} votes (${props.payload.percentage.toFixed(1)}%)`,
                    props.payload.portfolioTitle,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Votes by Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="shortTitle"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} votes (${props.payload.percentage.toFixed(1)}%)`,
                    props.payload.portfolioTitle,
                  ]}
                />
                <Bar dataKey="votes" fill="#cc910d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Portfolio Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Detailed Portfolio Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioDistribution.map((portfolio, index) => (
              <div
                key={portfolio.portfolioId}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: chartData[index].color }}
                      ></div>
                      <h3 className="font-semibold text-gray-900">
                        {portfolio.portfolioTitle}
                      </h3>
                      <Badge variant="outline">
                        {portfolio.candidatesCount} candidate
                        {portfolio.candidatesCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {portfolio.portfolioDescription && (
                      <p className="text-sm text-gray-600 mb-2">
                        {portfolio.portfolioDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Vote className="h-4 w-4" />
                        {portfolio.votes.toLocaleString()} votes
                      </span>
                      <span>{portfolio.percentage.toFixed(1)}% of total</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {portfolio.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(portfolio.percentage, 100)}%`,
                        backgroundColor: chartData[index].color,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualPortfolioAnalysis;
