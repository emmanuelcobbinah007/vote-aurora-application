import React from "react";
import { Search } from "lucide-react";

interface AuditLogSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AuditLogSearch: React.FC<AuditLogSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search audit logs..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
      />
    </div>
  );
};

export default AuditLogSearch;
