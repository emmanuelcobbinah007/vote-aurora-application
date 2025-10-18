import React from "react";
import { User, Clock } from "lucide-react";
import { AuditLog } from "./utils/api";
import { formatTimestamp, formatActionDetails } from "./utils/formatters";
import {
  getActionIcon,
  getActionColor,
  formatAction,
} from "./utils/actionHelpers";

interface AuditLogItemProps {
  log: AuditLog;
  index: number;
}

const AuditLogItem: React.FC<AuditLogItemProps> = ({ log, index }) => {
  const { date, time } = formatTimestamp(log.timestamp);
  const actionColor = getActionColor(log.action);
  const ActionIcon = getActionIcon(log.action);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3 md:space-x-4">
        {/* Action Icon */}
        <div className={`p-2 rounded-full ${actionColor} flex-shrink-0`}>
          <ActionIcon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                {formatAction(log.action)}
              </h3>
              <div className="mt-1 text-sm text-gray-600">
                {formatActionDetails(log.action, log.details || "{}")}
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-500 md:ml-4">
              <Clock className="w-3 h-3 mr-1" />
              <span>{time}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col space-y-1 mt-3 text-sm md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <User className="w-3 h-3" />
              <span className="truncate">{log.userName}</span>
            </div>
            <div className="text-gray-500 truncate md:max-w-xs lg:max-w-none">
              {log.userEmail}
            </div>
          </div>

          {/* Entity Info */}
          {log.entityId && (
            <div className="mt-2 text-xs text-gray-500">
              {log.entityType}: {log.entityId}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-medium text-gray-900">{date}</div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogItem;
