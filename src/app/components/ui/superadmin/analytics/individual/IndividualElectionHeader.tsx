"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  MapPin,
  Clock,
  Download,
  Users,
  CheckCircle,
} from "lucide-react";
import { ElectionDetails, UserProfile } from "./individualElectionTypes";

interface IndividualElectionHeaderProps {
  election: ElectionDetails;
  assignedAdminsCount: number;
  onExportReport?: () => void;
  isExporting?: boolean;
}

const IndividualElectionHeader: React.FC<IndividualElectionHeaderProps> = ({
  election,
  assignedAdminsCount,
  onExportReport,
  isExporting = false,
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "APPROVED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING_APPROVAL":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const UserProfileCard: React.FC<{
    user: UserProfile | null;
    label: string;
    icon: React.ReactNode;
  }> = ({ user, label, icon }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-medium text-gray-900">
          {user ? user.full_name : "Not assigned"}
        </p>
        {user && <p className="text-xs text-gray-500">{user.email}</p>}
      </div>
    </div>
  );

  return (
    <Card className="">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Main Election Info */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {election.title}
                </h1>
                <Badge className={getStatusBadgeVariant(election.status)}>
                  {election.status.replace("_", " ")}
                </Badge>
              </div>
              {election.description && (
                <p className="text-gray-600 text-lg max-w-2xl">
                  {election.description}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[#cc910d] text-[#cc910d] hover:bg-[#cc910d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onExportReport}
              disabled={isExporting || !onExportReport}
            >
              <Download
                className={`h-4 w-4 ${isExporting ? "animate-spin" : ""}`}
              />
              {isExporting ? "Generating..." : "Export Report"}
            </Button>
          </div>

          {/* Election Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-[#cc910d]" />
              </div>
              <div>
                <p className="text-xs text-amber-700">Type & Department</p>
                <p className="text-sm font-medium text-amber-900">
                  {election.isGeneral ? "General" : "Departmental"}
                </p>
                <p className="text-xs text-amber-600">
                  {election.department || "All Departments"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-amber-700">Start Time</p>
                <p className="text-sm font-medium text-amber-900">
                  {formatDate(election.startTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-700" />
              </div>
              <div>
                <p className="text-xs text-orange-700">End Time</p>
                <p className="text-sm font-medium text-orange-900">
                  {formatDate(election.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-[#cc910d]" />
              </div>
              <div>
                <p className="text-xs text-amber-700">Assigned Admins</p>
                <p className="text-sm font-medium text-amber-900">
                  {assignedAdminsCount} Admin
                  {assignedAdminsCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* People Involved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UserProfileCard
              user={election.creator}
              label="Created By"
              icon={<User className="h-4 w-4 text-[#cc910d]" />}
            />
            <UserProfileCard
              user={election.approver}
              label="Approved By"
              icon={<CheckCircle className="h-4 w-4 text-[#cc910d]" />}
            />
          </div>

          {/* Timeline */}
          <div className="text-xs text-gray-500 flex items-center gap-4">
            <span>Created: {formatDate(election.createdAt)}</span>
            <span>•</span>
            <span>Last Updated: {formatDate(election.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualElectionHeader;
