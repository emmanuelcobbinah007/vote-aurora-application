import React from "react";
import { Calendar, Users, Clock, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "../utils/analyticsUtils";

interface DraftElectionProps {
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
  onConfigureElection: () => void;
}

const DraftElectionView: React.FC<DraftElectionProps> = ({
  election,
  onConfigureElection,
}) => {
  const readinessChecks = [
    {
      label: "Election Details",
      completed: !!election.title && !!election.description,
      icon: Settings,
    },
    {
      label: "Portfolios Created",
      completed: election._count.portfolios > 0,
      icon: Users,
    },
    {
      label: "Candidates Added",
      completed: election._count.candidates > 0,
      icon: Users,
    },
    {
      label: "Election Schedule",
      completed: election.startDate && election.endDate,
      icon: Calendar,
    },
  ];

  const completedChecks = readinessChecks.filter(
    (check) => check.completed
  ).length;
  const totalChecks = readinessChecks.length;
  const readinessPercentage = (completedChecks / totalChecks) * 100;

  return (
    <div className="space-y-6">
      {/* Election Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl" style={{ color: "#2ecc71" }}>
              {election.title}
            </CardTitle>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: "#2ecc71",
                color: "white",
              }}
            >
              Draft
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{election.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                Start: {formatDate(election.startDate.toISOString())}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                End: {formatDate(election.endDate.toISOString())}
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

      {/* Election Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">
            Election Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Setup Progress
              </span>
              <span className="text-sm text-gray-500">
                {completedChecks}/{totalChecks} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${readinessPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            {readinessChecks.map((check, index) => {
              const Icon = check.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      check.completed
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`flex-1 ${
                      check.completed ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {check.label}
                  </span>
                  <div>
                    {check.completed ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        Complete
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-600"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Basic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolios</p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {election._count.portfolios}
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
                <p className="text-sm font-medium text-gray-600">Candidates</p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {election._count.candidates}
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
                  Setup Progress
                </p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {Math.round(readinessPercentage)}%
                </p>
              </div>
              <Settings className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "#2ecc71" }}
          >
            Ready to configure your election?
          </h3>
          <p className="text-gray-600 mb-4">
            Complete the setup process to prepare your election for approval.
          </p>
          <Button
            onClick={onConfigureElection}
            className="px-6 py-2"
            style={{
              backgroundColor: "#2ecc71",
              borderColor: "#2ecc71",
            }}
          >
            Configure Election
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftElectionView;
