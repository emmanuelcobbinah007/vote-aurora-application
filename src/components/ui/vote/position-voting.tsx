import React from "react";
import { Portfolio } from "./types";
import { ProgressSteps } from "./progress-steps";
import { YesNoVoting } from "./yes-no-voting";
import { CandidateCard } from "./candidate-card";

interface PositionVotingProps {
  portfolio: Portfolio;
  selectedCandidateId?: string;
  selectedChoice?: "yes" | "no";
  onCandidateSelect: (candidateId: string) => void;
  onChoiceSelect: (choice: "yes" | "no") => void;
  currentPosition: number;
  totalPositions: number;
  completedPositions: Set<number>;
}

export const PositionVoting: React.FC<PositionVotingProps> = ({
  portfolio,
  selectedCandidateId,
  selectedChoice,
  onCandidateSelect,
  onChoiceSelect,
  currentPosition,
  totalPositions,
  completedPositions,
}) => {
  const isSingleCandidate = portfolio.candidates.length === 1;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Progress Steps */}
      <ProgressSteps
        currentStep={currentPosition}
        totalSteps={totalPositions}
        completedSteps={completedPositions}
      />

      {/* Position Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {portfolio.title}
        </h1>
        {portfolio.description && (
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {portfolio.description}
          </p>
        )}
        <div className="text-xs sm:text-sm text-gray-500">
          Position {currentPosition} of {totalPositions} •{" "}
          {isSingleCandidate ? "Vote Yes or No" : "Select one candidate"}
        </div>
      </div>

      {/* Single Candidate - Yes/No Voting */}
      {isSingleCandidate ? (
        <YesNoVoting
          candidate={portfolio.candidates[0]}
          selectedChoice={selectedChoice}
          onChoiceSelect={onChoiceSelect}
        />
      ) : (
        /* Multiple Candidates - Selection Grid */
        <div className="px-4 sm:px-6 w-[85%] mx-auto ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {portfolio.candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedCandidateId === candidate.id}
                onSelect={() => onCandidateSelect(candidate.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
