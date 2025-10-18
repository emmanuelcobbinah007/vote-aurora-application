import {
  User,
  Vote,
  Activity,
  Shield,
  UserPlus,
  Eye,
  Crown,
} from "lucide-react";

// Helper function to get action icon
export const getActionIcon = (action: string) => {
  switch (action) {
    case "USER_LOGIN":
      return User;
    case "VOTE_CAST":
      return Vote;
    case "ELECTION_CREATED":
    case "ELECTION_ENDED":
      return Activity;
    case "USER_APPROVED":
      return Shield;
    case "CANDIDATE_REGISTERED":
      return UserPlus;
    case "RESULTS_PUBLISHED":
      return Eye;
    case "INVITATION_SENT":
      return UserPlus;
    case "INVITATION_ACCEPTED":
      return User;
    case "ORCHESTRATOR_ACCOUNT_CREATED":
      return User;
    case "SUPERADMIN_ACCOUNT_CREATED":
      return Crown;
    case "ADMIN_ACCOUNT_CREATED":
      return Shield;
    default:
      return Activity;
  }
};

// Helper function to get action color
export const getActionColor = (action: string) => {
  switch (action) {
    case "USER_LOGIN":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "VOTE_CAST":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "ELECTION_CREATED":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "ELECTION_ENDED":
      return "text-[#2ecc71] bg-[#fef3c7]";
    case "USER_APPROVED":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "CANDIDATE_REGISTERED":
      return "text-[#2ecc71] bg-[#fef3c7]";
    case "RESULTS_PUBLISHED":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "INVITATION_SENT":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "INVITATION_ACCEPTED":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "ORCHESTRATOR_ACCOUNT_CREATED":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "SUPERADMIN_ACCOUNT_CREATED":
      return "text-[#2ecc71] bg-[#d1fae5]";
    case "ADMIN_ACCOUNT_CREATED":
      return "text-[#2ecc71] bg-[#d1fae5]";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

// Helper function to format action text
export const formatAction = (action: string) => {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};
