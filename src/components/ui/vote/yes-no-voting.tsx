import React from "react";
import { Check, X } from "lucide-react";
import { Candidate } from "./types";

interface YesNoVotingProps {
  candidate: Candidate;
  selectedChoice?: "yes" | "no";
  onChoiceSelect: (choice: "yes" | "no") => void;
}

export const YesNoVoting: React.FC<YesNoVotingProps> = ({
  candidate,
  selectedChoice,
  onChoiceSelect,
}) => (
  <div className="w-[85%]  max-w-2xl mx-auto px-4 sm:px-6">
    {/* Candidate Card - Read Only */}
    <div className="bg-white sm:w-[50%] mx-auto border-2 border-gray-200 rounded-xl overflow-hidden mb-8 shadow-sm">
      {/* Candidate Photo */}
      <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
        {candidate.photo_url ? (
          <img
            src={candidate.photo_url}
            alt={candidate.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-6xl sm:text-7xl font-bold">
            {candidate.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* Visual Separator */}
      <div className="h-1 bg-gradient-to-r from-blue-50 via-gray-100 to-blue-50" />

      {/* Candidate Info */}
      <div className="p-6 sm:p-8 bg-white text-center">
        <h3 className="font-bold text-2xl sm:text-3xl text-gray-900 mb-4">
          {candidate.full_name}
        </h3>
        {candidate.manifesto && (
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {candidate.manifesto}
          </p>
        )}
      </div>
    </div>

    {/* Yes/No Voting Options */}
    <div className="text-center mb-6">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
        Do you vote for this candidate?
      </h4>
      <p className="text-gray-600 text-sm sm:text-base">
        Select your choice below
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
      {/* Yes Option */}
      <button
        onClick={() => onChoiceSelect("yes")}
        className={`
          relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg
          ${
            selectedChoice === "yes"
              ? "border-green-500 bg-green-50 shadow-md"
              : "border-gray-200 bg-white hover:border-green-300"
          }
        `}
      >
        {/* Selection Indicator */}
        <div className="absolute top-3 right-3">
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${
                selectedChoice === "yes"
                  ? "border-green-500 bg-green-500"
                  : "border-gray-300 bg-white"
              }
            `}
          >
            {selectedChoice === "yes" && (
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl sm:text-4xl mb-2 flex justify-center">
            <Check className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-green-600 mb-1">
            YES
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            Vote for {candidate.full_name}
          </div>
        </div>
      </button>

      {/* No Option */}
      <button
        onClick={() => onChoiceSelect("no")}
        className={`
          relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg
          ${
            selectedChoice === "no"
              ? "border-red-500 bg-red-50 shadow-md"
              : "border-gray-200 bg-white hover:border-red-300"
          }
        `}
      >
        {/* Selection Indicator */}
        <div className="absolute top-3 right-3">
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${
                selectedChoice === "no"
                  ? "border-red-500 bg-red-500"
                  : "border-gray-300 bg-white"
              }
            `}
          >
            {selectedChoice === "no" && (
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl sm:text-4xl mb-2 flex justify-center">
            <X className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-red-600 mb-1">
            NO
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            Do not vote for this position
          </div>
        </div>
      </button>
    </div>

    {/* Selection Status */}
    {selectedChoice && (
      <div className="text-center">
        <span
          className={`
          inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border
          ${
            selectedChoice === "yes"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          }
        `}
        >
          {selectedChoice === "yes" ? (
            <>
              <Check className="w-3 h-3 mr-1" /> Voting YES
            </>
          ) : (
            <>
              <X className="w-3 h-3 mr-1" /> Voting NO
            </>
          )}
        </span>
      </div>
    )}
  </div>
);
