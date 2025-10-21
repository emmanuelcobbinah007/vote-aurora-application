"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const VoteSuccessPage = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.close(); // Try to close the tab/window
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* University Logo */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-200">
          <Image
            src="/voteAurora_crest.png"
            alt="UPSA University Crest"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>

        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Vote Successfully Cast!
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Thank you for participating in the democratic process. Your vote has
          been securely recorded and will remain anonymous.
        </p>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">
            Important Information:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your vote has been encrypted and stored securely</li>
            <li>• You cannot change or resubmit your vote</li>
            <li>• Results will be announced after the election closes</li>
            <li>• This window will close automatically</li>
          </ul>
        </div>

        {/* Security Confirmation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              Secure • Anonymous • Verified
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleClose}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Close Window
          </button>

          <p className="text-sm text-gray-500">
            This window will automatically close in{" "}
            <span className="font-semibold text-green-600">{countdown}</span>{" "}
            seconds
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            VoteAurora • University of Professional Studies, Accra
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure Electronic Voting System
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoteSuccessPage;
