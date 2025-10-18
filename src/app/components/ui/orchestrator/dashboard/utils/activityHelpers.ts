import {
  Vote,
  Users,
  CheckCircle,
  UserCheck,
  Shield,
  Activity,
} from "lucide-react";

export interface ActivityMetadata {
  election_title?: string;
  description?: string;
  user_name?: string;
  user_email?: string;
  votes_count?: number;
  registered_count?: number;
  total_votes?: number;
  warning?: string;
  turnout_percentage?: number;
  status?: string;
  batch_operation?: boolean;
  portfolio?: string;
}

export interface RecentActivity {
  id: string;
  user_id: string;
  election_id: string | null;
  action: string;
  metadata: ActivityMetadata;
  timestamp: string;
}

export const getActivityIcon = (action: string) => {
  switch (action) {
    case "ELECTION_CREATED":
      return Vote;
    case "VOTE_CAST":
      return Users;
    case "ELECTION_ENDED":
    case "RESULTS_PUBLISHED":
      return CheckCircle;
    case "USER_REGISTERED":
    case "USER_APPROVED":
    case "CANDIDATE_REGISTERED":
      return UserCheck;
    case "USER_LOGIN":
      return Shield;
    default:
      return Activity;
  }
};

export const getActivityColor = (
  action: string,
  metadata: ActivityMetadata
) => {
  // Check for warning conditions in metadata
  if (metadata && (metadata.warning || metadata.status === "warning")) {
    return "text-yellow-600 bg-yellow-50";
  }

  switch (action) {
    case "ELECTION_CREATED":
    case "ELECTION_ENDED":
    case "RESULTS_PUBLISHED":
    case "USER_APPROVED":
      return "text-green-600 bg-green-50";
    case "VOTE_CAST":
    case "USER_LOGIN":
      return "text-[#2ecc71] bg-[#e6f9f1]";
    case "USER_REGISTERED":
    case "CANDIDATE_REGISTERED":
      return "text-purple-600 bg-purple-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const getActivityDescription = (
  action: string,
  metadata: ActivityMetadata
) => {
  switch (action) {
    case "ELECTION_CREATED":
      return `Created new election: ${metadata?.election_title || "Untitled"}`;
    case "VOTE_CAST":
      return `Vote cast in ${metadata?.election_title || "election"}`;
    case "USER_REGISTERED":
      if (metadata?.registered_count) {
        return `${metadata.registered_count} new voters registered in the system`;
      }
      return "New user registered";
    case "ELECTION_ENDED":
      return `${metadata?.election_title || "Election"} completed successfully`;
    case "RESULTS_PUBLISHED":
      return `Results published for ${metadata?.election_title || "election"}`;
    default:
      return action.replace(/_/g, " ").toLowerCase();
  }
};
