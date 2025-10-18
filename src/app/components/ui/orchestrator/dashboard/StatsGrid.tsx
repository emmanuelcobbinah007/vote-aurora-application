import React from "react";
import { Settings, Shield, Crown, Eye } from "lucide-react";
import StatCard from "./StatCard";
import { DashboardStats } from "./utils/api";
import { formatStatus } from "./utils/formatters";

interface StatsGridProps {
  stats: DashboardStats;
  orchestratorId: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, orchestratorId }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        title="Orchestrators"
        value={stats.orchestrators}
        icon={Settings}
        iconColor="text-indigo-600"
        iconBgColor="bg-indigo-100"
      />

      <StatCard
        title="Approver"
        value={formatStatus(stats.approverStatus)}
        icon={Shield}
        iconColor={
          stats.approverStatus === "active" ? "text-green-600" : "text-red-600"
        }
        iconBgColor={
          stats.approverStatus === "active" ? "bg-green-100" : "bg-red-100"
        }
        valueColor={
          stats.approverStatus === "active" ? "text-green-600" : "text-red-600"
        }
      />

      <StatCard
        title="SuperAdmin"
        value={formatStatus(stats.superadminStatus)}
        icon={Crown}
        iconColor={
          stats.superadminStatus === "active"
            ? "text-green-600"
            : "text-red-600"
        }
        iconBgColor={
          stats.superadminStatus === "active" ? "bg-green-100" : "bg-red-100"
        }
        valueColor={
          stats.superadminStatus === "active"
            ? "text-green-600"
            : "text-red-600"
        }
      />

      <StatCard
        title="Quick Access"
        value="View Audit Logs"
        icon={Eye}
        iconColor="text-gray-600"
        iconBgColor="bg-gray-100"
        valueColor="text-blue-600 hover:text-blue-700"
        href={`/orchestrator/${orchestratorId}/audit-log`}
      />
    </div>
  );
};

export default StatsGrid;
