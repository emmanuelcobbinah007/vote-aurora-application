"use client";

import React, { useState } from "react";
import { ElectionWithDetails } from "./details/ElectionDetailsTypes";
import ElectionsPage from "./ElectionsPage";
import ElectionDetailsPage from "./details/ElectionDetailsPage";

// Mock election data for demonstration
const mockElectionWithDetails: ElectionWithDetails = {
  id: "election-1",
  title: "Student Council Election 2024",
  description:
    "Annual student council election for the academic year 2024-2025",
  status: "DRAFT",
  start_time: "2024-03-15T09:00:00.000Z",
  end_time: "2024-03-17T17:00:00.000Z",
  created_at: "2024-02-01T10:00:00.000Z",
  updated_at: "2024-02-15T14:30:00.000Z",
  created_by: "user-1",
  approved_by: undefined,
  portfolios: [],
  candidates: [],
  ballots: [],
};

/**
 * Integration Demo Component
 *
 * This component demonstrates how to integrate the Election Details system
 * with the existing Elections Page. In a real implementation:
 *
 * 1. The ElectionsPage would have a "View Details" or "Manage" button
 * 2. Clicking that button would navigate to /superadmin/elections/[electionId]
 * 3. The election details page would fetch data from the API
 * 4. All CRUD operations would make actual API calls
 *
 * For this demo, we're showing both components and the navigation between them.
 */
const ElectionSystemDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<"list" | "details">("list");
  const [selectedElection, setSelectedElection] =
    useState<ElectionWithDetails | null>(null);

  const handleViewElectionDetails = (election: any) => {
    // In a real app, this would be navigation to /superadmin/elections/[id]
    setSelectedElection({
      ...mockElectionWithDetails,
      ...election,
    });
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedElection(null);
  };

  const handleEditElection = (election: ElectionWithDetails) => {
    // This would open the existing CreateElectionModal in edit mode
    console.log("Edit election:", election);
  };

  if (currentView === "details" && selectedElection) {
    return (
      <ElectionDetailsPage
        election={selectedElection}
        onBack={handleBackToList}
        onEditElection={handleEditElection}
      />
    );
  }

  return (
    <div>
      {/* Demo Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">ℹ</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Election Management System Demo
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                This demonstrates the complete election management flow:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Elections List:</strong> View all elections with
                  filtering and search
                </li>
                <li>
                  <strong>Create Election:</strong> Simple metadata-only modal
                  (existing functionality)
                </li>
                <li>
                  <strong>Election Details:</strong> Comprehensive management
                  with tabs for portfolios, candidates, ballot setup, and
                  results
                </li>
                <li>
                  <strong>Modular Design:</strong> Each component is independent
                  and can be used separately
                </li>
              </ul>
              <p className="mt-2 font-medium">
                Click on "View Details" for any election to see the full
                management interface.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ElectionsPage onViewDetails={handleViewElectionDetails} />
    </div>
  );
};

export default ElectionSystemDemo;
