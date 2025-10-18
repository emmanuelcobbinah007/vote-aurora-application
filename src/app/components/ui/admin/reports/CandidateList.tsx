import React from "react";
import type { Candidate, PortfolioParticipation } from "./types";
import ProgressBar from "./ProgressBar";

interface CandidateListProps {
  candidates: Candidate[];
  portfolioParticipation: PortfolioParticipation[];
  totalVotes: number;
}

const CandidateList: React.FC<CandidateListProps> = ({ 
  candidates, 
  portfolioParticipation, 
  totalVotes 
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-medium mb-3">Results by candidate</h2>
      <div className="space-y-4">
        {candidates.map((c) => {
          const votesCount = c._count.votes;
          const percentage = totalVotes > 0 ? (votesCount / totalVotes) * 100 : 0;
          
          return (
            <div key={c.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                  {c.full_name.split(" ")[0][0]}
                </div>
                <div>
                  <div className="font-medium">{c.full_name}</div>
                  <div className="text-sm text-gray-500">{c.manifesto}</div>
                  <div className="text-xs text-gray-400">{c.portfolio.title}</div>
                </div>
              </div>
              <div className="text-right w-48">
                <div className="text-sm text-gray-500">
                  {votesCount} votes
                </div>
                <div className="text-sm text-gray-500">
                  {percentage.toFixed(2)}%
                </div>
                <div className="mt-2">
                  <ProgressBar value={percentage} />
                </div>
              </div>
            </div>
          );
        })}
        {candidates.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No candidates found
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateList;
