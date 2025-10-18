import {
  Portfolio,
  PortfolioFormData,
} from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";

const API_BASE_URL = "/api/superadmin/elections";

export interface PortfolioResponse {
  portfolios: Portfolio[];
}

export interface CreatePortfolioResponse {
  message: string;
  portfolio: Portfolio;
}

export interface UpdatePortfolioResponse {
  message: string;
  portfolio: Portfolio;
}

export interface DeletePortfolioResponse {
  message: string;
}

export const portfolioApi = {
  // Get all portfolios for an election
  getPortfolios: async (electionId: string): Promise<Portfolio[]> => {
    const response = await fetch(`${API_BASE_URL}/${electionId}/portfolio`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch portfolios");
    }

    const data: PortfolioResponse = await response.json();
    return data.portfolios;
  },

  // Create a new portfolio
  createPortfolio: async (
    electionId: string,
    portfolioData: PortfolioFormData
  ): Promise<Portfolio> => {
    const response = await fetch(`${API_BASE_URL}/${electionId}/portfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(portfolioData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create portfolio");
    }

    const data: CreatePortfolioResponse = await response.json();
    return data.portfolio;
  },

  // Update a portfolio
  updatePortfolio: async (
    electionId: string,
    portfolioId: string,
    portfolioData: PortfolioFormData
  ): Promise<Portfolio> => {
    const response = await fetch(
      `${API_BASE_URL}/${electionId}/portfolio/${portfolioId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(portfolioData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update portfolio");
    }

    const data: UpdatePortfolioResponse = await response.json();
    return data.portfolio;
  },

  // Delete a portfolio
  deletePortfolio: async (
    electionId: string,
    portfolioId: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/${electionId}/portfolio/${portfolioId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete portfolio");
    }
  },
};
