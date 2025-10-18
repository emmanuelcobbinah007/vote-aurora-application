import React from "react";
import { Calendar, Search } from "lucide-react";

export const EmptyElectionsState: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="flex flex-col items-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Elections Found
        </h3>

        <p className="text-gray-600 mb-6 max-w-sm">
          There are no elections matching your search criteria. Try adjusting
          your filters or search terms.
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Search className="h-4 w-4" />
          <span>Clear your search to see all elections</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyElectionsState;
