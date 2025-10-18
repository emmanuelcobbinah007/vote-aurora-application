// API service for ballot management
const API_BASE_URL = "/api/superadmin/elections";

export interface BallotOrder {
  portfolioId: string;
  order: number;
}

export interface BallotResponse {
  id: string;
  election_id: string;
  portfolio_id: string;
  ballot_order: number;
  created_at: string;
  portfolio: {
    id: string;
    title: string;
    description: string | null;
    _count: {
      candidates: number;
    };
  };
}

export interface BallotApiResponse {
  ballots: BallotResponse[];
}

export interface UpdateBallotOrderResponse {
  message: string;
  ballots: BallotResponse[];
}

export const ballotApi = {
  // Get ballot order for an election
  getBallotOrder: async (electionId: string): Promise<BallotResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/${electionId}/ballot`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch ballot order");
    }

    const data: BallotApiResponse = await response.json();
    return data.ballots;
  },

  // Update ballot order for an election
  updateBallotOrder: async (
    electionId: string,
    ballotOrder: BallotOrder[]
  ): Promise<BallotResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/${electionId}/ballot`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ballotOrder }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update ballot order");
    }

    const data: UpdateBallotOrderResponse = await response.json();
    return data.ballots;
  },
};
