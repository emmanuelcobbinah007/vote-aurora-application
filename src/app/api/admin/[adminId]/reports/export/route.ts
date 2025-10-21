import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { isAdminAuthorized } from "@/libs/auth-utils";

// Helper function to fetch admin's assigned election with vote data
async function fetchAdminElection(adminId: string) {
  const assignment = await prisma.adminAssignments.findFirst({
    where: { admin_id: adminId },
    include: {
      election: {
        include: {
          portfolios: {
            include: {
              candidates: {
                include: {
                  _count: {
                    select: { votes: true },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              ballots: true,
              portfolios: true,
              candidates: true,
            },
          },
        },
      },
    },
  });

  return assignment;
}

// Helper function to generate CSV report content
function generateCSVReport(election: any): string {
  let csvContent = "Portfolio,Candidate,Votes,Percentage\n";

  const totalVotes = election._count.ballots;

  election.portfolios.forEach((portfolio: any) => {
    portfolio.candidates.forEach((candidate: any) => {
      const votes = candidate._count.votes;
      const percentage =
        totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : "0.00";
      csvContent += `"${portfolio.title}","${candidate.full_name}",${votes},${percentage}%\n`;
    });
  });

  return csvContent;
}

// Helper function to generate JSON report data
function generateJSONReport(election: any): object {
  return {
    election: {
      id: election.id,
      title: election.title,
      status: election.status,
      total_votes: election._count.ballots,
    },
    portfolios: election.portfolios.map((portfolio: any) => ({
      title: portfolio.title,
      candidates: portfolio.candidates.map((candidate: any) => ({
        name: candidate.full_name,
        votes: candidate._count.votes,
        percentage:
          election._count.ballots > 0
            ? (
                (candidate._count.votes / election._count.ballots) *
                100
              ).toFixed(2)
            : "0.00",
      })),
    })),
    generated_at: new Date().toISOString(),
  };
}

// Helper function to create CSV response
function createCSVResponse(csvContent: string, electionId: string): Response {
  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="election-report-${electionId}.csv"`,
    },
  });
}

// Helper function to create JSON response
function createJSONResponse(reportData: object, electionId: string): Response {
  return new Response(JSON.stringify(reportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="election-report-${electionId}.json"`,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ adminId: string }> }
) {
  try {
    const { adminId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    // Fetch admin's assigned election
    const assignment = await fetchAdminElection(adminId);

    if (!assignment) {
      return NextResponse.json(
        { error: "No election assigned to this admin" },
        { status: 404 }
      );
    }

    const { election } = assignment;

    // Generate and return CSV format
    if (format === "csv") {
      const csvContent = generateCSVReport(election);
      return createCSVResponse(csvContent, election.id);
    }

    // Generate and return JSON format
    const reportData = generateJSONReport(election);
    return createJSONResponse(reportData, election.id);
  } catch (error: any) {
    console.error("Error exporting reports:", error);
    return NextResponse.json(
      { error: "Failed to export reports" },
      { status: 500 }
    );
  }
}
