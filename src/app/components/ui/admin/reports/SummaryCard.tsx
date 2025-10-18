import React from "react";
import type { ReportElection, VotingStats } from "./types";
import { getElectionStatusColor } from "./types";

interface SummaryCardProps {
  election: ReportElection;
  votingStats: VotingStats;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ election, votingStats }) => {
  return (
    <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500">Election</div>
        <div className="text-2xl font-bold text-gray-900">{election.title}</div>
        <div className="text-sm text-gray-500">{election.department}</div>
        <div className="mt-2 text-sm">
          <span className={`inline-block px-2 py-0.5 text-xs rounded ${getElectionStatusColor(election.status)}`}>
            {election.status}
          </span>
          <span className="ml-3 text-xs text-gray-500">
            Ends: {election.end_time.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500">Total votes</div>
        <div className="text-3xl font-extrabold text-amber-600">
          {votingStats.totalVotes}
        </div>
        <div className="text-sm text-gray-500">
          Turnout: {Math.round(votingStats.turnoutPercentage)}%
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
