"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminCandidateManager from "@/app/components/ui/admin/candidates/AdminCandidateManager";
import { useAdminCandidates, AdminContext } from "@/hooks/useAdminCandidates";
import { Loader2 } from "lucide-react";

interface AdminCandidatesPageProps {
  params: {
    adminId: string;
    electionId: string;
  };
}

export default function AdminCandidatesPage({ params }: AdminCandidatesPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { adminId, electionId } = params;
  
  const adminContext: AdminContext = { adminId, electionId };
  const { isLoading, error, data: candidates } = useAdminCandidates(adminContext);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session && session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <h2 className="mt-4 text-lg font-medium">Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-red-800 text-lg font-medium mb-2">Error</h2>
          <p className="text-red-600">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Candidate Management</h1>
        <p className="text-gray-600">
          Add, edit, or remove candidates for this election. All candidates require a name and must be associated with a portfolio.
        </p>
      </div>
      
      <AdminCandidateManager electionId={electionId} />
      
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">About Candidate Photos</h3>
        <p className="text-amber-700 text-sm">
          Uploaded candidate photos are automatically stored in Cloudinary. This provides optimized image delivery and ensures consistent quality across different devices.
        </p>
      </div>
    </div>
  );
}