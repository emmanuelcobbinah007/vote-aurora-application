import React from "react";

// Helper function to format action details
export const formatActionDetails = (action: string, details: string) => {
  try {
    const parsed = JSON.parse(details);

    switch (action) {
      case "INVITATION_SENT":
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              Invitation sent to{" "}
              <span className="font-medium text-blue-600">{parsed.email}</span>
            </div>
            <div className="text-xs text-gray-500">
              Role: {parsed.role} • Sent by: {parsed.sent_by}
            </div>
          </div>
        );

      case "INVITATION_ACCEPTED":
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              Invitation accepted by{" "}
              <span className="font-medium text-green-600">
                {parsed.full_name}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Email: {parsed.email} • Role: {parsed.role}
            </div>
          </div>
        );

      case "ORCHESTRATOR_ACCOUNT_CREATED":
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              New orchestrator account created for{" "}
              <span className="font-medium text-green-600">
                {parsed.full_name}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Email: {parsed.email} • Role: {parsed.role}
            </div>
          </div>
        );

      case "SUPERADMIN_ACCOUNT_CREATED":
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              New SuperAdmin account created for{" "}
              <span className="font-medium text-purple-600">
                {parsed.full_name}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Email: {parsed.email} • Role: {parsed.role}
            </div>
          </div>
        );

      case "ADMIN_ACCOUNT_CREATED":
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              New admin account created for{" "}
              <span className="font-medium text-blue-600">
                {parsed.full_name}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Email: {parsed.email} • Role: {parsed.role}
            </div>
          </div>
        );

      case "USER_LOGIN":
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              User logged into the system
            </div>
            {parsed.ip_address && (
              <div className="text-xs text-gray-500">
                IP Address: {parsed.ip_address}
              </div>
            )}
          </div>
        );

      case "USER_LOGOUT":
        return (
          <div className="text-sm text-gray-700">
            User logged out of the system
          </div>
        );

      case "ELECTION_CREATED":
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              New election created:{" "}
              <span className="font-medium text-purple-600">
                {parsed.election_title || parsed.title}
              </span>
            </div>
            {parsed.description && (
              <div className="text-xs text-gray-500">{parsed.description}</div>
            )}
          </div>
        );

      case "VOTE_CAST":
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              Vote cast in election:{" "}
              <span className="font-medium text-green-600">
                {parsed.election_title}
              </span>
            </div>
            {parsed.candidate_name && (
              <div className="text-xs text-gray-500">
                Candidate: {parsed.candidate_name}
              </div>
            )}
          </div>
        );

      default:
        // For unknown actions, try to display key-value pairs nicely
        const keyValuePairs = Object.entries(parsed)
          .filter(([key, value]) => value !== null && value !== undefined)
          .slice(0, 3); // Limit to 3 key-value pairs to avoid clutter

        if (keyValuePairs.length === 0) {
          return <div className="text-sm text-gray-700">Action completed</div>;
        }

        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              {keyValuePairs.map(([key, value], index) => (
                <div
                  key={key}
                  className={
                    index === 0 ? "font-medium" : "text-xs text-gray-500"
                  }
                >
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  : {String(value)}
                </div>
              ))}
            </div>
          </div>
        );
    }
  } catch (error) {
    // If JSON parsing fails, return the details as-is but truncated
    const truncated =
      details.length > 100 ? details.substring(0, 100) + "..." : details;
    return (
      <div className="text-sm text-gray-700 font-mono text-xs bg-gray-50 p-2 rounded">
        {truncated}
      </div>
    );
  }
};

// Helper function to format timestamp
export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
