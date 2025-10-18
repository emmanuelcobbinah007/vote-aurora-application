"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
  Search,
  Bell,
  X,
  Clock,
  Vote,
  Users,
  Shield,
  Crown,
  FileText,
  PieChart,
  ClipboardList,
  Settings,
  UserPlus,
  CheckCircle,
  History,
} from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  // No need for orchestratorId in superadmin context

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search result interface
  interface SearchResult {
    id: string;
    title: string;
    description: string;
    type: "page" | "action" | "recent";
    url: string;
    icon: React.ReactNode;
  }

  // Mock search data - updated for SuperAdmin
  const searchableItems: SearchResult[] = [
    // Navigation pages
    {
      id: "dashboard",
      title: "Dashboard Overview",
      description: "Main dashboard with system statistics and overview",
      type: "page",
      url: `/superadmin`,
      icon: <Vote className="w-4 h-4" />,
    },
    {
      id: "elections",
      title: "Elections",
      description: "Manage and oversee all elections in the system",
      type: "page",
      url: `/superadmin/elections`,
      icon: <Vote className="w-4 h-4" />,
    },
    {
      id: "subadmins",
      title: "Subadmins",
      description: "Manage subadmin accounts and permissions",
      type: "page",
      url: `/superadmin/subadmins`,
      icon: <UserPlus className="w-4 h-4" />,
    },
    {
      id: "approvals",
      title: "Approvals",
      description: "Review and approve pending system requests",
      type: "page",
      url: `/superadmin/approvals`,
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: "audit-logs",
      title: "Audit Logs",
      description: "View comprehensive system activity and audit trails",
      type: "page",
      url: `/superadmin/audit-logs`,
      icon: <History className="w-4 h-4" />,
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "System analytics and performance metrics",
      type: "page",
      url: `/superadmin/analytics`,
      icon: <PieChart className="w-4 h-4" />,
    },
    {
      id: "reports",
      title: "Reports",
      description: "Generate and view system reports",
      type: "page",
      url: `/superadmin/reports`,
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      id: "settings",
      title: "Settings",
      description: "System configuration and settings",
      type: "page",
      url: `/superadmin/settings`,
      icon: <Settings className="w-4 h-4" />,
    },
    // Quick actions
    {
      id: "create-subadmin",
      title: "Add New Subadmin",
      description: "Create a new subadmin account",
      type: "action",
      url: `/superadmin/subadmins?action=create`,
      icon: <UserPlus className="w-4 h-4" />,
    },
    {
      id: "review-approvals",
      title: "Review Pending Approvals",
      description: "Check and process pending approvals",
      type: "action",
      url: `/superadmin/approvals?filter=pending`,
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: "system-backup",
      title: "System Backup",
      description: "Create system backup and export data",
      type: "action",
      url: `/superadmin/settings?action=backup`,
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  // Search function
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = searchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered.slice(0, 6)); // Limit to 6 results
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
    setIsSearchOpen(true);
  };

  // Handle search result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClearSearch();
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get search result type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "page":
        return "text-amber-700 bg-amber-50";
      case "action":
        return "text-emerald-600 bg-emerald-50";
      case "recent":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Function to get page title based on current route
  const getPageTitle = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Handle different route patterns
    if (pathname === "/superadmin" || pathSegments.length === 1) {
      return "Dashboard Overview";
    }

    // Check if we're in analytics routes
    if (pathSegments.includes("analytics")) {
      // If it's a specific election analytics page
      if (pathSegments.length > 3 && pathSegments[2] === "analytics") {
        return "Analytics";
      }
      // If it's the main analytics page
      return "Analytics";
    }

    switch (lastSegment) {
      case "elections":
        return "Elections Management";
      case "subadmins":
        return "Election Administrators";
      case "approvals":
        return "Elections Approval";
      case "audit-logs":
        return "Audit Logs";
      case "analytics":
        return "Analytics";
      case "settings":
        return "System Settings";
      default:
        return "Dashboard Overview";
    }
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
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
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
        .opacity-0 {
          opacity: 0;
        }
      `}</style>
      <header
        className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between opacity-0 animate-fade-in-up"
        style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}
      >
        {/* Left Side - Page Title */}
        <div className="opacity-0 animate-fade-in-up delay-100">
          <h1 className="text-2xl font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Side - Search Bar and Notifications */}
        <div className="flex items-center space-x-4 opacity-0 animate-fade-in-up delay-200">
          {/* Quick Search Bar */}
          <div className="relative" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Quick find..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery && setIsSearchOpen(true)}
              className="w-80 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
              style={
                {
                  "--tw-ring-color": "#cc910d",
                } as React.CSSProperties
              }
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(
                              result.type
                            )}`}
                          >
                            {result.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p
                              className="text-sm font-medium text-gray-900 group-hover:text-gray-900"
                              style={{
                                color: "inherit",
                              }}
                            >
                              {result.title}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(
                                result.type
                              )}`}
                            >
                              {result.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {isSearchOpen && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                <div className="text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try searching for pages, actions, or features
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
