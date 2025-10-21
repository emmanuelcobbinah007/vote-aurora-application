"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, X } from "lucide-react";
import {
  BallotData,
  VoteSelection,
  Portfolio,
  BallotLoadingScreen,
  PositionVoting,
  VoteReview,
} from "../../../components/ui/vote";

// Main Ballot Content Component
const BallotContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingStatus, setLoadingStatus] = useState("Loading your ballot...");
  const [error, setError] = useState<string | undefined>(undefined);
  const [ballotData, setBallotData] = useState<BallotData | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [yesNoChoices, setYesNoChoices] = useState<
    Record<string, "yes" | "no">
  >({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

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
          // Check if it's a token expiration error
          if (
            result.message?.includes("expired") ||
            result.message?.includes("Access token has expired")
          ) {
            // Redirect to verification page with appropriate message
            router.push("/vote?expired=true");
            return;
          }

          // Check if already voted
          if (result.error_code === "ALREADY_VOTED") {
            router.push("/vote/success?already_voted=true");
            return;
          }

          throw new Error(result.message || "Failed to load ballot");
        }

        setBallotData(result.data);
        setLoadingStatus("Ballot loaded successfully!");

        // Set session expiry time if provided by the API
        if (result.data.session_expires_at) {
          setSessionExpiresAt(new Date(result.data.session_expires_at));
        }

        // Initialize selections object with empty values for each portfolio
        const initialSelections: Record<string, string> = {};
        result.data.election.positions.forEach((portfolio: Portfolio) => {
          initialSelections[portfolio.id] = "";
        });
        setSelections(initialSelections);
      } catch (error) {
        console.error("Ballot loading failed:", error);

        // Check if it's a token expiration error in the catch block
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        if (
          errorMessage.includes("expired") ||
          errorMessage.includes("Access token has expired")
        ) {
          // Redirect to verification page with appropriate message
          router.push("/vote?expired=true");
          return;
        }

        setError(errorMessage);
      }
    };

    loadBallot();
  }, [searchParams]);

  // Session monitoring effect
  useEffect(() => {
    if (!sessionExpiresAt) return;

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = sessionExpiresAt.getTime();
      const remaining = Math.max(0, expiry - now);

      setTimeRemaining(remaining);

      // Show warning when 5 minutes remain
      if (remaining <= 5 * 60 * 1000 && remaining > 0) {
        setShowExpiryWarning(true);
      }

      // Redirect when expired
      if (remaining <= 0) {
        router.push("/vote?expired=true");
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiresAt, router]);

  // Helper function to format time remaining
  const formatTimeRemaining = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCandidateSelect = (candidateId: string) => {
    if (!ballotData) return;

    const currentPortfolio = ballotData.election.positions[currentStep - 1];
    setSelections((prev) => ({
      ...prev,
      [currentPortfolio.id]: candidateId,
    }));
  };

  const handleYesNoChoice = (choice: "yes" | "no") => {
    if (!ballotData) return;

    const currentPortfolio = ballotData.election.positions[currentStep - 1];
    setYesNoChoices((prev) => ({
      ...prev,
      [currentPortfolio.id]: choice,
    }));
  };

  const handleNext = () => {
    if (currentStep < (ballotData?.election.positions.length ?? 0) - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowReview(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getCompletedSteps = (): Set<number> => {
    if (!ballotData) return new Set();

    // Allow abstention - all portfolios are considered complete
    const completed = new Set<number>();
    ballotData.election.positions.forEach((portfolio, index) => {
      completed.add(index + 1);
    });
    return completed;
  };

  const getVoteSelections = (): VoteSelection[] => {
    if (!ballotData) return [];

    return ballotData.election.positions.map((portfolio) => {
      const isSingleCandidate = portfolio.candidates.length === 1;

      if (isSingleCandidate) {
        const choice = yesNoChoices[portfolio.id];
        const candidate = portfolio.candidates[0];

        if (!choice) {
          // Abstention - no vote cast
          return {
            portfolio_id: portfolio.id,
            candidate_id: null,
            portfolio_title: portfolio.title,
            candidate_name: "Abstained",
          };
        }

        return {
          portfolio_id: portfolio.id,
          candidate_id: choice === "yes" ? candidate.id : null,
          portfolio_title: portfolio.title,
          candidate_name: choice === "yes" ? candidate.full_name : "No Vote",
        };
      } else {
        const selectedCandidateId = selections[portfolio.id];
        const selectedCandidate = portfolio.candidates.find(
          (c) => c.id === selectedCandidateId
        );

        if (!selectedCandidateId || selectedCandidateId === "") {
          // Abstention - no vote cast
          return {
            portfolio_id: portfolio.id,
            candidate_id: null,
            portfolio_title: portfolio.title,
            candidate_name: "Abstained",
          };
        }

        return {
          portfolio_id: portfolio.id,
          candidate_id: selectedCandidateId,
          portfolio_title: portfolio.title,
          candidate_name: selectedCandidate?.full_name || "",
        };
      }
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
            candidate_id: selection.candidate_id, // Include null for abstentions
          })),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        // Check if user has already voted
        if (result.error_code === "ALREADY_VOTED") {
          console.log("User has already voted, redirecting to success page");
          router.push("/vote/success");
          return;
        }

        // Check if it's a token expiration error
        if (
          result.message?.includes("expired") ||
          result.message?.includes("Access token has expired")
        ) {
          // Redirect to verification page with appropriate message
          router.push("/vote?expired=true");
          return;
        }
        throw new Error(result.message || "Failed to submit votes");
      }

      // Redirect to success page
      router.push("/vote/success");
    } catch (error) {
      console.error("Vote submission failed:", error);

      // Check if it's a token expiration error in the catch block
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit your vote";
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("Access token has expired")
      ) {
        // Redirect to verification page with appropriate message
        router.push("/vote?expired=true");
        return;
      }

      setError(`Failed to submit your vote. Please try again. ${errorMessage}`);
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

  // Show position voting
  if (ballotData) {
    const currentPortfolio = ballotData.election.positions[currentStep - 1];
    const totalPositions = ballotData.election.positions.length;
    const completedSteps = getCompletedSteps();
    const isSingleCandidate = currentPortfolio.candidates.length === 1;
    const currentSelection = selections[currentPortfolio.id];
    const currentChoice = yesNoChoices[currentPortfolio.id];
    const hasCurrentSelection = true; // Allow abstention - always allow proceeding
    const isLastStep = currentStep === totalPositions;
    const allComplete = completedSteps.size === totalPositions;

    // Helper function to get selection status text
    const getSelectionStatusText = () => {
      if (isSingleCandidate) {
        if (currentChoice === "yes") {
          return `✓ Voting YES for ${currentPortfolio.candidates[0].full_name}`;
        } else if (currentChoice === "no") {
          return "✓ Voting NO for this position";
        } else {
          return "Please vote Yes or No";
        }
      } else {
        if (currentSelection) {
          const selectedCandidate = currentPortfolio.candidates.find(
            (c) => c.id === currentSelection
          );
          return `✓ Selected: ${selectedCandidate?.full_name}`;
        } else {
          return "Please select a candidate";
        }
      }
    };

    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header - Mobile Optimized */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="w-full px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src="../../../../public/voteAurora_crest.png"
                    alt="UPSA Crest"
                    width={24}
                    height={24}
                    className="object-contain sm:w-8 sm:h-8"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                    {ballotData.election.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {ballotData.election.is_general
                      ? "General Election"
                      : `${ballotData.election.department} Election`}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs sm:text-sm text-gray-500">
                  Student ID
                </div>
                <div className="font-semibold text-sm sm:text-base text-gray-800">
                  {ballotData.voter.student_id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Session Warning Banner */}
          {showExpiryWarning && timeRemaining > 0 && (
            <div className="bg-orange-50 border-b border-orange-200 px-4 sm:px-6 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Your voting session will expire soon
                    </p>
                    <p className="text-xs text-orange-700">
                      Time remaining: {formatTimeRemaining(timeRemaining)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExpiryWarning(false)}
                  className="text-orange-600 hover:text-orange-800 p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Position Voting */}
          <div className="flex-1 overflow-auto">
            <PositionVoting
              portfolio={currentPortfolio}
              selectedCandidateId={currentSelection}
              selectedChoice={yesNoChoices[currentPortfolio.id]}
              onCandidateSelect={handleCandidateSelect}
              onChoiceSelect={handleYesNoChoice}
              currentPosition={currentStep}
              totalPositions={totalPositions}
              completedPositions={completedSteps}
            />
          </div>
        </div>

        {/* Navigation - Mobile Optimized */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 shadow-lg">
          <div className="w-full max-w-6xl mx-auto">
            {/* Selection Status - Mobile First */}
            <div className="text-center mb-3 sm:hidden">
              <div className="text-sm text-gray-600">
                {getSelectionStatusText()}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
              >
                Previous
              </button>

              {/* Selection Status - Desktop */}
              <div className="hidden sm:block text-sm text-gray-600 text-center px-4">
                {getSelectionStatusText()}
              </div>

              {isLastStep ? (
                <button
                  onClick={() => setShowReview(true)}
                  disabled={!allComplete}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                >
                  Review Votes
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!hasCurrentSelection}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                >
                  Next
                </button>
              )}
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
