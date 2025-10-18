"use client";
import React from "react";
import { Vote, Calendar, FileText, Archive } from "lucide-react";

interface ElectionStatsProps {
  elections: any[];
}

const ElectionStats: React.FC<ElectionStatsProps> = ({ elections }) => {
  const stats = [
    {
      title: "Total Elections",
      value: elections.length,
      icon: Vote,
      color: "from-amber-400 to-amber-500",
    },
    {
      title: "Live Elections",
      value: elections.filter((e) => e.status === "LIVE").length,
      icon: Calendar,
      color: "from-green-400 to-green-500",
    },
    {
      title: "Draft Elections",
      value: elections.filter((e) => e.status === "DRAFT").length,
      icon: FileText,
      color: "from-blue-400 to-blue-500",
    },
    {
      title: "Closed Elections",
      value: elections.filter((e) => e.status === "CLOSED").length,
      icon: Archive,
      color: "from-red-400 to-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div
              className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white mb-4`}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-black">{stat.value}</div>
            <div className="text-gray-600 text-sm">{stat.title}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ElectionStats;
