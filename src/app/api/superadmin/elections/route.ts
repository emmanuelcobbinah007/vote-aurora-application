import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import * as Yup from "yup";
import {
  validateSuperAdmin,
  createAuthErrorResponse,
} from "../../../../libs/auth-utils";

// Validation schema mirrors the client-side Yup schema
const createElectionSchema = Yup.object({
  title: Yup.string().trim().required(),
  description: Yup.string().nullable(),
  start_time: Yup.string().required(),
  end_time: Yup.string().required(),
  is_general: Yup.boolean().required(),
  department: Yup.string().nullable(),
  status: Yup.string()
    .oneOf([
      "DRAFT",
      "PENDING_APPROVAL",
      "APPROVED",
      "LIVE",
      "CLOSED",
      "ARCHIVED",
    ])
    .optional(),
});

function formatValidationError(err: any) {
  const details: Record<string, string> = {};
  if (err.inner && Array.isArray(err.inner)) {
    err.inner.forEach((e: any) => {
      if (e.path && e.message) details[e.path] = e.message;
    });
  }
  return details;
}

export async function POST(req: NextRequest) {
  // Authorize
  const auth = await validateSuperAdmin(req);
  if (!auth.success) return createAuthErrorResponse(auth);

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Coerce is_general if it's a string
  if (typeof body.is_general === "string") {
    body.is_general = body.is_general === "true";
  }

  // Validate
  try {
    await createElectionSchema.validate(body, { abortEarly: false });
  } catch (err: any) {
    const details = formatValidationError(err);
    return NextResponse.json(
      { error: "Validation failed", details },
      { status: 400 }
    );
  }

  // Business rules: department required when is_general is false
  if (
    body.is_general === false &&
    (!body.department || body.department.trim() === "")
  ) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: {
          department:
            "Department is required for department-specific elections",
        },
      },
      { status: 400 }
    );
  }

  // Date validation
  const start = new Date(body.start_time);
  const end = new Date(body.end_time);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: { start_time: "Invalid date", end_time: "Invalid date" },
      },
      { status: 400 }
    );
  }
  if (end <= start) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: { end_time: "End time must be after start time" },
      },
      { status: 400 }
    );
  }

  // All good - create the election
  try {
    const election = await prisma.elections.create({
      data: {
        title: body.title.trim(),
        description: body.description ? body.description.trim() : null,
        status: body.status || "DRAFT",
        is_general: Boolean(body.is_general),
        department: body.is_general ? null : body.department,
        start_time: start,
        end_time: end,
        created_by: auth.user!.id,
      },
    });

    // Format dates to ISO strings for response
    const resp = {
      id: election.id,
      title: election.title,
      description: election.description,
      status: election.status,
      is_general: election.is_general,
      department: election.department,
      start_time: election.start_time.toISOString(),
      end_time: election.end_time.toISOString(),
      created_by: election.created_by,
      created_at: election.created_at.toISOString(),
      updated_at: election.updated_at.toISOString(),
    };

    return NextResponse.json(resp, { status: 201 });
  } catch (err) {
    console.error("/api/superadmin/elections POST error", err);
    return NextResponse.json(
      { error: "Failed to create election" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Authorize
  const auth = await validateSuperAdmin(req);
  if (!auth.success) return createAuthErrorResponse(auth);

  try {
    // Extract pagination parameters from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    const skip = (validPage - 1) * validLimit;

    // Get total count for pagination metadata
    const totalCount = await prisma.elections.count();

    // Fetch elections with pagination and include related data to match the client shape
    const elections = await prisma.elections.findMany({
      skip,
      take: validLimit,
      orderBy: { created_at: "desc" },
      include: {
        creator: {
          select: { id: true, full_name: true, email: true },
        },
        approver: {
          select: { id: true, full_name: true, email: true },
        },
        portfolios: {
          include: {
            candidates: {
              select: { id: true, full_name: true },
            },
          },
        },
        adminAssignments: {
          include: {
            admin: {
              select: {
                id: true,
                full_name: true,
                email: true,
                created_at: true,
                updated_at: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
            candidates: true,
            portfolios: true,
          },
        },
      },
    });

    console.log(
      "Debug - Sample election with relations:",
      elections[0]
        ? {
            id: elections[0].id,
            title: elections[0].title,
            creator: elections[0].creator,
            _count: elections[0]._count,
            created_by: elections[0].created_by,
            portfolios_length: elections[0].portfolios?.length,
          }
        : "No elections found"
    );

    // Additional debugging: Check actual data in database
    if (elections[0]) {
      const electionId = elections[0].id;

      // Check actual counts manually
      const actualVoteCount = await prisma.votes.count({
        where: { election_id: electionId },
      });
      const actualCandidateCount = await prisma.candidates.count({
        where: { election_id: electionId },
      });
      const actualPortfolioCount = await prisma.portfolios.count({
        where: { election_id: electionId },
      });

      console.log("Debug - Manual counts for election", electionId, {
        votes: actualVoteCount,
        candidates: actualCandidateCount,
        portfolios: actualPortfolioCount,
      });

      // Also check if there are ANY votes/candidates/portfolios in the entire database
      const totalVotes = await prisma.votes.count();
      const totalCandidates = await prisma.candidates.count();
      const totalPortfolios = await prisma.portfolios.count();

      console.log("Debug - Total counts in database:", {
        totalVotes,
        totalCandidates,
        totalPortfolios,
      });
    }

    // Normalize date fields to ISO strings for the frontend
    const resp = elections.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      status: e.status,
      is_general: e.is_general,
      department: e.department,
      start_time: e.start_time?.toISOString(),
      end_time: e.end_time?.toISOString(),
      created_at: e.created_at.toISOString(),
      updated_at: e.updated_at.toISOString(),
      created_by: e.created_by,
      approved_by: e.approved_by,
      creator: e.creator
        ? { full_name: e.creator.full_name, email: e.creator.email }
        : null,
      approver: e.approver
        ? { full_name: e.approver.full_name, email: e.approver.email }
        : null,
      portfolios: e.portfolios.map((p) => ({
        id: p.id,
        title: p.title,
        candidates: p.candidates.map((c) => ({
          id: c.id,
          full_name: c.full_name,
        })),
      })),
      // include assignments for frontend display
      assignments: (e as any).adminAssignments
        ? (e as any).adminAssignments.map((a: any) => ({
            id: a.id,
            admin_id: a.admin_id,
            election_id: a.election_id,
            assigned_by: a.assigned_by,
            created_at: a.created_at.toISOString(),
            admin: a.admin
              ? {
                  id: a.admin.id,
                  full_name: a.admin.full_name,
                  email: a.admin.email,
                  role: "ADMIN",
                  status: "ACTIVE",
                  created_at:
                    a.admin.created_at?.toISOString() ||
                    new Date().toISOString(),
                  updated_at:
                    a.admin.updated_at?.toISOString() ||
                    new Date().toISOString(),
                }
              : null,
          }))
        : [],
      adminCount: (e as any).adminAssignments
        ? (e as any).adminAssignments.length
        : 0,
      _count: {
        votes: e._count?.votes || 0,
        candidates: e._count?.candidates || 0,
        portfolios: e._count?.portfolios || e.portfolios.length,
      },
    }));

    // Debug: Check what we're sending to frontend
    console.log("Debug - Response _count for first election:", resp[0]?._count);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    // Return elections with pagination metadata
    const response = {
      elections: resp,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit: validLimit,
        hasNextPage,
        hasPrevPage,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("/api/superadmin/elections GET error", err);
    return NextResponse.json(
      { error: "Failed to fetch elections" },
      { status: 500 }
    );
  }
}
