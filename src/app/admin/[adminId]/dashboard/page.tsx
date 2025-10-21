"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ElectionDetailsPage from "@/app/components/ui/superadmin/elections/details/ElectionDetailsPage";
import { ElectionDetailsShimmer } from "@/app/components/ui/Shimmer";
import { ElectionWithDetails } from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";
import { apiClient } from "@/services/apiClient";

const fetchAdminAssignedElection = async (
  adminId: string
): Promise<ElectionWithDetails> => {
  const response = await apiClient.get(`/admin/${adminId}/assigned-election`);
  return response.data;
};

const AdminDashboard = () => {
  const params = useParams();
  const router = useRouter();
  const adminId = params.adminId as string;

  const {
    data: election,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-assigned-election", adminId],
    queryFn: () => fetchAdminAssignedElection(adminId),
    staleTime: 5 * 60 * 1000,
  });

  const handleBack = () => {
    router.push(`/admin/${adminId}/dashboard`);
  };

  if (isLoading) {
    return <ElectionDetailsShimmer />;
  }

  if (isError || !election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Election Assigned
          </h2>
          <p className="text-gray-600 mb-4">
            You haven&apos;t been assigned to manage any election yet. Please
            contact your supervisor.
          </p>
          <button
            onClick={handleBack}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ElectionDetailsPage
      election={election}
      onBack={handleBack}
      isSuperAdminPage={false}
    />
  );
};

export default AdminDashboard;
