"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Portfolio } from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";
import { Candidate } from "@/services/adminApi";
import CandidateCard from "./CandidateCard";

interface PortfolioCandidatesProps {
  portfolio: Portfolio;
  candidates?: Candidate[];
  onAddCandidate: (portfolioId: string) => void;
  onEditCandidate: (candidateId: string) => void;
  onDeleteCandidate: (candidateId: string) => void;
  isElectionLocked?: boolean;
}

const PortfolioCandidates: React.FC<PortfolioCandidatesProps> = ({
  portfolio,
  candidates = [],
  onAddCandidate,
  onEditCandidate,
  onDeleteCandidate,
  isElectionLocked = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {portfolio.title}
            </h2>
            {portfolio.description && (
              <p className="text-gray-600 mt-1">{portfolio.description}</p>
            )}
          </div>
          <button
            onClick={() => onAddCandidate(portfolio.id)}
            disabled={isElectionLocked}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isElectionLocked
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#cc910d] text-white hover:bg-[#b8820c]"
            }`}
            title={
              isElectionLocked
                ? "Cannot add candidates when election is live or closed"
                : "Add candidate"
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </button>
        </div>
      </div>

      <div className="p-6">
        {candidates && candidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onEdit={onEditCandidate}
                onDelete={onDeleteCandidate}
                isElectionLocked={isElectionLocked}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No candidates yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add candidates for the {portfolio.title} portfolio to get started.
            </p>
            <button
              onClick={() => onAddCandidate(portfolio.id)}
              disabled={isElectionLocked}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                isElectionLocked
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#cc910d] text-white hover:bg-[#b8820c]"
              }`}
              title={
                isElectionLocked
                  ? "Cannot add candidates when election is live or closed"
                  : "Add first candidate"
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Candidate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioCandidates;
