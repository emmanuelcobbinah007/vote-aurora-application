"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";

interface Election {
  id: string;
  title: string;
  start_time: string;
  status: string;
}

interface UpcomingElectionsProps {
  elections: Election[];
  superadminId: string;
}

const UpcomingElections: React.FC<UpcomingElectionsProps> = ({
  elections,
  superadminId,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "LIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "APPROVED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING_APPROVAL":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffDays === 0) {
      return `Today at ${formattedTime}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${formattedTime}`;
    } else if (diffDays > 1) {
      return `${formattedDate} at ${formattedTime}`;
    } else {
      return `Started ${formattedDate}`;
    }
  };

  const getTimeStatus = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "ongoing";
    if (diffDays === 0) return "today";
    if (diffDays <= 3) return "soon";
    return "upcoming";
  };

  const sortedElections = elections
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    )
    .slice(0, 5); // Show only first 5

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Elections
        </CardTitle>
        <Link href={`/superadmin/${superadminId}/elections`}>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {sortedElections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No upcoming elections</p>
            <Link href={`/superadmin/${superadminId}/elections/create`}>
              <Button variant="outline" size="sm" className="mt-2">
                Create Election
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedElections.map((election) => {
              const timeStatus = getTimeStatus(election.start_time);

              return (
                <div
                  key={election.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 line-clamp-2 flex-1">
                      {election.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`ml-2 ${getStatusColor(election.status)}`}
                    >
                      {election.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(election.start_time)}</span>
                    {timeStatus === "today" && (
                      <Badge variant="destructive" className="text-xs">
                        Today
                      </Badge>
                    )}
                    {timeStatus === "soon" && (
                      <Badge variant="secondary" className="text-xs">
                        Soon
                      </Badge>
                    )}
                    {timeStatus === "ongoing" && (
                      <Badge className="text-xs bg-green-600">Live</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/superadmin/${superadminId}/elections/${election.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto font-normal text-amber-600 hover:text-amber-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                    <Link
                      href={`/superadmin/${superadminId}/elections/${election.id}`}
                    >
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
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

export default UpcomingElections;
