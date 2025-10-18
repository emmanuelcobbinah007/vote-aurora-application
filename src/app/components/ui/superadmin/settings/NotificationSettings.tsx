"use client";
import React, { useState } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Settings as SettingsIcon,
  Save,
} from "lucide-react";

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    electionUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    securityAlerts: true,
    adminActions: true,
    userRegistrations: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const notificationCategories = [
    {
      icon: Mail,
      title: "Email Notifications",
      description: "Receive notifications via email",
      key: "emailNotifications" as keyof typeof notifications,
      enabled: notifications.emailNotifications,
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Receive browser push notifications",
      key: "pushNotifications" as keyof typeof notifications,
      enabled: notifications.pushNotifications,
    },
    {
      icon: MessageSquare,
      title: "Election Updates",
      description: "Get notified about election status changes",
      key: "electionUpdates" as keyof typeof notifications,
      enabled: notifications.electionUpdates,
    },
    {
      icon: SettingsIcon,
      title: "System Alerts",
      description: "Important system maintenance and updates",
      key: "systemAlerts" as keyof typeof notifications,
      enabled: notifications.systemAlerts,
    },
  ];

  const additionalSettings = [
    {
      title: "Weekly Reports",
      description: "Receive weekly activity summaries",
      key: "weeklyReports" as keyof typeof notifications,
      enabled: notifications.weeklyReports,
    },
    {
      title: "Security Alerts",
      description: "Login attempts and security events",
      key: "securityAlerts" as keyof typeof notifications,
      enabled: notifications.securityAlerts,
    },
    {
      title: "Admin Actions",
      description: "Notifications for administrative actions",
      key: "adminActions" as keyof typeof notifications,
      enabled: notifications.adminActions,
    },
    {
      title: "User Registrations",
      description: "New user account registrations",
      key: "userRegistrations" as keyof typeof notifications,
      enabled: notifications.userRegistrations,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Notification Preferences
          </h3>
          <p className="text-sm text-gray-500">
            Manage how you receive notifications
          </p>
        </div>
      </div>

      {/* Main Notification Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {notificationCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div
              key={category.key}
              className="p-4 border border-gray-200 rounded-lg hover:border-amber-300 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {category.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={category.enabled}
                    onChange={() => handleToggle(category.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Settings */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Additional Settings
        </h4>
        <div className="space-y-3">
          {additionalSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{setting.title}</p>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => handleToggle(setting.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
