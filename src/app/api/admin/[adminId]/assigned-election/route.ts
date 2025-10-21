import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { fetchAdminAssignmentWithElection } from "@/libs/adminUtils";

// Helper function to transform portfolios data
function transformPortfolios(portfolios: any[]) {
  return portfolios.map((portfolio) => ({
    id: portfolio.id,
    title: portfolio.title,
    description: portfolio.description,
    election_id: portfolio.election_id,
    created_at: portfolio.created_at.toISOString(),
  }));
}

// Helper function to transform candidates data
function transformCandidates(candidates: any[]) {
  return candidates.map((candidate) => ({
    id: candidate.id,
    election_id: candidate.election_id,
    portfolio_id: candidate.portfolio_id,
    full_name: candidate.full_name,
    photo_url: candidate.photo_url,
    manifesto: candidate.manifesto,
    created_at: candidate.created_at.toISOString(),
  }));
}

// Helper function to build election details response
function buildElectionDetailsResponse(adminAssignment: any) {
  return {
    id: adminAssignment.election.id,
    title: adminAssignment.election.title,
    description: adminAssignment.election.description,
    status: adminAssignment.election.status,
    is_general: adminAssignment.election.is_general,
    department: adminAssignment.election.department,
    start_time: adminAssignment.election.start_time.toISOString(),
    end_time: adminAssignment.election.end_time.toISOString(),
    created_at: adminAssignment.election.created_at.toISOString(),
    updated_at: adminAssignment.election.updated_at.toISOString(),
    created_by: adminAssignment.election.created_by,
    approved_by: adminAssignment.election.approved_by,
    portfolios: transformPortfolios(adminAssignment.election.portfolios),
    candidates: transformCandidates(adminAssignment.election.candidates),
    assignment: {
      assigned_at: adminAssignment.created_at.toISOString(),
      assigned_by: adminAssignment.assigned_by,
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;

    // Fetch admin assignment with election data
    const adminAssignment = await fetchAdminAssignmentWithElection(adminId);

    if (!adminAssignment) {
      return NextResponse.json(
        { error: "No election assigned to this admin" },
        { status: 404 }
      );
    }

    // Transform and build response
    const electionWithDetails = buildElectionDetailsResponse(adminAssignment);

    return NextResponse.json(electionWithDetails);
  } catch (error) {
    console.error("Error fetching admin assigned election:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned election" },
      { status: 500 }
    );
  }
}
