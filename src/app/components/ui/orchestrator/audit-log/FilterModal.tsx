import React from "react";
import { X, Calendar, Users, Tag, Shield } from "lucide-react";
import { FilterOptions } from "./utils/api";

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
                  value={filters.dateFrom || ""}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* User */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Users className="w-4 h-4 mr-2" />
              User
            </label>
            <input
              type="text"
              placeholder="Enter user email or ID"
              value={filters.userId || ""}
              onChange={(e) => updateFilter("userId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Action Type */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Tag className="w-4 h-4 mr-2" />
              Action Type
            </label>
            <select
              value={filters.action || ""}
              onChange={(e) => updateFilter("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Actions</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Type */}
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Shield className="w-4 h-4 mr-2" />
              Entity Type
            </label>
            <select
              value={filters.entityType || ""}
              onChange={(e) => updateFilter("entityType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Entities</option>
              {entityTypes.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          {/* Entity ID */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Entity ID
            </label>
            <input
              type="text"
              placeholder="Enter entity ID"
              value={filters.entityId || ""}
              onChange={(e) => updateFilter("entityId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
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
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
