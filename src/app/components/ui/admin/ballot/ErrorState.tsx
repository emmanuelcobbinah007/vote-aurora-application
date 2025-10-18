"use client";

import React from "react";

interface ErrorStateProps {
  onBack: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Election Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          Unable to load election data. Please try again or contact support.
        </p>
        <button
          onClick={onBack}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
