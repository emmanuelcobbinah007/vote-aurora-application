import React from "react";
import Sidebar from "@/app/components/ui/admin/Sidebar";
import Header from "@/app/components/ui/admin/Header";
import { SidebarProvider } from "@/app/contexts/SidebarContext";
import { fetchAdminAssignmentWithElection } from "@/libs/adminUtils";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../libs/auth";
import { redirect } from "next/navigation";

const layout = async ({ children }: { children: React.ReactNode }) => {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   return redirect("/login");
  // }

  // // Use server-side DB helper to avoid making HTTP requests from server components
  // let adminAssignment = null;
  // try {
  //   adminAssignment = await fetchAdminAssignmentWithElection(session.user.id);
  // } catch (err) {
  //   console.error("Failed to fetch admin assignment in layout:", err);
  // }

  // const electionState = adminAssignment?.election?.status;
  // if (electionState === "CLOSED") {
  //   // Redirect to a top-level page (outside the admin layout) to avoid layout recursion
  //   return redirect(
  //     `/election-closed?adminId=${session.user.id}&electionId=${adminAssignment?.election?.id}`
  //   );
  // }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default layout;
