import React from "react";
import CardShimmer from "./CardShimmer";

interface CardGridShimmerProps {
  count?: number;
  columns?:
    | "md:grid-cols-2 lg:grid-cols-3"
    | "md:grid-cols-1 lg:grid-cols-2"
    | "md:grid-cols-2 lg:grid-cols-4";
  cardHeight?: string;
  showActions?: boolean;
}

const CardGridShimmer: React.FC<CardGridShimmerProps> = ({
  count = 6,
  columns = "md:grid-cols-2 lg:grid-cols-3",
  cardHeight = "h-48",
  showActions = true,
}) => {
  return (
    <div className={`grid gap-6 ${columns}`}>
      {Array.from({ length: count }, (_, index) => (
        <CardShimmer
          key={`card-shimmer-${index}`}
          height={cardHeight}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default CardGridShimmer;
