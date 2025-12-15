/*
  Warnings:

  - A unique constraint covering the columns `[voter_token_hash,portfolio_id]` on the table `Votes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Votes_voter_token_hash_election_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Votes_voter_token_hash_portfolio_id_key" ON "Votes"("voter_token_hash", "portfolio_id");
