import React from "react";
import { Candidate } from "./types";

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected,
  onSelect,
}) => (
  <div
    onClick={onSelect}
    className={`
      relative border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden
      ${
        isSelected
          ? "border-green-500 bg-white shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300"
      }
    `}
  >
    {/* Selection Indicator - Top Right */}
    <div className="absolute top-4 right-4 z-10">
      <div
        className={`
          w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg
          ${
            isSelected
              ? "border-green-500 bg-green-500"
              : "border-white bg-white"
          }
        `}
      >
        {isSelected && <div className="w-3.5 h-3.5 bg-white rounded-full" />}
      </div>
    </div>

    {/* Candidate Photo - Enhanced Focus */}
    <div className="w-full h-56 sm:h-74 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
      {candidate.photo_url ? (
        <img
          src={candidate.photo_url}
          alt={candidate.full_name}
          className="w-full h-74 object-cover"
        />
      ) : (
        <div className="text-gray-400 text-5xl sm:text-6xl font-bold">
          {candidate.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)}
        </div>
      )}

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>

    {/* Visual Separator */}
    <div className="h-1 bg-gradient-to-r from-blue-50 via-gray-100 to-blue-50" />

    {/* Candidate Info - Clearly Separated */}
    <div className="p-5 sm:p-6 bg-white">
      <h3 className="font-bold text-xl sm:text-2xl text-gray-900 mb-3 text-center leading-tight">
        {candidate.full_name}
      </h3>
      {candidate.manifesto && (
        <p
          className="text-gray-600 text-sm sm:text-base text-center leading-relaxed overflow-hidden mb-3"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
          }}
        >
          {candidate.manifesto}
        </p>
      )}

      {/* Selection Status Badge */}
      {isSelected && (
        <div className="text-center">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
            ✓ Selected
          </span>
        </div>
      )}
    </div>
  </div>
);
