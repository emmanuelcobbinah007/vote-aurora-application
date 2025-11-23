import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function OrchestratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Double-check authentication
  if (
    !session ||
    !["ORCHESTRATOR", "SUPERADMIN"].includes(session.user.role)
  ) {
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}
