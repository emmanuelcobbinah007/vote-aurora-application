import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Activity, Vote, Archive } from "lucide-react";
import { Election } from "./ElectionTypes";

interface ElectionsStatsProps {
  totalElections?: number;
  liveElections?: number;
  draftElections?: number;
  closedElections?: number;
}

const ElectionsStats: React.FC<ElectionsStatsProps> = ({
  totalElections,
  liveElections,
  draftElections,
  closedElections,
}) => {
  const stats = [
    {
      title: "Total Elections",
      value: totalElections,
      icon: Calendar,
      bgColor: "bg-[#2ecc71]/20",
      iconColor: "text-[#2ecc71]",
    },
    {
      title: "Live Elections",
      value: liveElections,
      icon: Activity,
      bgColor: "bg-[#2ecc71]/20",
      iconColor: "text-[#2ecc71]",
    },
    {
      title: "Draft Elections",
      value: draftElections,
      icon: Vote,
      bgColor: "bg-[#2ecc71]/20",
      iconColor: "text-[#2ecc71]",
    },
    {
      title: "Closed Elections",
      value: closedElections,
      icon: Archive,
      bgColor: "bg-[#2ecc71]/20",
      iconColor: "text-[#2ecc71]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ElectionsStats;
