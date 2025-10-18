import React from "react";
import { VoteSelection, Election } from "./types";

interface VoteReviewProps {
  selections: VoteSelection[];
  election: Election;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const VoteReview: React.FC<VoteReviewProps> = ({
  selections,
  election,
  onBack,
  onConfirm,
  isSubmitting,
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
