"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ElectionDetailsPage from "@/app/components/ui/superadmin/elections/details/ElectionDetailsPage";
import { ElectionDetailsShimmer } from "@/app/components/ui/Shimmer";
import { ElectionWithDetails } from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";
import { ELECTION_QUERY_KEYS } from "@/hooks/useElections";

const fetchElection = async (
  electionId: string
): Promise<ElectionWithDetails> => {
  const res = await fetch(`/api/superadmin/elections/${electionId}`);
  if (!res.ok) throw new Error("Failed to fetch election");
  return (await res.json()) as ElectionWithDetails;
};

const ElectionDetailsRoute = () => {
  const params = useParams();
  const router = useRouter();
  const electionId = params.electionId as string;
  const superadminId = params.superadminId as string;

  const {
    data: election,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ELECTION_QUERY_KEYS.detail(electionId),
    queryFn: () => fetchElection(electionId),
    staleTime: 5 * 60 * 1000,
  });

  const handleBack = () => {
    router.push(`/superadmin/${superadminId}/elections`);
  };

  if (isLoading) {
    return <ElectionDetailsShimmer />;
  }

  if (isError || !election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Election Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The election you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={handleBack}
            className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2 rounded-lg"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return <ElectionDetailsPage election={election} onBack={handleBack} />;
};

export default ElectionDetailsRoute;
