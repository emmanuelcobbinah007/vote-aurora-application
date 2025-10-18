import React from "react";
import { Badge } from "@/components/ui/badge";
import { ELECTION_STATUS_CONFIG } from "./ElectionTypes";

interface StatusBadgeProps {
  status: keyof typeof ELECTION_STATUS_CONFIG;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = ELECTION_STATUS_CONFIG[status];

  return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
};

export default StatusBadge;
