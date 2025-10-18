"use client";
import React from "react";
import { Filter, Search } from "lucide-react";

export default function ApprovalsFilters({
  searchQuery,
  onSearch,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  departments,
}: {
  searchQuery: string;
  onSearch: (v: string) => void;
  department: string;
  onDepartmentChange: (v: string) => void;
  status?: string;
  onStatusChange?: (v: string) => void;
  departments: string[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search elections..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-[#2ecc71]"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-[#2ecc71]"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {status !== undefined && onStatusChange && (
            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-[#2ecc71]"
              >
                <option value="all">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="LIVE">Live</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
