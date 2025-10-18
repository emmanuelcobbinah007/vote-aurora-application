"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const ReportsControls = ({ onExport }: { onExport?: () => void }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <label className="text-sm text-gray-700">Portfolio</label>
        <select className="border border-gray-200 rounded px-2 py-1 text-sm">
          <option value="all">All portfolios</option>
          <option value="portfolio-1">President</option>
          <option value="portfolio-2">Treasurer</option>
        </select>
      </div>
      <div>
        <Button
          className="bg-amber-600 text-white hover:bg-amber-700"
          onClick={onExport}
        >
          Export CSV
        </Button>
      </div>
    </div>
  );
};

export default ReportsControls;
