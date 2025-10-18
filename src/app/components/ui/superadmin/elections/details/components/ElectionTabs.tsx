import React from "react";
import { FileText, Settings, Users, Calendar, BarChart3 } from "lucide-react";

export type ElectionTab =
  | "overview"
  | "portfolios"
  | "candidates"
  | "ballot-setup"
  | "audit-results";

interface ElectionTabsProps {
  activeTab: ElectionTab;
  tabLoading: { [key: string]: boolean };
  onTabChange: (tab: ElectionTab) => void;
  setActiveTab: (tab: ElectionTab) => void;
}

const ElectionTabs: React.FC<ElectionTabsProps> = ({
  activeTab,
  tabLoading,
  onTabChange,
  setActiveTab,
}) => {
  const tabs = [
    { id: "overview" as ElectionTab, label: "Overview", icon: FileText },
    { id: "portfolios" as ElectionTab, label: "Portfolios", icon: Settings },
    { id: "candidates" as ElectionTab, label: "Candidates", icon: Users },
    {
      id: "ballot-setup" as ElectionTab,
      label: "Ballot Setup",
      icon: Calendar,
    },
    {
      id: "audit-results" as ElectionTab,
      label: "Audit & Results",
      icon: BarChart3,
    },
  ];

  const getTabButtonClass = (tab: ElectionTab) => {
    const isActive = activeTab === tab;
    const isLoading = tabLoading[tab];

    return `py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
      isActive
        ? "border-[#2ecc71] text-[#2ecc71]"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`;
  };

  const getTabStyle = (tab: ElectionTab) => {
    return activeTab === tab
      ? { borderColor: "#2ecc71", color: "#2ecc71" }
      : {};
  };

  const handleTabClick = (tab: ElectionTab) => {
    if (tab === "overview") {
      setActiveTab(tab);
    } else {
      onTabChange(tab);
    }
  };

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            disabled={tabLoading[id]}
            className={getTabButtonClass(id)}
            style={getTabStyle(id)}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ElectionTabs;
