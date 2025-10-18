import React from "react";
import {
  FileText,
  BarChart3,
  Settings,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ElectionWithDetails } from "@/data";
import { ElectionTab } from "./ElectionTabs";

interface OverviewTabProps {
  election: ElectionWithDetails;
  portfolios: any[];
  candidates: any[];
  ballots: any[];
  onTabChange: (tab: ElectionTab) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  election,
  portfolios,
  candidates,
  ballots,
  onTabChange,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-green-50 text-green-700 border-green-200";
      case "PENDING_APPROVAL":
        return "bg-green-100 text-green-800 border-green-300";
      case "APPROVED":
        return "bg-green-200 text-green-900 border-green-400";
      case "LIVE":
        return "bg-[#2ecc71] text-white border-[#2ecc71]";
      case "CLOSED":
        return "bg-red-100 text-red-800 border-red-200";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Election Info Card */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" style={{ color: "#2ecc71" }} />
            Election Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <p className="text-gray-900 mt-1">{election.title}</p>
            </div>
            {election.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="text-gray-600 mt-1">{election.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <p className="text-gray-900 mt-1 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-green-600" />
                  {formatDate(election.start_time)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  End Time
                </label>
                <p className="text-gray-900 mt-1 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-red-600" />
                  {formatDate(election.end_time)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" style={{ color: "#2ecc71" }} />
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Portfolios</span>
              <span className="font-semibold text-gray-900">
                {portfolios.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Candidates</span>
              <span className="font-semibold text-gray-900">
                {candidates.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ballot Items</span>
              <span className="font-semibold text-gray-900">
                {ballots.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <Badge className={getStatusColor(election.status)}>
                {election.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Next Steps Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="space-y-3">
          {portfolios.length === 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800">
                  Add portfolios (positions) to your election
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => onTabChange("portfolios")}
                style={{ backgroundColor: "#2ecc71" }}
                className="text-white"
              >
                Add Portfolios
              </Button>
            </div>
          )}
          {portfolios.length > 0 && candidates.length === 0 && (
            <div className="flex items-center justify-between p-3 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-700 mr-3" />
                <span className="text-green-900">
                  Add candidates to your portfolios
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => onTabChange("candidates")}
                style={{ backgroundColor: "#2ecc71" }}
                className="text-white"
              >
                Add Candidates
              </Button>
            </div>
          )}
          {candidates.length > 0 && ballots.length === 0 && (
            <div className="flex items-center justify-between p-3 bg-green-200 border border-green-400 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-green-800 mr-3" />
                <span className="text-green-900">
                  Configure ballot order and structure
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => onTabChange("ballot-setup")}
                style={{ backgroundColor: "#2ecc71" }}
                className="text-white"
              >
                Setup Ballot
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
