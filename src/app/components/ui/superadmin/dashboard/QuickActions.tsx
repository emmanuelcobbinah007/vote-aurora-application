"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  UserPlus,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Users,
  FileText,
} from "lucide-react";

interface QuickActionsProps {
  superadminId: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ superadminId }) => {
  const quickActions = [
    {
      title: "Create Election",
      description: "Start a new election process",
      icon: Plus,
      href: `/superadmin/${superadminId}/elections/`,
      color: "text-[#2ecc71] bg-[#e6f9f1] hover:bg-[#d4f8e1]",
      buttonColor: "bg-[#2ecc71] hover:bg-[#28b362]",
    },
    {
      title: "Invite Admin",
      description: "Add a new administrator",
      icon: UserPlus,
      href: `/superadmin/${superadminId}/subadmins/`,
      color: "text-gray-600 bg-white hover:bg-gray-100",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
    },
    {
      title: "View Analytics",
      description: "Check system analytics",
      icon: BarChart3,
      href: `/superadmin/${superadminId}/analytics`,
      color: "text-[#2ecc71] bg-[#e6f9f1] hover:bg-[#d4f8e1]",
      buttonColor: "bg-[#2ecc71] hover:bg-[#28b362]",
    },
    {
      title: "Manage Elections",
      description: "View all elections",
      icon: Calendar,
      href: `/superadmin/${superadminId}/elections`,
      color: "text-gray-600 bg-white hover:bg-gray-100",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      href: `/superadmin/${superadminId}/settings`,
      color: "text-[#2ecc71] bg-[#e6f9f1] hover:bg-[#d4f8e1]",
      buttonColor: "bg-[#2ecc71] hover:bg-[#28b362]",
    },
    {
      title: "Security & Audit",
      description: "View audit logs and security",
      icon: Shield,
      href: `/superadmin/${superadminId}/audit-logs`,
      color: "text-gray-600 bg-white hover:bg-gray-100",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;

            return (
              <Link key={index} href={action.href}>
                <div
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${action.color}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg text-white ${action.buttonColor}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/superadmin/${superadminId}/subadmins`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Sub-Admins
              </Button>
            </Link>
            <Link href={`/superadmin/${superadminId}/approvals`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Shield className="w-4 h-4 mr-2" />
                Approvals
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
