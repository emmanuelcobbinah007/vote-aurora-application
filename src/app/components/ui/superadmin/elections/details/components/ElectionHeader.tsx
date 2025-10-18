import React from "react";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ElectionWithDetails } from "@/data";

interface ElectionHeaderProps {
  election: ElectionWithDetails;
  localStatus: string;
  requestingApproval: boolean;
  isSuperAdminPage: boolean;
  onBack: () => void;
  onEditElection: () => void;
  onRequestApproval: () => Promise<void>;
}

const ElectionHeader: React.FC<ElectionHeaderProps> = ({
  election,
  localStatus,
  requestingApproval,
  isSuperAdminPage,
  onBack,
  onEditElection,
  onRequestApproval,
}) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "LIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING_APPROVAL":
        return <AlertCircle className="h-4 w-4" />;
      case "CLOSED":
      case "ARCHIVED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {isSuperAdminPage && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 hover:cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
          <p className="text-gray-600 mt-1">Election Details & Management</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge
          className={`flex items-center space-x-1 ${getStatusColor(
            localStatus
          )}`}
        >
          {getStatusIcon(localStatus)}
          <span>{localStatus.replace(/_/g, " ")}</span>
        </Badge>
        {/* Request Approval Button - visible only for superadmins and when not already pending/approved/live */}
        {isSuperAdminPage &&
          localStatus !== "PENDING_APPROVAL" &&
          localStatus !== "APPROVED" &&
          localStatus !== "LIVE" &&
          localStatus !== "CLOSED" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRequestApproval}
              className="flex items-center space-x-2"
            >
              {requestingApproval ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Request Approval</span>
              )}
            </Button>
          )}
        {localStatus !== "CLOSED" && (
          <Button
            variant="outline"
            onClick={onEditElection}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Election</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ElectionHeader;
