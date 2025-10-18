"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  CheckCircle,
  UserPlus,
  Settings,
  FileText,
  Activity,
} from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  superadminId: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  superadminId,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "election":
        return Calendar;
      case "admin":
        return UserPlus;
      case "approval":
        return CheckCircle;
      case "settings":
        return Settings;
      case "token":
        return Users;
      case "audit":
        return Activity;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "election":
        return "text-amber-600 bg-amber-50";
      case "admin":
        return "text-gray-600 bg-gray-50";
      case "approval":
        return "text-green-600 bg-green-50";
      case "settings":
        return "text-amber-600 bg-amber-50";
      case "token":
        return "text-gray-600 bg-gray-50";
      case "audit":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getBadgeVariant = (
    type: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "election":
        return "default";
      case "admin":
        return "secondary";
      case "approval":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <Link href={`/superadmin/${superadminId}/audit-logs`}>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <Badge
                        variant={getBadgeVariant(activity.type)}
                        className="text-xs"
                      >
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
