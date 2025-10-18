"use client";

import React from "react";

// Base shimmer animation component
const ShimmerBase: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = "", style }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] ${className}`}
    style={style}
  />
);

// Shimmer for text lines
export const TextShimmer: React.FC<{
  lines?: number;
  className?: string;
  widths?: string[];
}> = ({
  lines = 1,
  className = "",
  widths = ["w-full", "w-3/4", "w-5/6", "w-2/3", "w-4/5"],
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <ShimmerBase
        key={i}
        className={`h-4 rounded ${widths[i % widths.length] || "w-full"}`}
      />
    ))}
  </div>
);

// Shimmer for buttons
export const ButtonShimmer: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
}> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <ShimmerBase className={`${sizeClasses[size]} rounded-lg ${className}`} />
  );
};

// Shimmer for avatar/circular images
export const AvatarShimmer: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = "",
}) => (
  <ShimmerBase
    className={`rounded-full ${className}`}
    style={{ width: size, height: size }}
  />
);

// Shimmer for cards
export const CardShimmer: React.FC<{
  className?: string;
  hasAvatar?: boolean;
  textLines?: number;
  hasButtons?: boolean;
}> = ({
  className = "",
  hasAvatar = false,
  textLines = 3,
  hasButtons = false,
}) => (
  <div className={`bg-white rounded-lg p-6 space-y-4 ${className}`}>
    {hasAvatar && (
      <div className="flex items-center space-x-3">
        <AvatarShimmer size={48} />
        <div className="flex-1">
          <TextShimmer lines={2} widths={["w-32", "w-24"]} />
        </div>
      </div>
    )}
    <TextShimmer lines={textLines} />
    {hasButtons && (
      <div className="flex space-x-2 pt-2">
        <ButtonShimmer size="sm" />
        <ButtonShimmer size="sm" />
      </div>
    )}
  </div>
);

// Shimmer for table rows
export const TableRowShimmer: React.FC<{
  columns?: number;
  className?: string;
}> = ({ columns = 4, className = "" }) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <TextShimmer lines={1} />
      </td>
    ))}
  </tr>
);

// Shimmer for stats cards
export const StatsCardShimmer: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`bg-white rounded-lg p-6 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <TextShimmer lines={1} widths={["w-24"]} className="mb-2" />
        <ShimmerBase className="h-8 w-16 rounded" />
      </div>
      <ShimmerBase className="h-12 w-12 rounded-full" />
    </div>
  </div>
);

// Shimmer for form inputs
export const InputShimmer: React.FC<{
  className?: string;
  label?: boolean;
}> = ({ className = "", label = true }) => (
  <div className={`space-y-2 ${className}`}>
    {label && <ShimmerBase className="h-4 w-24 rounded" />}
    <ShimmerBase className="h-10 w-full rounded-lg" />
  </div>
);

// Shimmer for tabs
export const TabsShimmer: React.FC<{ tabs?: number; className?: string }> = ({
  tabs = 4,
  className = "",
}) => (
  <div className={`flex space-x-1 ${className}`}>
    {Array.from({ length: tabs }).map((_, i) => (
      <ShimmerBase key={i} className="h-10 w-20 rounded-t-lg" />
    ))}
  </div>
);

// Page-specific shimmer components

// Elections page shimmer
export const ElectionsPageShimmer: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-6 space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <TextShimmer lines={1} widths={["w-64"]} />
      <TextShimmer lines={1} widths={["w-96"]} />
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardShimmer key={i} />
      ))}
    </div>

    {/* Filters */}
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <InputShimmer label={false} className="flex-1" />
        <div className="flex gap-3">
          <ShimmerBase className="h-10 w-48 rounded-lg" />
          <ButtonShimmer />
        </div>
      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <TextShimmer lines={1} widths={["w-32"]} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <TextShimmer lines={1} widths={["w-20"]} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowShimmer key={i} columns={6} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Election Details page shimmer
export const ElectionDetailsShimmer: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <ButtonShimmer size="sm" />
          <ButtonShimmer />
        </div>
        <TextShimmer lines={2} widths={["w-96", "w-full"]} />
        <div className="flex items-center space-x-4 mt-4">
          <ShimmerBase className="h-6 w-16 rounded-full" />
          <TextShimmer lines={1} widths={["w-32"]} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <TabsShimmer tabs={5} className="px-6" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardShimmer key={i} hasAvatar textLines={3} hasButtons />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Candidate Manager shimmer
export const CandidateManagerShimmer: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <TextShimmer lines={1} widths={["w-48"]} />
      <ButtonShimmer />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardShimmer key={i} hasAvatar textLines={4} hasButtons />
      ))}
    </div>
  </div>
);

// Portfolio Manager shimmer
export const PortfolioManagerShimmer: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <TextShimmer lines={1} widths={["w-48"]} />
      <ButtonShimmer />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardShimmer key={i} textLines={3} hasButtons />
      ))}
    </div>
  </div>
);

// Shimmer for form modals
export const ModalShimmer: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${className}`}
  >
    {/* Header */}
    <div className="flex justify-between items-center p-6">
      <TextShimmer lines={1} widths={["w-48"]} />
      <ShimmerBase className="h-6 w-6 rounded" />
    </div>

    {/* Form Content */}
    <div className="p-6 space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <InputShimmer key={i} />
      ))}

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <ButtonShimmer />
        <ButtonShimmer />
      </div>
    </div>
  </div>
);

// Ballot Setup Manager shimmer
export const BallotSetupManagerShimmer: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <TextShimmer lines={1} widths={["w-48"]} />
      <ButtonShimmer />
    </div>
    <div className="grid grid-cols-1 gap-6">
      <CardShimmer textLines={6} hasButtons />
      <CardShimmer textLines={8} hasButtons />
    </div>
  </div>
);

// Audit Results Manager shimmer
export const AuditResultsManagerShimmer: React.FC = () => (
  <div className="space-y-6">
    <TabsShimmer tabs={2} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardShimmer key={i} />
      ))}
    </div>
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardShimmer key={i} textLines={2} hasButtons={false} />
      ))}
    </div>
  </div>
);

// Simple content loading shimmer
export const ContentShimmer: React.FC<{
  lines?: number;
  hasHeader?: boolean;
  hasButtons?: boolean;
  className?: string;
}> = ({ lines = 4, hasHeader = true, hasButtons = false, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    {hasHeader && (
      <div className="space-y-2">
        <TextShimmer lines={1} widths={["w-48"]} />
        <TextShimmer lines={1} widths={["w-96"]} />
      </div>
    )}
    <TextShimmer lines={lines} />
    {hasButtons && (
      <div className="flex space-x-3 pt-4">
        <ButtonShimmer size="sm" />
        <ButtonShimmer size="sm" />
      </div>
    )}
  </div>
);

export default ShimmerBase;
