import React from "react";

const ReportsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto p-6">
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default ReportsLayout;
