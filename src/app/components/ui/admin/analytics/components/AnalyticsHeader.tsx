import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalyticsHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  status?: string;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  title,
  subtitle,
  onBack,
  status,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "LIVE":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-purple-100 text-purple-800";
      case "ARCHIVED":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mb-6 bg-white border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
              {title}
            </h1>
            <p className="text-gray-600 mt-1">{subtitle}</p>
          </div>
          {status && (
            <Badge className={getStatusColor(status)}>
              {status.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
