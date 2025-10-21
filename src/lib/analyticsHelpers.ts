import { prisma } from "@/libs/prisma";

export async function getTotalVotes(electionId: string): Promise<number> {
  const result: Array<{ total_votes: number }> = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS total_votes
    FROM "Votes"
    WHERE election_id = ${electionId}
  `;
  return result[0]?.total_votes ?? 0;
}

export async function getVotesByCandidate(electionId: string) {
  const rows: Array<{
    candidate_id: string;
    votes: number;
    full_name: string;
  }> = await prisma.$queryRaw`
    SELECT c.id AS candidate_id, c.full_name, COUNT(v.*)::int AS votes
    FROM "Votes" v
    JOIN "Candidates" c ON v.candidate_id = c.id
    WHERE v.election_id = ${electionId}
    GROUP BY c.id, c.full_name
    ORDER BY votes DESC
  `;

  return rows;
}

export async function getVotesByPortfolio(electionId: string) {
  const rows: Array<{ portfolio_id: string; title: string; votes: number }> =
    await prisma.$queryRaw`
    SELECT p.id AS portfolio_id, p.title, COUNT(v.*)::int AS votes
    FROM "Votes" v
    JOIN "Candidates" c ON v.candidate_id = c.id
    JOIN "Portfolios" p ON c.portfolio_id = p.id
    WHERE v.election_id = ${electionId}
    GROUP BY p.id, p.title
    ORDER BY votes DESC
  `;

  return rows;
}

export async function getDistinctVotersWhoVoted(
  electionId: string
): Promise<number> {
  // Prefer counting VoterTokens that have voted (used=true or voted_at is not null)
  const count = await prisma.voterTokens.count({
    where: {
      election_id: electionId,
      OR: [{ used: true }, { voted_at: { not: null } }],
    },
  });

  return count;
}

export async function getHourlyTrends(electionId: string) {
  const rows: Array<{ hour: Date; votes: number }> = await prisma.$queryRaw`
    SELECT date_trunc('hour', v.cast_at) AS hour, COUNT(*)::int AS votes
    FROM "Votes" v
    WHERE v.election_id = ${electionId}
    GROUP BY hour
    ORDER BY hour
  `;

  return rows;
}

export function formatHourToLabel(hour: Date | string) {
  const d = new Date(hour);
  const hh = d.getHours().toString().padStart(2, "0");
  return `${hh}:00`;
}
export function formatDurationFromDates(
  start: string | Date,
  end: string | Date
) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const diff = Math.abs(e.getTime() - s.getTime());
    const minutes = Math.floor(diff / (1000 * 60));
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (mins || parts.length === 0) parts.push(`${mins}m`);
    return parts.join(" ");
  } catch (e) {
    return null;
  }
}
