"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BarChart4,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Vote,
  PieChart,
  Settings,
  UserPlus,
  CheckCircle,
  History,
} from "lucide-react";
import voteAurora_crest from "../../../../../public/voteLogo.png";
import { useParams } from "next/navigation";
import { useSidebar } from "../../../contexts/SidebarContext";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Ensure we only run client-side code after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set userId once we have session data or params
  useEffect(() => {
    if (isClient) {
      console.log("Current pathname:", pathname);
      console.log("Current params:", params);
      console.log("Session user:", session?.user);
      const id = session?.user?.id || (params.superadminId as string) || "";
      console.log("Resolved userId:", id);
      setUserId(id);
    }
  }, [isClient, session, params.superadminId, pathname]);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Show logout state during logout process
  if (isLoggingOut) {
    return (
      <div className="w-64 h-screen bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: "#2ecc71" }}
          ></div>
          <p>Signing out...</p>
        </div>
      </div>
    );
  }

  // If we still don't have userId after hydration and not logging out, show error state
  if (!userId) {
    return (
      <div className="w-64 h-screen bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Unable to load user data</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-2 text-[#2ecc71] hover:text-[#1e8e3e]"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const menuSections = [
    {
      title: "Management",
      items: [
        {
          icon: BarChart3,
          activeIcon: BarChart4,
          label: "Dashboard Overview",
          href: `/superadmin/${userId}/dashboard`,
        },
        {
          icon: Vote,
          activeIcon: Vote,
          label: "Elections",
          href: `/superadmin/${userId}/elections`,
        },
        {
          icon: UserPlus,
          activeIcon: UserPlus,
          label: "Subadmins",
          href: `/superadmin/${userId}/subadmins`,
        },
      ],
    },
    {
      title: "Oversight",
      items: [
        {
          icon: PieChart,
          activeIcon: PieChart,
          label: "Election Analytics",
          href: `/superadmin/${userId}/analytics`,
        },
        {
          icon: CheckCircle,
          activeIcon: CheckCircle,
          label: "Approvals",
          href: `/superadmin/${userId}/approvals`,
        },
        {
          icon: History,
          activeIcon: History,
          label: "Audit Logs",
          href: `/superadmin/${userId}/audit-logs`,
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          icon: Settings,
          activeIcon: Settings,
          label: "Settings",
          href: `/superadmin/${userId}/settings`,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ redirect: false });
      toast.success("Successfully Logged Out");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
      setIsLoggingOut(false); // Reset logout state on error
    }
  };

  const handleNavigate = (url: string) => {
    router.push(url);
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
        .opacity-0 {
          opacity: 0;
        }
      `}</style>
      <div
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}
        style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}
      >
        <ToastContainer />
        {/* Header */}
        <div className="p-4 border-b border-gray-100 opacity-0 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            {isCollapsed ? (
              <div className="flex justify-center w-full">
                <Image
                  src={voteAurora_crest}
                  alt="UPSA University Crest"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <Image
                    src={voteAurora_crest}
                    alt="UPSA University Crest"
                    width={32}
                    height={32}
                    className="object-contain flex-shrink-0"
                  />
                  <div className="transition-opacity duration-200">
                    <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                      Vote<span className="text-[#2ecc71]">Aurora</span>
                    </h1>
                    <p className="text-xs text-gray-500">SuperAdmin</p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              </>
            )}
          </div>
          {isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="mt-2 w-full p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex justify-center"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-6 opacity-0 animate-fade-in-up delay-200">
          {menuSections.map((section, sIndex) => (
            <div key={sIndex}>
              {!isCollapsed && (
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item, index) => {
                  const isActive = pathname === item.href;
                  const IconComponent = isActive ? item.activeIcon : item.icon;

                  return (
                    <div
                      key={index}
                      onClick={() => handleNavigate(item.href)}
                      className={`flex items-center hover:cursor-pointer ${
                        isCollapsed ? "justify-center px-2" : "px-3"
                      } py-3 rounded-xl transition-all duration-200 group relative ${
                        isActive
                          ? "bg-[#2ecc71] text-white shadow-sm"
                          : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                      }`}
                      style={{
                        animationDelay: `${0.3 + index * 0.1}s`,
                      }}
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium text-sm">
                          {item.label}
                        </span>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-100 p-3 opacity-0 animate-fade-in-up delay-600">
          {/* User Profile */}
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "space-x-3"
            } p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 mb-2 group relative`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#2ecc71" }}
            >
              <span className="text-white text-sm font-semibold">
                {session?.user?.name
                  ? session.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : ""}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {session?.user?.name}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-2" : "px-3"
            } py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group relative`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 font-medium text-sm">Logout</span>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
