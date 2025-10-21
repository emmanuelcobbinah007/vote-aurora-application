import React from "react";
import Image from "next/image";

interface BallotLoadingScreenProps {
  status: string;
  error?: string;
}

export const BallotLoadingScreen: React.FC<BallotLoadingScreenProps> = ({
  status,
  error,
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
    <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border-4 border-gray-200 shadow-lg">
      <Image
        src="../../../../public/voteAurora_crest.png"
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
