"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, User, Vote } from "lucide-react";
import { CandidatePerformance } from "./individualElectionTypes";
import { getCandidateColor } from "../../../admin/reports/utils";

interface IndividualCandidatePerformanceProps {
  candidatePerformance: CandidatePerformance[];
  totalVotes: number;
}

const IndividualCandidatePerformance: React.FC<
  IndividualCandidatePerformanceProps
> = ({ candidatePerformance, totalVotes }) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-[#cc910d]" />;
      case 1:
        return <Medal className="h-5 w-5 text-amber-600" />;
      case 2:
        return <Award className="h-5 w-5 text-yellow-600" />;
      default:
        return (
          <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
        );
    }
  };

  const getRankBadgeVariant = (index: number) => {
    switch (index) {
      case 0:
        return "bg-amber-100 text-[#cc910d] border-amber-200";
      case 1:
        return "bg-amber-50 text-amber-700 border-amber-100";
      case 2:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-orange-50 text-orange-700 border-orange-100";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!candidatePerformance || candidatePerformance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidate Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No voting data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Candidate Performance
          <Badge variant="outline" className="ml-auto">
            {candidatePerformance.length} Candidates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidatePerformance.map((candidate, index) => (
            <div
              key={candidate.candidateId}
              className={`p-4 rounded-lg border-2 transition-all ${
                index === 0
                  ? "border-amber-200 bg-amber-50"
                  : index === 1
                  ? "border-amber-100 bg-amber-25"
                  : index === 2
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-gray-100 bg-white hover:border-amber-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(index)}
                  </div>

                  {/* Candidate Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                      {candidate.candidatePhoto ? (
                        <img
                          src={candidate.candidatePhoto}
                          alt={candidate.candidateName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-[#cc910d] font-semibold">
                          {getInitials(candidate.candidateName)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {candidate.candidateName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {candidate.portfolioTitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getRankBadgeVariant(index)}>
                      {candidate.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Vote className="h-4 w-4" />
                    <span>{candidate.votes.toLocaleString()} votes</span>
                  </div>
                </div>
              </div>

              {/* Vote Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Vote Share</span>
                  <span>
                    {candidate.votes.toLocaleString()} /{" "}
                    {totalVotes.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(candidate.percentage, 100)}%`,
                      backgroundColor: getCandidateColor(index),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {candidatePerformance[0]?.percentage.toFixed(1) || "0"}%
              </p>
              <p className="text-sm text-gray-600">Leading Candidate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {candidatePerformance.length}
              </p>
              <p className="text-sm text-gray-600">Total Candidates</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalVotes.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Votes</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualCandidatePerformance;
