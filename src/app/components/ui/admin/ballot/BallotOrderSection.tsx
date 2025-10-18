"use client";

import React from "react";
import { GripVertical } from "lucide-react";
import { Portfolio } from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";

interface BallotOrderSectionProps {
  portfolios: Portfolio[];
  onBallotOrderChange: (newOrder: Portfolio[]) => void;
}

const BallotOrderSection: React.FC<BallotOrderSectionProps> = ({
  portfolios,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Ballot Order</h2>
        <span className="text-sm text-gray-500">Read-only for admins</span>
      </div>

      <div className="space-y-2">
        {portfolios.map((portfolio, index) => (
          <div
            key={portfolio.id}
            className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <GripVertical className="h-5 w-5 text-gray-400 mr-3" />
            <div className="flex-1">
              <span className="font-medium text-gray-900">
                {index + 1}. {portfolio.title}
              </span>
              {portfolio.description && (
                <p className="text-sm text-gray-600">{portfolio.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {portfolios.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No portfolios available for this election.
        </p>
      )}
    </div>
  );
};

export default BallotOrderSection;
