"use client";
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApprovalCard<
  T extends {
    id: string;
    title: string;
    description: string;
    department: string;
    isGeneral: boolean;
    startDate: string;
    endDate: string;
    portfolios: any[] | number;
    candidates: any[] | number;
    expectedVoters: number;
  }
>({
  item,
  onView,
  approvedPage,
}: {
  item: T;
  onView: (item: T) => void;
  approvedPage?: boolean;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge
            variant={item.isGeneral ? "default" : "secondary"}
            className={
              item.isGeneral
                ? "bg-[#2ecc71]/20 text-[#2ecc71]"
                : "bg-gray-100 text-gray-800"
            }
          >
            {item.isGeneral ? "General" : item.department}
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            {approvedPage ? "Approved" : "Pending"}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Starts: {formatDate(item.startDate)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Ends: {formatDate(item.endDate)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{item.expectedVoters.toLocaleString()} expected voters</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-[#2ecc71]">
              {Array.isArray(item.portfolios)
                ? item.portfolios.length
                : item.portfolios}
            </div>
            <div className="text-xs text-gray-500">Portfolios</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {Array.isArray(item.candidates)
                ? item.candidates.length
                : item.candidates}
            </div>
            <div className="text-xs text-gray-500">Candidates</div>
          </div>
        </div>

        {!approvedPage && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-[#2ecc71] border-green-200 hover:bg-green-50"
              onClick={() => onView(item)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
