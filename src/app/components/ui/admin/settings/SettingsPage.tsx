"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SettingsLayout from "./SettingsLayout";
import ProfileCard from "./ProfileCard";
import PasswordForm from "./PasswordForm";
import PreferencesForm from "./PreferencesForm";
import { adminApi } from "@/services/adminApi";

const SettingsPage = () => {
  const params = useParams();
  const adminId = params.adminId as string;

  const {
    data: adminProfile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-profile", adminId],
    queryFn: () => adminApi.getAdminProfile(adminId as any),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="animate-pulse">
          <div className="bg-gray-300 h-32 rounded-lg mb-6"></div>
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gray-300 h-48 rounded-lg"></div>
            <div className="bg-gray-300 h-48 rounded-lg"></div>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  if (isError || !adminProfile) {
    return (
      <SettingsLayout>
        <div className="col-span-3 text-center py-12">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Profile
          </h3>
          <p className="text-gray-600 mb-4">
            Unable to load your profile information. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Try Again
          </button>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <ProfileCard
        name={adminProfile.full_name}
        email={adminProfile.email}
        role={adminProfile.role}
        status={adminProfile.status}
        lastLogin={adminProfile.last_login}
      />
      <div className="md:col-span-2 space-y-4">
        <PasswordForm adminId={adminId} onSuccess={() => refetch()} />
        <PreferencesForm
          adminId={adminId}
          adminProfile={adminProfile}
          onSuccess={() => refetch()}
        />
      </div>
    </SettingsLayout>
  );
};

export default SettingsPage;
