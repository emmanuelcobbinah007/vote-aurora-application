import React from "react";
import { X, Calendar, Users, Tag, Shield } from "lucide-react";
import { FilterOptions } from "./auditTypes";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters,
}) => {
  if (!isOpen) return null;

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    updateFilter(key, newArray);
  };

  const actionTypes = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "VIEW",
    "EXPORT",
    "IMPORT",
    "APPROVE",
    "REJECT",
    "ACTIVATE",
    "DEACTIVATE",
    "RESET",
  ];

  const entityTypes = [
    "USER",
    "ELECTION",
    "CANDIDATE",
    "VOTE",
    "BALLOT",
    "DEPARTMENT",
    "PORTFOLIO",
    "ADMIN",
    "SYSTEM",
    "REPORT",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Filter Audit Logs
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Date Range */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) =>
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      from: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) =>
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      to: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Types */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Tag className="w-4 h-4 mr-2" />
              Action Types
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {actionTypes.map((action) => (
                <label
                  key={action}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={filters.actions.includes(action)}
                    onChange={() => toggleArrayFilter("actions", action)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>{action}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Entity Types */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Shield className="w-4 h-4 mr-2" />
              Entity Types
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {entityTypes.map((entity) => (
                <label
                  key={entity}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={filters.entityTypes.includes(entity)}
                    onChange={() => toggleArrayFilter("entityTypes", entity)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>{entity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Users */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Users
            </label>
            <div className="space-y-2">
              {filters.users.map((user, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => {
                      const newUsers = [...filters.users];
                      newUsers[index] = e.target.value;
                      updateFilter("users", newUsers);
                    }}
                    placeholder="Enter user email or name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => {
                      const newUsers = filters.users.filter(
                        (_, i) => i !== index
                      );
                      updateFilter("users", newUsers);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateFilter("users", [...filters.users, ""])}
                className="w-full px-3 py-2 text-sm text-amber-600 border border-amber-300 rounded-md hover:bg-amber-50 transition-colors"
              >
                + Add User
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear All
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyFilters();
                onClose();
              }}
              className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
