"use client";
import React, { useState } from "react";
import { X, Search, Calendar, Building, Check } from "lucide-react";
import { Admin, Election } from "./subadminTypes";
import {
  formatDateTime,
  getElectionStatusColor,
  formatStatus,
  filterElections,
} from "./subadminHelpers";

interface AssignElectionModalProps {
  subAdmin: Admin;
  availableElections: Election[];
  onClose: () => void;
  onSubmit: (subAdminId: string, electionIds: string[]) => void;
}

const AssignElectionModal: React.FC<AssignElectionModalProps> = ({
  subAdmin,
  availableElections,
  onClose,
  onSubmit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedElections, setSelectedElections] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<{
    [key: string]: string[];
  }>({});

  const filteredElections = filterElections(availableElections, searchTerm);

  const permissionOptions = [
    { id: "manage_candidates", label: "Manage Candidates" },
    { id: "monitor_voting", label: "Monitor Voting" },
    { id: "generate_reports", label: "Generate Reports" },
    { id: "send_notifications", label: "Send Notifications" },
  ];

  const handleElectionToggle = (electionId: string) => {
    setSelectedElections((prev) => {
      const newSelection = prev.includes(electionId)
        ? prev.filter((id) => id !== electionId)
        : [...prev, electionId];

      // Initialize permissions for newly selected elections
      if (!prev.includes(electionId)) {
        setSelectedPermissions((prevPerms) => ({
          ...prevPerms,
          [electionId]: ["manage_candidates", "monitor_voting"],
        }));
      } else {
        // Remove permissions for deselected elections
        setSelectedPermissions((prevPerms) => {
          const newPerms = { ...prevPerms };
          delete newPerms[electionId];
          return newPerms;
        });
      }

      return newSelection;
    });
  };

  const handlePermissionToggle = (electionId: string, permission: string) => {
    setSelectedPermissions((prev) => {
      const currentPerms = prev[electionId] || [];
      const newPerms = currentPerms.includes(permission)
        ? currentPerms.filter((p) => p !== permission)
        : [...currentPerms, permission];

      return {
        ...prev,
        [electionId]: newPerms,
      };
    });
  };

  const handleSubmit = () => {
    if (selectedElections.length > 0) {
      onSubmit(subAdmin.id, selectedElections);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Assign Elections
            </h2>
            <p className="text-sm text-gray-600">
              Assign elections to {subAdmin.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search elections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc910d]/20 focus:border-[#cc910d] transition-colors"
            />
          </div>
        </div>

        {/* Elections List */}
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {filteredElections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No elections match your search"
                : "No elections available"}
            </div>
          ) : (
            filteredElections.map((election) => {
              const isSelected = selectedElections.includes(election.id);
              const permissions = selectedPermissions[election.id] || [];

              return (
                <div
                  key={election.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected
                      ? "border-[#cc910d] bg-[#cc910d]/5"
                      : "border-gray-200"
                  }`}
                >
                  {/* Election Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleElectionToggle(election.id)}
                        className="mt-1 w-4 h-4 text-[#cc910d] border-gray-300 rounded focus:ring-[#cc910d]/20"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {election.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateTime(election.start_time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getElectionStatusColor(
                        election.status
                      )}`}
                    >
                      {formatStatus(election.status)}
                    </div>
                  </div>

                  {/* Permissions */}
                  {isSelected && (
                    <div className="ml-7 pl-4 border-l-2 border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Permissions
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {permissionOptions.map((option) => {
                          const hasPermission = permissions.includes(option.id);
                          return (
                            <label
                              key={option.id}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={hasPermission}
                                onChange={() =>
                                  handlePermissionToggle(election.id, option.id)
                                }
                                className="w-3 h-3 text-[#cc910d] border-gray-300 rounded focus:ring-[#cc910d]/20"
                              />
                              <span className="text-xs text-gray-700">
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedElections.length} election
            {selectedElections.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedElections.length === 0}
              className="px-4 py-2 bg-[#cc910d] text-white hover:bg-[#b8820c] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Elections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignElectionModal;
