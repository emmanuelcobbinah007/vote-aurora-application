import React from "react";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
    </div>
  );
};

export default SettingsLayout;
