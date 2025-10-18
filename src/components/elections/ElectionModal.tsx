"use client";
import React from "react";
import { X } from "lucide-react";

interface ElectionModalProps {
  isOpen: boolean;
  selectedElection: any;
  onClose: () => void;
}

const ElectionModal: React.FC<ElectionModalProps> = ({
  isOpen,
  selectedElection,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">
            {selectedElection ? "Edit Election" : "Create New Election"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          Election creation/editing form will be implemented here
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            {selectedElection ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElectionModal;
