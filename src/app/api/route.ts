import { NextResponse } from "next/server";

// Root API route - returns API information
export async function GET() {
  return NextResponse.json({
    message: "University E-Voting System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      superadmin: "/api/superadmin",
      approvers: "/api/approvers",
      voter: "/api/voter",
      elections: "/api/elections",
      audit: "/api/audit-trail",
      dashboard: "/api/dashboard",
    },
  });
}
