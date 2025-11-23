import { NextRequest } from "next/server";

export function getRequestInfo(request: NextRequest | Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ip_address: ip, user_agent: userAgent };
}
