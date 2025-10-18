import React from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ElectionsFiltersProps {
  onSearch: (searchTerm: string) => void;
  onStatusFilter: (status: string) => void;
  onCreateClick: () => void;
}

const ElectionsFilters: React.FC<ElectionsFiltersProps> = ({
  onSearch,
  onStatusFilter,
  onCreateClick,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onSearch(term);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    onStatusFilter(status);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search elections by title, description, or creator..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent appearance-none bg-white min-w-48"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="LIVE">Live</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <Button
            onClick={onCreateClick}
            className="flex items-center gap-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white"
          >
            <Plus className="h-4 w-4" />
            Create Election
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ElectionsFilters;
