"use client";
import React from "react";
import { FileText } from "lucide-react";

interface ApprovalsHeaderProps {
  totalCount: number;
}

const ApprovalsHeader: React.FC<ApprovalsHeaderProps> = ({ totalCount }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-[#cc910d]/10 rounded-lg">
          <FileText className="w-6 h-6 text-[#cc910d]" />
        </div>
        <div>
          <p className="text-sm text-gray-600">
            {totalCount} election{totalCount !== 1 ? "s" : ""} submitted for
            approval
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsHeader;
