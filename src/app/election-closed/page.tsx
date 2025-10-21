"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const ElectionClosedContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const adminId = searchParams.get("adminId");
  const electionId = searchParams.get("electionId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 text-center bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
            <svg
              className="h-8 w-8 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Election Closed
          </h2>
          <p className="text-gray-600 mb-4">
            The assigned election has been closed and is no longer accessible.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Contact your supervisor or a super admin to access the results.
          </p>

          {electionId && (
            <p className="text-xs text-gray-400">Election ID: {electionId}</p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/login")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};

const ElectionClosedPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ElectionClosedContent />
    </Suspense>
  );
};

export default ElectionClosedPage;
