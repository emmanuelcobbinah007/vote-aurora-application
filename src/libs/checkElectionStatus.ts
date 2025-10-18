import axios from "axios";

export const checkElectionStatus = async (adminId: string) => {
  const NEXT_PUBLIC_APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_APP_URL}/api/admin/${adminId}/check-opened`
    );
    return { status: response.status, data: response.data };
  } catch (error: any) {
    // If server responded with an error status (e.g., 403), return that info
    if (error?.response) {
      return { status: error.response.status, data: error.response.data };
    }
    console.error("Error checking election status:", error);
    // network or unexpected error - bubble up as 500-like response
    return { status: 500, data: { error: "CHECK_FAILED" } };
  }
};
