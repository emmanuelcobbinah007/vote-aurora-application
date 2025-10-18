"use client";
import React, { useState } from "react";
import { User, Shield, Bell } from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";
import NotificationSettings from "./NotificationSettings";

const SettingsContainer: React.FC = () => {
  const [activeSection, setActiveSection] = useState("profile");

  // Mock user data - replace with actual user data
  const userData = {
    name: "John Doe",
    email: "john.doe@upsa.edu.gh",
    phone: "+233 24 123 4567",
    address: "University of Professional Studies, Accra",
    role: "Super Administrator",
  };

  const settingsSections = [
    {
      id: "profile",
      title: "Profile",
      icon: User,
      description: "Personal information and profile settings",
      component: <ProfileSettings user={userData} />,
    },
    {
      id: "security",
      title: "Security",
      icon: Shield,
      description: "Password and security preferences",
      component: <SecuritySettings />,
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Email and push notification settings",
      component: <NotificationSettings />,
    },
  ];

  const currentSection = settingsSections.find(
    (section) => section.id === activeSection
  );

  return (
    <div className="space-y-6">
      {/* Settings Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsSections.map((section) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  isActive
                    ? "border-[#2ecc71] bg-green-50 shadow-sm"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-25"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? "bg-[#2ecc71]/20" : "bg-gray-100"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${
                        isActive ? "text-[#2ecc71]" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        isActive ? "text-green-900" : "text-gray-900"
                      }`}
                    >
                      {section.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        isActive ? "text-[#2ecc71]" : "text-gray-500"
                      }`}
                    >
                      {section.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="animate-fade-in">{currentSection?.component}</div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SettingsContainer;
