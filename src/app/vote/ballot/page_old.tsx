"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface Candidate {
  id: string;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  created_at: string;
}

interface Portfolio {
  id: string;
  title: string;
  description?: string;
  candidates: Candidate[];
}

interface Election {
  id: string;
  title: string;
  description?: string;
  is_general: boolean;
  department?: string;
  end_time: string;
  positions: Portfolio[];
}

interface BallotData {
  voter: {
    id: string;
    student_id: string;
    verified_at: string;
  };
  election: Election;
  session: any;
}

interface VoteSelection {
  portfolio_id: string;
  candidate_id: string;
  portfolio_title: string;
  candidate_name: string;
}

// Loading component
const BallotLoadingScreen = ({
  status,
  error,
}: {
  status: string;
  error?: string;
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
    <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border-4 border-gray-200 shadow-lg">
      <Image
        src="/voteAurora_crest.png"
        alt="UPSA University Crest"
        width={80}
        height={80}
        className="object-contain"
      />
    </div>

    {!error && (
      <div className="w-16 h-16 mb-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
    )}

    <h1
      className={`text-3xl font-semibold text-center mb-4 ${
        error ? "text-red-600" : "text-gray-800"
      }`}
    >
      {error ? "Ballot Loading Error" : "VoteAurora"}
    </h1>

    <p className="text-gray-600 text-center mb-8 max-w-md">
      {error ? "Unable to load your ballot" : "Loading your secure ballot..."}
    </p>

    <p
      className={`text-sm text-center max-w-lg leading-relaxed ${
        error ? "text-red-500" : "text-gray-500"
      }`}
    >
      {error || status}
    </p>

    {error && (
      <div className="mt-6 space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.close()}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    )}
  </div>
);

// Candidate Card Component
const CandidateCard = ({
  candidate,
  isSelected,
  onSelect,
}: {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`
      border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg
      ${
        isSelected
          ? "border-green-500 bg-green-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300"
      }
    `}
  >
    <div className="flex items-start space-x-4">
      {/* Radio Button */}
      <div className="mt-1">
        <div
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${isSelected ? "border-green-500 bg-green-500" : "border-gray-300"}
          `}
        >
          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>

      {/* Candidate Photo */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        {candidate.photo_url ? (
          <img
            src={candidate.photo_url}
            alt={candidate.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-xl font-semibold">
            {candidate.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </div>
        )}
      </div>

      {/* Candidate Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
          {candidate.full_name}
        </h3>
        {candidate.manifesto && (
          <p className="text-gray-600 text-sm line-clamp-3">
            {candidate.manifesto}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Portfolio Section Component
const PortfolioSection = ({
  portfolio,
  selectedCandidateId,
  onCandidateSelect,
}: {
  portfolio: Portfolio;
  selectedCandidateId?: string;
  onCandidateSelect: (candidateId: string) => void;
}) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {portfolio.title}
      </h2>
      {portfolio.description && (
        <p className="text-gray-600">{portfolio.description}</p>
      )}
      <div className="text-sm text-gray-500 mt-2">
        Select one candidate for this position
      </div>
    </div>

    <div className="space-y-4">
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
);

// Vote Review Component
const VoteReview = ({
  selections,
  election,
  onBack,
  onConfirm,
  isSubmitting,
}: {
  selections: VoteSelection[];
  election: Election;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) => (
  <div className="max-w-4xl mx-auto p-6">
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Review Your Votes
        </h1>
        <p className="text-gray-600">
          Please confirm your selections before submitting
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">
          {election.title}
        </h2>
        <p className="text-blue-700">
          {election.is_general
            ? "General Election"
            : `${election.department} Election`}
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {selections.map((selection, index) => (
          <div
            key={selection.portfolio_id}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {selection.portfolio_title}
                </h3>
                <p className="text-green-600 font-medium mt-1">
                  ✓ {selection.candidate_name}
                </p>
              </div>
              <div className="text-sm text-gray-500">Position {index + 1}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600 text-xl"> </div>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">
              Important Notice
            </h3>
            <p className="text-yellow-700 text-sm">
              Once you submit your vote, it cannot be changed. Please ensure all
              your selections are correct.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 justify-center">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Go Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span>{isSubmitting ? "Submitting..." : "Submit Vote"}</span>
        </button>
      </div>
    </div>
  </div>
);

// Main Ballot Content Component
const BallotContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingStatus, setLoadingStatus] = useState("Loading your ballot...");
  const [error, setError] = useState<string | undefined>(undefined);
  const [ballotData, setBallotData] = useState<BallotData | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBallot = async () => {
      try {
        const accessToken = searchParams.get("access_token");

        if (!accessToken) {
          setError("Invalid ballot access. No access token found.");
          return;
        }

        setLoadingStatus("Validating your access...");
        await new Promise((resolve) => setTimeout(resolve, 800));

        setLoadingStatus("Loading election data...");

        const response = await fetch("/api/ballot/load", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: accessToken }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to load ballot");
        }

        setBallotData(result.data);
        setLoadingStatus("Ballot loaded successfully!");

        // Initialize selections object with empty values for each portfolio
        const initialSelections: Record<string, string> = {};
        result.data.election.positions.forEach((portfolio: Portfolio) => {
          initialSelections[portfolio.id] = "";
        });
        setSelections(initialSelections);
      } catch (error) {
        console.error("Ballot loading failed:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    };

    loadBallot();
  }, [searchParams]);

  const handleCandidateSelect = (portfolioId: string, candidateId: string) => {
    setSelections((prev) => ({
      ...prev,
      [portfolioId]: candidateId,
    }));
  };

  const handleReviewVotes = () => {
    // Check if all positions have selections
    const unselectedPositions = ballotData?.election.positions.filter(
      (portfolio) => !selections[portfolio.id]
    );

    if (unselectedPositions && unselectedPositions.length > 0) {
      alert(
        `Please select candidates for: ${unselectedPositions
          .map((p) => p.title)
          .join(", ")}`
      );
      return;
    }

    setShowReview(true);
  };

  const getVoteSelections = (): VoteSelection[] => {
    if (!ballotData) return [];

    return ballotData.election.positions.map((portfolio) => {
      const selectedCandidateId = selections[portfolio.id];
      const selectedCandidate = portfolio.candidates.find(
        (c) => c.id === selectedCandidateId
      );

      return {
        portfolio_id: portfolio.id,
        candidate_id: selectedCandidateId,
        portfolio_title: portfolio.title,
        candidate_name: selectedCandidate?.full_name || "",
      };
    });
  };

  const handleSubmitVotes = async () => {
    setIsSubmitting(true);

    try {
      const accessToken = searchParams.get("access_token");
      const voteSelections = getVoteSelections();

      const response = await fetch("/api/ballot/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
          votes: voteSelections.map((selection) => ({
            portfolio_id: selection.portfolio_id,
            candidate_id: selection.candidate_id,
          })),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to submit votes");
      }

      // Redirect to success page
      router.push("/vote/success");
    } catch (error) {
      console.error("Vote submission failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit your vote"
      );
      setIsSubmitting(false);
    }
  };

  // Show loading screen
  if (!ballotData && !error) {
    return <BallotLoadingScreen status={loadingStatus} />;
  }

  // Show error screen
  if (error) {
    return <BallotLoadingScreen status="" error={error} />;
  }

  // Show review screen
  if (showReview && ballotData) {
    return (
      <VoteReview
        selections={getVoteSelections()}
        election={ballotData.election}
        onBack={() => setShowReview(false)}
        onConfirm={handleSubmitVotes}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Show ballot form
  if (ballotData) {
    const selectedCount = Object.values(selections).filter((id) => id).length;
    const totalPositions = ballotData.election.positions.length;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image
                    src="/voteAurora_crest.png"
                    alt="UPSA Crest"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {ballotData.election.title}
                  </h1>
                  <p className="text-gray-600">
                    {ballotData.election.is_general
                      ? "General Election"
                      : `${ballotData.election.department} Election`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Student ID</div>
                <div className="font-semibold text-gray-800">
                  {ballotData.voter.student_id}
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {selectedCount} of {totalPositions} positions selected
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(selectedCount / totalPositions) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ballot Content */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Cast Your Vote
            </h2>
            <p className="text-gray-600">
              Select one candidate for each position. You can change your
              selections before submitting.
            </p>
          </div>

          {ballotData.election.positions.map((portfolio) => (
            <PortfolioSection
              key={portfolio.id}
              portfolio={portfolio}
              selectedCandidateId={selections[portfolio.id]}
              onCandidateSelect={(candidateId) =>
                handleCandidateSelect(portfolio.id, candidateId)
              }
            />
          ))}

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedCount === totalPositions
                  ? "All positions selected. Ready to submit!"
                  : `${totalPositions - selectedCount} position(s) remaining`}
              </div>
              <button
                onClick={handleReviewVotes}
                disabled={selectedCount !== totalPositions}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Votes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Main component with Suspense
const BallotPage = () => {
  return (
    <Suspense
      fallback={<BallotLoadingScreen status="Loading voting system..." />}
    >
      <BallotContent />
    </Suspense>
  );
};

export default BallotPage;
