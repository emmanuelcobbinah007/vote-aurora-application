"use client";

import React, { useState } from "react";
import { Search, Filter, Download, ChevronDown } from "lucide-react";
import { formatAction } from "./auditHelpers";

interface AuditLogHeaderProps {
  selectedAction: string;
  onActionChange: (action: string) => void;
}

const AuditLogHeader: React.FC<AuditLogHeaderProps> = ({
  selectedAction,
  onActionChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const actionTypes = [
    "All Actions",
    "USER_LOGIN",
    "USER_LOGOUT",
    "ADMIN_ACCOUNT_CREATED",
    "ELECTION_CREATED",
    "ELECTION_UPDATED",
    "ELECTION_STARTED",
    "ELECTION_ENDED",
    "INVITATION_SENT",
    "INVITATION_ACCEPTED",
    "SYSTEM_BACKUP",
    "CONFIGURATION_CHANGE",
  ];

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 mt-1">
          Track all system activities and administrative actions
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#1e8e3e] transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>
              {selectedAction ? formatAction(selectedAction) : "All Actions"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                {actionTypes.map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      onActionChange(action === "All Actions" ? "" : action);
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {action === "All Actions" ? action : formatAction(action)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogHeader;
