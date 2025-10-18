import React from "react";
import Link from "next/link";
import { Users, Shield, Crown, FileText, LucideIcon } from "lucide-react";

interface QuickAction {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface QuickActionsProps {
  orchestratorId: string;
}

const QuickActionItem: React.FC<QuickAction> = ({
  href,
  icon: Icon,
  label,
}) => (
  <Link
    href={href}
    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <Icon className="w-6 h-6 text-[#2ecc71] mb-2" />
    <span className="text-sm font-medium text-gray-900 text-center">
      {label}
    </span>
  </Link>
);

const QuickActions: React.FC<QuickActionsProps> = ({ orchestratorId }) => {
  const actions: QuickAction[] = [
    {
      href: `/orchestrator/${orchestratorId}/manage-orchestrators`,
      icon: Users,
      label: "Manage Orchestrators",
    },
    {
      href: `/orchestrator/${orchestratorId}/approver`,
      icon: Shield,
      label: "Manage Approver",
    },
    {
      href: `/orchestrator/${orchestratorId}/superadmin`,
      icon: Crown,
      label: "Manage SuperAdmin",
    },
    {
      href: `/orchestrator/${orchestratorId}/audit-log`,
      icon: FileText,
      label: "Audit Logs",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <QuickActionItem key={action.href} {...action} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
