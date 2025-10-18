"use client";
import React from "react";
import { SettingsContainer } from "../../../components/ui/superadmin/settings";

const SettingsPage = () => {
  return (
    <div className={`flex-1 flex flex-col transition-all duration-300`}>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-gray-600">
              Manage your account preferences and system settings
            </p>
          </div>

          {/* Settings Content */}
          <SettingsContainer />
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
