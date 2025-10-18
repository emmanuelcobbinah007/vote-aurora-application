import { apiClient } from "./apiClient";
import {
  Election,
  ElectionWithDetails,
  Portfolio,
  Candidate,
  Ballot,
  mockElections,
  mockPortfolios,
  mockCandidates,
  mockBallots,
  getElectionWithDetails,
} from "@/data";

// Simulated API delay for realistic loading states
const simulateApiDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const electionsApi = {
  // Get all elections with pagination support
  async getElections(params?: { page?: number; limit?: number }): Promise<{
    elections: Election[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const url = `superadmin/elections${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    return apiClient.get(url).then((res) => res.data);
  },

  // Get election by ID with details
  async getElectionWithDetails(
    id: string
  ): Promise<ElectionWithDetails | null> {
    // await simulateApiDelay();
    // In production: return apiClient.get(`/elections/${id}`).then(res => res.data);
    return getElectionWithDetails(id);
  },

  // Create new election
  async createElection(
    election: Omit<Election, "id" | "created_at" | "updated_at">
  ): Promise<Election> {
    return apiClient
      .post("superadmin/elections", election)
      .then((res) => res.data);
  },

  // Update election
  async updateElection(
    id: string,
    updates: Partial<Election>
  ): Promise<Election> {
    return apiClient
      .patch(`superadmin/elections/${id}`, updates)
      .then((res) => res.data);
  },

  // Delete election
  async deleteElection(id: string): Promise<void> {
    await simulateApiDelay();
    return apiClient.delete(`superadmin/elections/${id}`);
  },

  // Portfolio operations
  async getPortfolios(electionId: string): Promise<Portfolio[]> {
    await simulateApiDelay();
    // In production: return apiClient.get(`/elections/${electionId}/portfolios`).then(res => res.data);
    return mockPortfolios.filter((p) => p.election_id === electionId);
  },

  async createPortfolio(
    portfolio: Omit<Portfolio, "id" | "created_at">
  ): Promise<Portfolio> {
    await simulateApiDelay();
    // In production: return apiClient.post(`/elections/${portfolio.election_id}/portfolios`, portfolio).then(res => res.data);
    const newPortfolio: Portfolio = {
      ...portfolio,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    mockPortfolios.push(newPortfolio);
    return newPortfolio;
  },

  async updatePortfolio(
    id: string,
    updates: Partial<Portfolio>
  ): Promise<Portfolio> {
    await simulateApiDelay();
    // In production: return apiClient.put(`/portfolios/${id}`, updates).then(res => res.data);
    const index = mockPortfolios.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Portfolio not found");

    mockPortfolios[index] = { ...mockPortfolios[index], ...updates };
    return mockPortfolios[index];
  },

  async deletePortfolio(id: string): Promise<void> {
    await simulateApiDelay();
    // In production: return apiClient.delete(`/portfolios/${id}`);
    const index = mockPortfolios.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Portfolio not found");
    mockPortfolios.splice(index, 1);
  },

  // Candidate operations
  async getCandidates(electionId: string): Promise<Candidate[]> {
    await simulateApiDelay();
    // In production: return apiClient.get(`/elections/${electionId}/candidates`).then(res => res.data);
    return mockCandidates.filter((c) => c.election_id === electionId);
  },

  async createCandidate(
    candidate: Omit<Candidate, "id" | "created_at">
  ): Promise<Candidate> {
    await simulateApiDelay();
    // In production: return apiClient.post(`/elections/${candidate.election_id}/candidates`, candidate).then(res => res.data);
    const newCandidate: Candidate = {
      ...candidate,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    mockCandidates.push(newCandidate);
    return newCandidate;
  },

  async updateCandidate(
    id: string,
    updates: Partial<Candidate>
  ): Promise<Candidate> {
    await simulateApiDelay();
    // In production: return apiClient.put(`/candidates/${id}`, updates).then(res => res.data);
    const index = mockCandidates.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Candidate not found");

    mockCandidates[index] = { ...mockCandidates[index], ...updates };
    return mockCandidates[index];
  },

  async deleteCandidate(id: string): Promise<void> {
    await simulateApiDelay();
    // In production: return apiClient.delete(`/candidates/${id}`);
    const index = mockCandidates.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Candidate not found");
    mockCandidates.splice(index, 1);
  },

  // Ballot operations
  async getBallots(electionId: string): Promise<Ballot[]> {
    await simulateApiDelay();
    // In production: return apiClient.get(`/elections/${electionId}/ballots`).then(res => res.data);
    return mockBallots.filter((b) => b.election_id === electionId);
  },
};
