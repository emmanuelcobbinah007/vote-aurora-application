"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, User, Activity, Clock } from "lucide-react";

interface FilterOptions {
  actions: string[];
  entityTypes: string[];
  dateRange: {
    from: string;
    to: string;
  };
  users: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isClosing]);

  const actionTypes = [
    "USER_LOGIN",
    "USER_LOGOUT",
    "VOTE_CAST",
    "ELECTION_CREATED",
    "ELECTION_ENDED",
    "USER_APPROVED",
    "USER_REJECTED",
    "CANDIDATE_REGISTERED",
    "RESULTS_PUBLISHED",
    "ADMIN_ACTION",
  ];

  const entityTypes = [
    "USER",
    "VOTE",
    "ELECTION",
    "CANDIDATE",
    "ADMIN",
    "SYSTEM",
  ];

  const handleActionToggle = (action: string) => {
    setFilters((prev) => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter((a) => a !== action)
        : [...prev.actions, action],
    }));
  };

  const handleEntityToggle = (entityType: string) => {
    setFilters((prev) => ({
      ...prev,
      entityTypes: prev.entityTypes.includes(entityType)
        ? prev.entityTypes.filter((e) => e !== entityType)
        : [...prev.entityTypes, entityType],
    }));
  };

  const handleDateChange = (field: "from" | "to", value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    handleClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      actions: [],
      entityTypes: [],
      dateRange: { from: "", to: "" },
      users: [],
    };
    setFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-fade-out {
          animation: fadeOut 0.2s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }

        .animate-scale-out {
          animation: scaleOut 0.2s ease-out forwards;
        }
      `}</style>

      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isClosing ? "animate-scale-out" : "animate-scale-in"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Filter Audit Logs
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Action Types */}
            <div>
              <h3 className="flex items-center text-sm font-medium text-gray-900 mb-3">
                <Activity className="w-4 h-4 mr-2" />
                Action Types
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {actionTypes.map((action) => (
                  <label
                    key={action}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.actions.includes(action)}
                      onChange={() => handleActionToggle(action)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {action
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Entity Types */}
            <div>
              <h3 className="flex items-center text-sm font-medium text-gray-900 mb-3">
                <User className="w-4 h-4 mr-2" />
                Entity Types
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {entityTypes.map((entityType) => (
                  <label
                    key={entityType}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.entityTypes.includes(entityType)}
                      onChange={() => handleEntityToggle(entityType)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{entityType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="flex items-center text-sm font-medium text-gray-900 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) => handleDateChange("from", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) => handleDateChange("to", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset All
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterModal;
