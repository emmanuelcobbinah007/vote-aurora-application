"use client";
import React from "react";
import { Check, X } from "lucide-react";

interface ApprovalsFiltersProps {
  filters: {
    status: string[];
    priority: string[];
    department: string[];
  };
  onFilterChange: (
    filterType: "status" | "priority" | "department",
    value: string
  ) => void;
  onClearAll: () => void;
}

const ApprovalsFilters: React.FC<ApprovalsFiltersProps> = ({
  filters,
  onFilterChange,
  onClearAll,
}) => {
  const statusOptions = [
    {
      value: "pending",
      label: "Pending Review",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "approved",
      label: "Approved",
      color: "bg-green-100 text-green-800",
    },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
    {
      value: "review_requested",
      label: "Review Requested",
      color: "bg-blue-100 text-blue-800",
    },
  ];

  const priorityOptions = [
    { value: "high", label: "High Priority", color: "bg-red-100 text-red-800" },
    {
      value: "medium",
      label: "Medium Priority",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "low",
      label: "Low Priority",
      color: "bg-green-100 text-green-800",
    },
  ];

  const departmentOptions = [
    { value: "Student Affairs", label: "Student Affairs" },
    { value: "Computer Science", label: "Computer Science" },
    { value: "Business Administration", label: "Business Administration" },
    { value: "Engineering", label: "Engineering" },
    { value: "Arts & Humanities", label: "Arts & Humanities" },
  ];

  const totalActiveFilters =
    filters.status.length + filters.priority.length + filters.department.length;

  const FilterSection = ({
    title,
    options,
    selectedValues,
    filterType,
    showColors = false,
  }: {
    title: string;
    options: { value: string; label: string; color?: string }[];
    selectedValues: string[];
    filterType: "status" | "priority" | "department";
    showColors?: boolean;
  }) => (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onFilterChange(filterType, option.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 border-2 rounded ${
                    isSelected
                      ? "bg-[#cc910d] border-[#cc910d]"
                      : "border-gray-300"
                  } flex items-center justify-center transition-colors`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <span
                className={`text-sm ${
                  showColors && option.color
                    ? `px-2 py-1 rounded-full ${option.color}`
                    : "text-gray-700"
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Filter Options</h3>
        {totalActiveFilters > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear all ({totalActiveFilters})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FilterSection
          title="Status"
          options={statusOptions}
          selectedValues={filters.status}
          filterType="status"
          showColors
        />

        <FilterSection
          title="Priority"
          options={priorityOptions}
          selectedValues={filters.priority}
          filterType="priority"
          showColors
        />

        <FilterSection
          title="Department"
          options={departmentOptions}
          selectedValues={filters.department}
          filterType="department"
        />
      </div>

      {/* Date Range Filter */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Submission Date Range
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc910d]/20 focus:border-[#cc910d] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc910d]/20 focus:border-[#cc910d] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 font-medium">
            Quick presets:
          </span>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            This Week
          </button>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            This Month
          </button>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            Pending Only
          </button>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            High Priority
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsFilters;
