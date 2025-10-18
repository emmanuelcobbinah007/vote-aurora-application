"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Server,
  Users,
  Gauge,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface SystemHealthData {
  status: string;
  uptime: string;
  activeUsers: number;
  systemLoad: number;
  databaseConnections?: number;
  pendingInvitations?: number;
}

interface SystemHealthProps {
  healthData: SystemHealthData;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ healthData }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "critical":
        return XCircle;
      default:
        return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-green-500 bg-green-50";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getLoadColor = (load: number) => {
    if (load < 30) return "text-green-600";
    if (load < 70) return "text-green-500";
    return "text-red-600";
  };

  const getLoadBgColor = (load: number) => {
    if (load < 30) return "bg-green-500";
    if (load < 70) return "bg-green-400";
    return "bg-red-500";
  };

  const StatusIcon = getStatusIcon(healthData.status);

  const systemMetrics = [
    {
      label: "System Uptime",
      value: healthData.uptime,
      icon: Server,
      description: "System availability",
    },
    {
      label: "Active Users",
      value: healthData.activeUsers.toLocaleString(),
      icon: Users,
      description: "Currently online",
    },
    {
      label: "System Load",
      value: `${healthData.systemLoad}%`,
      icon: Gauge,
      description: "Resource utilization",
      textColor: getLoadColor(healthData.systemLoad),
    },
    ...(healthData.databaseConnections
      ? [
          {
            label: "DB Connections",
            value: healthData.databaseConnections.toString(),
            icon: Server,
            description: "Active connections",
          },
        ]
      : []),
    ...(healthData.pendingInvitations
      ? [
          {
            label: "Pending Invites",
            value: healthData.pendingInvitations.toString(),
            icon: Users,
            description: "Awaiting response",
          },
        ]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Status */}
        <div className="mb-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            <div
              className={`p-3 rounded-lg ${getStatusColor(healthData.status)}`}
            >
              <StatusIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">System Status</h3>
                <Badge
                  variant={
                    healthData.status === "healthy" ? "default" : "destructive"
                  }
                  className="capitalize"
                >
                  {healthData.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {healthData.status === "healthy"
                  ? "All systems operational"
                  : "System requires attention"}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          {systemMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const isLoad = metric.label === "System Load";

            return (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <IconComponent className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {metric.label}
                    </span>
                    <span
                      className={`font-semibold ${
                        metric.textColor || "text-gray-900"
                      }`}
                    >
                      {metric.value}
                    </span>
                  </div>

                  {isLoad && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getLoadBgColor(
                          healthData.systemLoad
                        )}`}
                        style={{
                          width: `${Math.min(healthData.systemLoad, 100)}%`,
                        }}
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">99.9%</div>
              <div className="text-xs text-gray-500">Uptime This Month</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                &lt; 100ms
              </div>
              <div className="text-xs text-gray-500">Avg Response Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;
