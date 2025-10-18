import React from "react";

type Props = {
  value?: number; // 0-100
};

const ProgressBar: React.FC<Props> = ({ value = 0 }) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div
        className="h-3 rounded-full bg-amber-500"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
    </div>
  );
};

export default ProgressBar;
