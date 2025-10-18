"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Portfolio } from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";

interface SortableItemProps {
  id: string;
  portfolio: Portfolio;
  index: number;
  isEditing: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  portfolio,
  index,
  isEditing,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-4 border rounded-lg transition-all ${
        isEditing
          ? "cursor-move hover:bg-gray-50 border-gray-300 hover:shadow-sm"
          : "bg-gray-50 border-gray-200"
      } ${isDragging ? "shadow-lg ring-2 ring-amber-200 bg-white" : ""}`}
      {...attributes}
      {...(isEditing ? listeners : {})}
    >
      {isEditing && (
        <GripVertical className="w-5 h-5 text-gray-400 mr-3 hover:text-gray-600 transition-colors" />
      )}
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2.5 py-0.5 rounded">
            #{index + 1}
          </span>
          <h3 className="font-medium text-gray-900">{portfolio.title}</h3>
        </div>
        {portfolio.description && (
          <p className="text-gray-600 text-sm mt-1">{portfolio.description}</p>
        )}
      </div>
      <div className="text-sm text-gray-500">
        {portfolio._count?.candidates || 0} candidates
      </div>
    </div>
  );
};
