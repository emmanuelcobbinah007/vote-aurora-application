import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Double-check authentication (middleware should catch this, but defense-in-depth)
  if (!session || session.user.role !== "SUPERADMIN") {
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}
