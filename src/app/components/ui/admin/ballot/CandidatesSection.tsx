"use client";

import React from "react";
import { Portfolio } from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";
import { Candidate } from "@/services/adminApi";
import PortfolioCandidates from "./PortfolioCandidates";

interface CandidatesSectionProps {
  portfolios: Portfolio[];
  candidates?: Candidate[]; // Add candidates prop
  onAddCandidate: (portfolioId: string) => void;
  onEditCandidate: (candidateId: string) => void;
  onDeleteCandidate: (candidateId: string) => void;
  isElectionLocked?: boolean;
}

const CandidatesSection: React.FC<CandidatesSectionProps> = ({
  portfolios,
  candidates = [], // Default to empty array
  onAddCandidate,
  onEditCandidate,
  onDeleteCandidate,
  isElectionLocked = false,
}) => {
  return (
    <div className="space-y-8">
      {portfolios?.map((portfolio) => {
        // Filter candidates for this portfolio
        const portfolioCandidates = candidates.filter(
          (candidate) => candidate.portfolio_id === portfolio.id
        );

        return (
          <PortfolioCandidates
            key={portfolio.id}
            portfolio={portfolio}
            candidates={portfolioCandidates}
            onAddCandidate={onAddCandidate}
            onEditCandidate={onEditCandidate}
            onDeleteCandidate={onDeleteCandidate}
            isElectionLocked={isElectionLocked}
          />
        );
      })}
    </div>
  );
};

export default CandidatesSection;
