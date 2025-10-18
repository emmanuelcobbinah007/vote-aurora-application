"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Candidate } from "@/services/adminApi";

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: (candidateId: string) => void;
  onDelete: (candidateId: string) => void;
  isElectionLocked?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onEdit,
  onDelete,
  isElectionLocked = false,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
              alt={candidate.full_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Photo</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {candidate.full_name}
          </h3>
          {candidate.manifesto && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {candidate.manifesto}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(candidate.id)}
          disabled={isElectionLocked}
          className={`p-2 transition-colors ${
            isElectionLocked
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 hover:text-amber-600"
          }`}
          title={
            isElectionLocked
              ? "Cannot edit candidates when election is live or closed"
              : "Edit candidate"
          }
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(candidate.id)}
          disabled={isElectionLocked}
          className={`p-2 transition-colors ${
            isElectionLocked
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 hover:text-red-600"
          }`}
          title={
            isElectionLocked
              ? "Cannot delete candidates when election is live or closed"
              : "Delete candidate"
          }
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
