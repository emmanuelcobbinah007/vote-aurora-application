import {
  Candidate,
  CandidateFormData,
} from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";

const API_BASE_URL = "/api/superadmin/elections";

export interface CandidateResponse {
  candidates: Candidate[];
}

export interface CreateCandidateResponse {
  message: string;
  candidate: Candidate;
}

export interface UpdateCandidateResponse {
  message: string;
  candidate: Candidate;
}

export interface DeleteCandidateResponse {
  message: string;
}

export const candidateApi = {
  // Get all candidates for an election
  getCandidates: async (electionId: string): Promise<Candidate[]> => {
    const response = await fetch(`${API_BASE_URL}/${electionId}/candidate`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch candidates");
    }

    const data: CandidateResponse = await response.json();
    return data.candidates;
  },

  // Create a new candidate
  createCandidate: async (
    electionId: string,
    portfolioId: string,
    candidateData: CandidateFormData
  ): Promise<Candidate> => {
    const response = await fetch(`${API_BASE_URL}/${electionId}/candidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        portfolio_id: portfolioId,
        ...candidateData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create candidate");
    }

    const data: CreateCandidateResponse = await response.json();
    return data.candidate;
  },

  // Update a candidate
  updateCandidate: async (
    electionId: string,
    candidateId: string,
    candidateData: CandidateFormData
  ): Promise<Candidate> => {
    const response = await fetch(
      `${API_BASE_URL}/${electionId}/candidate/${candidateId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update candidate");
    }

    const data: UpdateCandidateResponse = await response.json();
    return data.candidate;
  },

  // Delete a candidate
  deleteCandidate: async (
    electionId: string,
    candidateId: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/${electionId}/candidate/${candidateId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete candidate");
    }
  },
};
