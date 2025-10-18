"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import axios from "axios";
import AddOrchestratorModal from "../../../components/ui/orchestrator/modals/AddOrchestratorModal";
import {
  Plus,
  Search,
  MoreVertical,
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface Orchestrator {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

// API function to fetch orchestrators from the database
const fetchOrchestrators = async (
  orchestratorId: string
): Promise<Orchestrator[]> => {
  try {
    const response = await axios.get("/api/orchestrator", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch orchestrators");
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching orchestrators:", error);
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

const ManageOrchestratorsPage = () => {
  const params = useParams();
  const orchestratorId = params.orchestratorId as string;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: orchestrators,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orchestrators", orchestratorId],
    queryFn: () => fetchOrchestrators(orchestratorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter orchestrators based on search term
  const filteredOrchestrators =
    orchestrators?.filter(
      (orchestrator) =>
        orchestrator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orchestrator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orchestrator.role.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleAddOrchestratorClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleInvitationSuccess = () => {
    // Refetch the orchestrators list when a new invitation is sent
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading orchestrators. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search orchestrators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent outline-none bg-white text-sm md:text-base"
          />
        </div>

        <button
          onClick={handleAddOrchestratorClick}
          className="flex items-center w-[15%] ml-4 justify-center space-x-2 px-4 py-3 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors text-sm md:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Add Orchestrator</span>
        </button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredOrchestrators.length} of {orchestrators?.length || 0}{" "}
          orchestrators
        </p>
      </div>

      {/* Orchestrators List */}
      <div className="space-y-3 md:space-y-4">
        {filteredOrchestrators.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orchestrators found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Try adjusting your search terms to find what you're looking for."
                : "Get started by adding your first orchestrator."}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddOrchestratorClick}
                className="px-4 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors"
              >
                Add First Orchestrator
              </button>
            )}
          </div>
        ) : (
          filteredOrchestrators.map((orchestrator, index) => {
            const statusColor = getStatusColor(orchestrator.status);

            return (
              <div
                key={orchestrator.id}
                className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#2ecc71] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm md:text-base">
                        {orchestrator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3 mb-2">
                        <h3 className="text-base md:text-lg font-medium text-gray-900 truncate">
                          {orchestrator.name}
                        </h3>
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} self-start`}
                        >
                          {getStatusIcon(orchestrator.status)}
                          <span className="capitalize">
                            {orchestrator.status}
                          </span>
                        </span>
                      </div>

                      <div className="space-y-1 text-xs md:text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{orchestrator.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{orchestrator.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end md:justify-start space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>

      {/* Add Orchestrator Modal */}
      <AddOrchestratorModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleInvitationSuccess}
      />
    </div>
  );
};

export default ManageOrchestratorsPage;
