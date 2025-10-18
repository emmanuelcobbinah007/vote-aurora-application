import React from "react";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  name: string;
  email: string;
  role?: string;
  status?: string;
  lastLogin?: string | null;
}

const ProfileCard = ({ name, email, role, status, lastLogin }: ProfileCardProps) => {
  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "Never";
    return new Date(lastLogin).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      SUSPENDED: "bg-red-100 text-red-800",
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.INACTIVE}`}>
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 md:col-span-1">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">
          {name?.[0] || "U"}
        </div>
        <div className="flex-1">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{email}</div>
          {role && (
            <div className="text-xs text-gray-400 mt-1">
              {role} {status && getStatusBadge(status)}
            </div>
          )}
        </div>
      </div>

      {lastLogin && (
        <div className="mt-3 text-xs text-gray-500">
          Last login: {formatLastLogin(lastLogin)}
        </div>
      )}

      <div className="mt-4 space-x-2">
        <Button className="bg-[#cc910d] text-white hover:bg-amber-700">
          Edit profile
        </Button>
        <Button className="border border-[#cc910d] text-[#cc910d] hover:bg-amber-50 bg-white">
          Export data
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
