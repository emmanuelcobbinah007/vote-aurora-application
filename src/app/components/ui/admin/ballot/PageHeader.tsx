"use client";

import React from "react";
import { ArrowLeft, Save } from "lucide-react";

interface PageHeaderProps {
  electionTitle: string;
  onBack: () => void;
  isEditingOrder: boolean;
  onCancelEdit: () => void;
  onSaveOrder: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  electionTitle,
  onBack,
  isEditingOrder,
  onCancelEdit,
  onSaveOrder,
}) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ballot & Candidates
              </h1>
              <p className="text-gray-600">{electionTitle}</p>
            </div>
          </div>

          {isEditingOrder && (
            <div className="flex items-center space-x-3">
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSaveOrder}
                className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
