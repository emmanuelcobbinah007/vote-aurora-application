"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, BarChart3, TrendingUp } from "lucide-react";

export interface Stats {
  pendingApprovals: number;
  approvedElections: number;
  liveElections: number;
  totalVotesOverseen: number;
}

export default function ApproverStatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.pendingApprovals}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved Elections</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.approvedElections}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Live Elections</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.liveElections}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Votes Overseen</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalVotesOverseen.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
