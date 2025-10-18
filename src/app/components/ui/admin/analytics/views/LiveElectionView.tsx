import React from "react";
import { Users, TrendingUp, Clock, Activity, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "../utils/analyticsUtils";

interface LiveElectionProps {
  election: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: string;
    _count: {
      candidates: number;
      portfolios: number;
    };
  };
  analytics: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    portfolioStats: Array<{
      id: string;
      title: string;
      voteCount: number;
      participationRate: number;
    }>;
    hourlyTrends: Array<{
      hour: string;
      votes: number;
    }>;
  };
}

const LiveElectionView: React.FC<LiveElectionProps> = ({
  election,
  analytics,
}) => {
  const timeRemaining =
    new Date(election.endDate).getTime() - new Date().getTime();
  const hoursRemaining = Math.max(
    0,
    Math.floor(timeRemaining / (1000 * 60 * 60))
  );
  const minutesRemaining = Math.max(
    0,
    Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  );

  const highestParticipation = Math.max(
    ...analytics.portfolioStats.map((p) => p.participationRate)
  );
  const lowestParticipation = Math.min(
    ...analytics.portfolioStats.map((p) => p.participationRate)
  );

  return (
    <div className="space-y-6">
      {/* Live Status Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Activity className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Election is LIVE!</strong> Voting is currently in progress.
          {hoursRemaining > 0 && (
            <span className="ml-2">
              Time remaining: {hoursRemaining}h {minutesRemaining}m
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Election Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl" style={{ color: "#2ecc71" }}>
              {election.title}
            </CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              LIVE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{election.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                Started: {formatDate(election.startDate.toISOString())}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                Ends: {formatDate(election.endDate.toISOString())}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                {election._count.candidates} Candidates
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {analytics.totalVotes}
                </p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Eligible Voters
                </p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {analytics.totalVoters}
                </p>
              </div>
              <Users className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Participation
                </p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {analytics.participationRate.toFixed(1)}%
                </p>
              </div>
              <Activity className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${analytics.participationRate}%`,
                    backgroundColor: "#2ecc71",
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Left</p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {hoursRemaining}h {minutesRemaining}m
                </p>
              </div>
              <Clock className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Participation */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "#2ecc71" }}>
            Portfolio Participation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.portfolioStats.map((portfolio) => (
              <div key={portfolio.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {portfolio.title}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {portfolio.voteCount} votes
                    </span>
                    <Badge
                      variant={
                        portfolio.participationRate > 50
                          ? "default"
                          : "secondary"
                      }
                      style={{
                        backgroundColor:
                          portfolio.participationRate > 50
                            ? "#27ae60"
                            : "#f39c12",
                        color: "white",
                      }}
                    >
                      {portfolio.participationRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${portfolio.participationRate}%`,
                      backgroundColor: "#2ecc71",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voting Trends */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "#2ecc71" }}>
            Voting Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Peak Voting Hours
              </h4>
              <div className="space-y-2">
                {analytics.hourlyTrends
                  .sort((a, b) => b.votes - a.votes)
                  .slice(0, 5)
                  .map((trend, index) => (
                    <div
                      key={trend.hour}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {trend.hour}:00
                      </span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-2 rounded"
                          style={{
                            width: `${
                              (trend.votes /
                                Math.max(
                                  ...analytics.hourlyTrends.map((t) => t.votes)
                                )) *
                              100
                            }px`,
                            backgroundColor: "#2ecc71",
                          }}
                        ></div>
                        <span className="text-sm font-medium">
                          {trend.votes}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Participation Insights */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Participation Insights
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Highest: {highestParticipation.toFixed(1)}% participation
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">
                    Lowest: {lowestParticipation.toFixed(1)}% participation
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" style={{ color: "#2ecc71" }} />
                  <span className="text-sm text-gray-700">
                    Average: {analytics.participationRate.toFixed(1)}% overall
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Monitoring Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Live Monitoring</p>
              <p className="text-sm text-blue-700">
                This data updates automatically during the election. Individual
                vote choices remain confidential.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveElectionView;
