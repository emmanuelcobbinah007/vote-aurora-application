"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import HandleOrchestratorModal from "../../../components/ui/orchestrator/modals/HandleOrchestratorModal";
import {
  Plus,
  RefreshCw,
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
} from "lucide-react";

interface Approver {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

// Function to fetch approver data from API
const fetchApprover = async (
  orchestratorId: string
): Promise<Approver | null> => {
  try {
    // Call the real API endpoint
    const response = await fetch(`/api/approvers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return null;
    }

    // Return the first approver (there should only be one in the system)
    const approver = data.data[0];

    return {
      id: approver.id,
      full_name: approver.name || approver.full_name,
      email: approver.email,
      role: approver.role,
      status: approver.status,
      createdAt: approver.createdAt,
      updatedAt: approver.updatedAt || approver.updated_at,
    };
  } catch (error) {
    console.error("Error fetching approver:", error);
    throw error;
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "text-green-600 bg-green-50";
    case "INACTIVE":
      return "text-red-600 bg-red-50";
    case "SUSPENDED":
      return "text-yellow-600 bg-yellow-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return <CheckCircle className="w-4 h-4" />;
    case "INACTIVE":
      return <XCircle className="w-4 h-4" />;
    case "SUSPENDED":
      return <Clock className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: string | null) => {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ApproverManagementPage = () => {
  const params = useParams();
  const orchestratorId = params.orchestratorId as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: approver,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["approver", orchestratorId],
    queryFn: () => fetchApprover(orchestratorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleModalClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 animate-pulse">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading approver information. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:px-6 md:py-4 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <p className="text-gray-600 text-sm md:text-base">
            {approver
              ? "Manage the current election approver account"
              : "Set up an election approver to oversee and approve elections"}
          </p>
        </div>

        <button
          onClick={handleModalClick}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          {approver ? (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Replace Approver</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Create Approver</span>
            </>
          )}
        </button>
      </div>

      {/* Current Approver or Empty State */}
      {approver ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-8 opacity-0 animate-fade-in-up">
          <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
            <div className="flex items-start space-x-4 md:space-x-6">
              {/* Avatar with Crown */}
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {approver.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {approver.full_name}
                  </h2>
                  <span
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      approver.status
                    )}`}
                  >
                    {getStatusIcon(approver.status)}
                    <span className="capitalize">{approver.status}</span>
                  </span>
                </div>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{approver.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>{approver.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center opacity-0 animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            No Approver Assigned
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            An election approver is required to oversee and approve elections.
            Set up an approver account to get started with election management.
          </p>
          <button
            onClick={handleModalClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create Approver</span>
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          About Election Approvers
        </h3>
        <p className="text-sm text-blue-700">
          The election approver is responsible for validating and authorizing
          elections before they go live. They review submitted elections, verify
          candidate details, and ensure all configurations meet institutional
          standards. Once approved, the election becomes active and visible to
          voters.
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>

      {/* Handle Orchestrator Modal */}
      <HandleOrchestratorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={approver ? "replace" : "create"}
        currentApprover={approver}
      />
    </div>
  );
};

export default ApproverManagementPage;
