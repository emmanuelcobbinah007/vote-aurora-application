import React from "react";
import Header from "@/app/components/ui/approver/Header";
import Sidebar from "@/app/components/ui/approver/Sidebar";
import { SidebarProvider } from "@/app/contexts/SidebarContext";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/auth";
import { redirect } from "next/navigation";

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ approverId: string }>;
}>;

// Server-side protected layout: ensures only the approver (or a SUPERADMIN) can access subroutes
const OrchestratorLayout = async ({ children, params }: Props) => {
  const session = (await getServerSession(authOptions as any)) as any;
  const { approverId } = await params;

  // Not authenticated -> redirect to login
  if (!session || !session.user) {
    redirect("/login");
  }

  const userRole = session.user?.role as string | undefined;
  const userId = session.user?.id as string | undefined;

  // Allow access if user is SUPERADMIN, or if they are an APPROVER and the id matches the route param
  const isApproverAccess = userRole === "APPROVER" && userId === approverId;
  const isSuperAdmin = userRole === "SUPERADMIN";

  if (!isApproverAccess && !isSuperAdmin) {
    // unauthorized
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OrchestratorLayout;
