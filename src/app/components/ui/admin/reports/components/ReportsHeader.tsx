import React, { useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  ChevronDown,
  FileText,
  Table,
  Sheet,
  Database,
} from "lucide-react";
import type { ReportsHeaderProps, ExportFormat } from "../types";
import { formatDateTime, getTimeRemaining } from "../utils";

const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  election,
  onBack,
  onExport,
  onRefresh,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Export format options with Lucide icons
  const exportFormats = [
    { value: "PDF" as ExportFormat, label: "PDF Report", icon: FileText },
    { value: "CSV" as ExportFormat, label: "CSV Data", icon: Table },
    { value: "EXCEL" as ExportFormat, label: "Excel Workbook", icon: Sheet },
    { value: "JSON" as ExportFormat, label: "JSON Data", icon: Database },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = (format: ExportFormat) => {
    onExport(format);
    setShowExportMenu(false);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      PENDING_APPROVAL: {
        color: "bg-green-100 text-green-800",
        label: "Pending Approval",
      },
      APPROVED: { color: "bg-green-100 text-green-800", label: "Approved" },
      LIVE: { color: "bg-green-100 text-green-800", label: "Live" },
      CLOSED: { color: "bg-green-100 text-green-800", label: "Closed" },
      ARCHIVED: { color: "bg-green-100 text-green-800", label: "Archived" },
    };

    const config = statusConfig[election.status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>

            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Election Reports
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {election.title} • {election.department || "General"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live indicator for live elections */}
            {election.status === "LIVE" && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live • {getTimeRemaining(election.end_time)}</span>
              </div>
            )}

            {/* Last updated info */}
            <div className="text-sm text-gray-500">
              Updated {formatDateTime(new Date())}
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {exportFormats.map((format) => {
                      const IconComponent = format.icon;
                      return (
                        <button
                          key={format.value}
                          onClick={() => handleExport(format.value)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <IconComponent className="w-4 h-4 mr-3" />
                          {format.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Election timing info */}
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
          <div>
            <span className="font-medium">Starts:</span>{" "}
            {formatDateTime(election.start_time)}
          </div>
          <div>
            <span className="font-medium">Ends:</span>{" "}
            {formatDateTime(election.end_time)}
          </div>
          <div>
            <span className="font-medium">Type:</span>{" "}
            {election.is_general ? "General Election" : "Departmental Election"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsHeader;
