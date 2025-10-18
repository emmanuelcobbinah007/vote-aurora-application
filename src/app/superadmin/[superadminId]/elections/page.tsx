"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import ElectionsPage from "@/app/components/ui/superadmin/elections/ElectionsPage";
import type { Election } from "@/app/components/ui/superadmin/elections/ElectionTypes";

const ElectionsRoute = () => {
  const params = useParams();
  const router = useRouter();

  const handleViewDetails = (election: Election) => {
    router.push(`/superadmin/${params.superadminId}/elections/${election.id}`);
  };

  return <ElectionsPage onViewDetails={handleViewDetails} />;
};

export default ElectionsRoute;
