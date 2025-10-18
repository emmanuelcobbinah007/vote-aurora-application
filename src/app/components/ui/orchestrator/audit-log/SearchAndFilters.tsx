import React from "react";
import { Search, Filter, Download } from "lucide-react";
import { FilterOptions } from "./utils/api";
import { exportToCSV, exportToJSON } from "./utils/exportHelpers";
import { AuditLog } from "./utils/api";

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FilterOptions;
  onFilterClick: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  activeFilterCount: number;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterClick,
  onExportCSV,
  onExportJSON,
  activeFilterCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Header with action buttons */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Track all system activities and user actions
          </p>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <button
            className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative text-sm"
            onClick={onFilterClick}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#2ecc71] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors text-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={onExportCSV}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
              >
                Export as CSV
              </button>
              <button
                onClick={onExportJSON}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors border-t border-gray-100"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search audit logs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent outline-none bg-white text-sm md:text-base"
        />
      </div>
    </div>
  );
};

export default SearchAndFilters;
