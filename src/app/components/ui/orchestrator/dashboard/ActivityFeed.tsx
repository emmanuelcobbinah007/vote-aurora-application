import React from "react";
import Link from "next/link";
import { AlertCircle, ChevronRight } from "lucide-react";
import {
  RecentActivity,
  getActivityIcon,
  getActivityColor,
  getActivityDescription,
} from "./utils/activityHelpers";
import { formatDate } from "./utils/formatters";

interface ActivityFeedProps {
  activities: RecentActivity[] | undefined;
  loading: boolean;
  error: any;
  orchestratorId: string;
  onRetry: () => void;
}

const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const IconComponent = getActivityIcon(activity.action);
  const colorClass = getActivityColor(activity.action, activity.metadata);

  return (
    <div className="flex items-start space-x-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}
      >
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          {getActivityDescription(activity.action, activity.metadata)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {activity.metadata?.user_name || "System"} •{" "}
          {formatDate(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

const ActivityFeedSkeleton: React.FC = () => (
  <div className="space-y-3 md:space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const ActivityFeedError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div>
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">Error loading activity data.</span>
      </div>
    </div>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-[#2ecc71] text-white rounded-md hover:bg-[#27ae60] transition-colors text-sm"
    >
      Retry
    </button>
  </div>
);

const ActivityFeedEmpty: React.FC = () => (
  <div className="text-center py-6">
    <p className="text-gray-500">No recent activity found.</p>
  </div>
);

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading,
  error,
  orchestratorId,
  onRetry,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <Link
            href={`/orchestrator/${orchestratorId}/audit-log`}
            className="text-sm text-[#2ecc71] hover:text-[#27ae60] font-medium flex items-center space-x-1 self-start"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="p-4 md:p-6">
        {loading && <ActivityFeedSkeleton />}
        {error && <ActivityFeedError onRetry={onRetry} />}
        {!loading && !error && (!activities || activities.length === 0) && (
          <ActivityFeedEmpty />
        )}
        {!loading && !error && activities && activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
