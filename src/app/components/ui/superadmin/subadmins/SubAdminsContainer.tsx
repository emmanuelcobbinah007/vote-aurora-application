"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ElectionCard from "./ElectionCard";
import ElectionsSearch from "./ElectionsSearch";
import InviteAdminModal from "./InviteAdminModal";
import Pagination from "../../shared/Pagination";
import { Election, AdminAssignment } from "./subadminTypes";
import {
  SearchBarShimmer,
  ElectionCardShimmer as DashboardElectionCardShimmer,
} from "../../shared/shimmer/DashboardStyleShimmers";

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ElectionsResponse {
  elections: Election[];
  pagination: PaginationMeta;
}

const SubAdminsContainer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch elections data for subadmin assignment
  const { data: electionsData, isLoading } = useQuery<ElectionsResponse>({
    queryKey: ["elections", currentPage, searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/superadmin/elections?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch elections");
      }
      return response.json();
    },
  });

  const { elections = [], pagination } = electionsData || {};

  // Filter elections on the client side
  const filteredElections = elections.filter((election) => {
    const matchesSearch = election.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || election.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle invite admin modal
  const handleInviteAdmin = (election: Election) => {
    setSelectedElection(election);
    setIsInviteModalOpen(true);
  };

  const inviteMutation = useMutation({
    mutationFn: async ({
      electionId,
      email,
      role,
    }: {
      electionId: string;
      email: string;
      role: string;
    }) => {
      const response = await fetch(`/api/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ electionId, email, role }),
      });

      if (!response.ok) {
        throw new Error("Failed to invite admin");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      // Modal closing will be handled by the modal itself after success
    },
  });

  const handleInviteSubmit = async (email: string) => {
    if (selectedElection) {
      return await inviteMutation.mutateAsync({
        electionId: selectedElection.id,
        email,
        role: "ADMIN",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <SearchBarShimmer />
        <DashboardElectionCardShimmer count={6} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ElectionsSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {filteredElections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No elections found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredElections.map((election) => (
            <ElectionCard
              key={election.id}
              election={election}
              assignments={election.assignments || []}
              onInviteAdmin={() => handleInviteAdmin(election)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}

      {/* Invite Admin Modal */}
      <InviteAdminModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteSubmit}
        election={selectedElection}
      />
    </div>
  );
};

export default SubAdminsContainer;
