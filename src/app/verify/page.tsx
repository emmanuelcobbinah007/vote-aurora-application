"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function VerifyVotePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/verify/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_code: code.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Verification failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/voteAurora_crest.png"
              alt="Logo"
              width={32}
              height={32}
            />
            <span className="font-bold text-xl text-gray-900">VoteAurora</span>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Verify Your Vote</h1>
            <p className="text-blue-100">
              Enter your verification code to prove your vote was counted.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ABC-DEF-123-456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg uppercase tracking-wide placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Vote"
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-8 border-t border-gray-200 pt-8 animate-fade-in">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900">
                        Vote Verified
                      </h3>
                      <p className="text-sm text-green-700">
                        Your vote was successfully counted.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-gray-600">Election</span>
                      <span className="font-medium text-gray-900 text-right">
                        {result.receipt.election_title}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium text-gray-900">
                        {result.receipt.election_status}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-green-200">
                      <span className="text-gray-600">Voted At</span>
                      <span className="font-medium text-gray-900">
                        {new Date(result.receipt.voted_at).toLocaleString()}
                      </span>
                    </div>
                    
                    {result.receipt.tree_finalized ? (
                      <div className="mt-4 bg-white bg-opacity-60 rounded p-3 border border-green-200">
                        <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-1">
                          Cryptographic Proof
                        </p>
                        <div className="flex items-center space-x-2 text-green-700 mb-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Merkle Proof Valid</span>
                        </div>
                        <div className="text-xs text-gray-500 break-all">
                          Root: {result.receipt.merkle_root?.substring(0, 20)}...
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 bg-yellow-50 rounded p-3 border border-yellow-200">
                        <div className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Pending Finalization
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Cryptographic proof will be available once the election closes and the Merkle tree is finalized.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
