import React from "react";
import Header from "@/app/components/ui/orchestrator/Header";
import Sidebar from "@/app/components/ui/orchestrator/Sidebar";
import { SidebarProvider } from "@/app/contexts/SidebarContext";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/auth";
import { redirect } from "next/navigation";

type Props = Readonly<{
  children: React.ReactNode;
  params: { orchestratorId: string };
}>;

const OrchestratorLayout = async ({ children, params }: Props) => {
  const session = (await getServerSession(authOptions as any)) as any;

  if (!session || !session.user) {
    redirect("/login");
  }

  const userRole = session.user?.role as string | undefined;
  const userId = session.user?.id as string | undefined;

  const isOrchestratorAccess =
    userRole === "ORCHESTRATOR" && userId === params.orchestratorId;
  const isSuperAdmin = userRole === "SUPERADMIN";

  if (!isOrchestratorAccess && !isSuperAdmin) {
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
