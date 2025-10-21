import { prisma } from "@/libs/prisma";

// Helper function to fetch admin assignment with all related election data
export async function fetchAdminAssignmentWithElection(adminId: string) {
  return await prisma.adminAssignments.findFirst({
    where: {
      admin_id: adminId,
    },
    include: {
      election: {
        include: {
          portfolios: {
            orderBy: {
              created_at: "asc",
            },
          },
          candidates: {
            orderBy: {
              created_at: "asc",
            },
          },
          creator: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
