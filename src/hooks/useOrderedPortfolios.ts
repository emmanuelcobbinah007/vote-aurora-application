import { useMemo } from "react";
import { ElectionWithDetails, Portfolio } from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";

/**
 * Custom hook to create ordered portfolios based on ballot order
 */
export function useOrderedPortfolios(
  election: ElectionWithDetails | undefined, 
  ballotOrder: any[] | undefined
) {
  return useMemo(() => {
    if (!election?.portfolios || !ballotOrder) {
      return election?.portfolios || [];
    }

    // Sort portfolios according to ballot_order from database
    const portfolioMap = new Map(election.portfolios.map((p) => [p.id, p]));
    return ballotOrder
      .sort((a, b) => a.ballot_order - b.ballot_order)
      .map((order) => portfolioMap.get(order.portfolio_id))
      .filter(Boolean) as Portfolio[];
  }, [election?.portfolios, ballotOrder]);
}