export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);

  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { date: dateStr, time: timeStr };
};

export const formatActionDetails = (action: string, details: string) => {
  try {
    const parsedDetails = JSON.parse(details);

    switch (action) {
      case "USER_LOGIN":
        return `Login successful${
          parsedDetails.ipAddress ? ` from IP: ${parsedDetails.ipAddress}` : ""
        }`;

      case "ELECTION_CREATED":
      case "ELECTION_UPDATED":
      case "ELECTION_DELETED":
        let result = parsedDetails.electionTitle || "Election";
        if (parsedDetails.changes) {
          result += ` - Changes: ${Object.keys(parsedDetails.changes).join(
            ", "
          )}`;
        }
        return result;

      case "CANDIDATE_ADDED":
      case "CANDIDATE_UPDATED":
      case "CANDIDATE_REMOVED":
        let candidateResult = parsedDetails.candidateName || "Candidate";
        if (parsedDetails.portfolioName) {
          candidateResult += ` - Portfolio: ${parsedDetails.portfolioName}`;
        }
        return candidateResult;

      case "VOTE_CAST":
        return `Vote recorded for election${
          parsedDetails.portfolios
            ? ` - Portfolios: ${parsedDetails.portfolios.length}`
            : ""
        }`;

      default:
        return details.length > 100
          ? `${details.substring(0, 100)}...`
          : details;
    }
  } catch (error) {
    return details.length > 100 ? `${details.substring(0, 100)}...` : details;
  }
};
