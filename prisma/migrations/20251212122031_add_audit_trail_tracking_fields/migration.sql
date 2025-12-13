/*
  Warnings:

  - You are about to drop the column `otp` on the `VoterTokens` table. All the data in the column will be lost.
  - You are about to drop the column `used_at` on the `VoterTokens` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `VoterTokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[election_id,portfolio_id,candidate_id]` on the table `Analytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[election_id,portfolio_id]` on the table `Ballots` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voter_token]` on the table `VoterTokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[access_token]` on the table `VoterTokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id,election_id]` on the table `VoterTokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[voter_token_hash,election_id]` on the table `Votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entry_hash` to the `AuditTrail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `VoterTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_email` to the `VoterTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `VoterTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voter_token` to the `VoterTokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AdminAssignments" DROP CONSTRAINT "AdminAssignments_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Analytics" DROP CONSTRAINT "Analytics_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Analytics" DROP CONSTRAINT "Analytics_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Analytics" DROP CONSTRAINT "Analytics_portfolio_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ballots" DROP CONSTRAINT "Ballots_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ballots" DROP CONSTRAINT "Ballots_portfolio_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Candidates" DROP CONSTRAINT "Candidates_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Candidates" DROP CONSTRAINT "Candidates_portfolio_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Portfolios" DROP CONSTRAINT "Portfolios_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoterTokens" DROP CONSTRAINT "VoterTokens_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoterTokens" DROP CONSTRAINT "VoterTokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Votes" DROP CONSTRAINT "Votes_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Votes" DROP CONSTRAINT "Votes_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Votes" DROP CONSTRAINT "Votes_portfolio_id_fkey";

-- DropIndex
DROP INDEX "public"."VoterTokens_otp_key";

-- AlterTable
ALTER TABLE "Analytics" ALTER COLUMN "candidate_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AuditTrail" ADD COLUMN     "entry_hash" TEXT NOT NULL,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "previous_hash" TEXT,
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "Elections" ADD COLUMN     "department" TEXT DEFAULT 'General',
ADD COLUMN     "emails_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_general" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "total_eligible_voters" INTEGER,
ADD COLUMN     "voter_list_generated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InvitationTokens" ADD COLUMN     "election_id" TEXT;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "failed_login_attempts" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VoterTokens" DROP COLUMN "otp",
DROP COLUMN "used_at",
DROP COLUMN "user_id",
ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "access_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "ip_hash" TEXT,
ADD COLUMN     "otp_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otp_expires_at" TIMESTAMP(3),
ADD COLUMN     "otp_resend_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "student_email" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL,
ADD COLUMN     "ua_hash" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_agent" TEXT,
ADD COLUMN     "verification_otp" TEXT,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "voted_at" TIMESTAMP(3),
ADD COLUMN     "voter_token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Votes" ADD COLUMN     "voter_token_hash" TEXT,
ALTER COLUMN "candidate_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StudentSessions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "student_email" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "session_status" TEXT NOT NULL DEFAULT 'pending',
    "verification_otp" TEXT,
    "otp_sent_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "vote_started_at" TIMESTAMP(3),
    "vote_completed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteReceipts" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "voter_token_hash" TEXT NOT NULL,
    "verification_code" TEXT NOT NULL,
    "vote_commitment" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "merkle_leaf_index" INTEGER NOT NULL DEFAULT 0,
    "merkle_proof" JSONB,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "VoteReceipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerkleTree" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "root_hash" TEXT NOT NULL,
    "tree_height" INTEGER NOT NULL,
    "leaf_count" INTEGER NOT NULL,
    "tree_data" JSONB NOT NULL,
    "finalized_at" TIMESTAMP(3),

    CONSTRAINT "MerkleTree_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentSessions_access_token_key" ON "StudentSessions"("access_token");

-- CreateIndex
CREATE INDEX "StudentSessions_student_id_idx" ON "StudentSessions"("student_id");

-- CreateIndex
CREATE INDEX "StudentSessions_student_email_idx" ON "StudentSessions"("student_email");

-- CreateIndex
CREATE INDEX "StudentSessions_election_id_idx" ON "StudentSessions"("election_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSessions_student_id_election_id_key" ON "StudentSessions"("student_id", "election_id");

-- CreateIndex
CREATE UNIQUE INDEX "VoteReceipts_verification_code_key" ON "VoteReceipts"("verification_code");

-- CreateIndex
CREATE INDEX "VoteReceipts_election_id_idx" ON "VoteReceipts"("election_id");

-- CreateIndex
CREATE INDEX "VoteReceipts_verification_code_idx" ON "VoteReceipts"("verification_code");

-- CreateIndex
CREATE INDEX "VoteReceipts_voter_token_hash_idx" ON "VoteReceipts"("voter_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "MerkleTree_election_id_key" ON "MerkleTree"("election_id");

-- CreateIndex
CREATE INDEX "MerkleTree_election_id_idx" ON "MerkleTree"("election_id");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_election_id_portfolio_id_candidate_id_key" ON "Analytics"("election_id", "portfolio_id", "candidate_id");

-- CreateIndex
CREATE INDEX "AuditTrail_user_id_idx" ON "AuditTrail"("user_id");

-- CreateIndex
CREATE INDEX "AuditTrail_election_id_idx" ON "AuditTrail"("election_id");

-- CreateIndex
CREATE INDEX "AuditTrail_timestamp_idx" ON "AuditTrail"("timestamp");

-- CreateIndex
CREATE INDEX "AuditTrail_ip_address_idx" ON "AuditTrail"("ip_address");

-- CreateIndex
CREATE UNIQUE INDEX "Ballots_election_id_portfolio_id_key" ON "Ballots"("election_id", "portfolio_id");

-- CreateIndex
CREATE INDEX "Elections_status_idx" ON "Elections"("status");

-- CreateIndex
CREATE INDEX "Elections_start_time_idx" ON "Elections"("start_time");

-- CreateIndex
CREATE INDEX "Elections_end_time_idx" ON "Elections"("end_time");

-- CreateIndex
CREATE UNIQUE INDEX "VoterTokens_voter_token_key" ON "VoterTokens"("voter_token");

-- CreateIndex
CREATE UNIQUE INDEX "VoterTokens_access_token_key" ON "VoterTokens"("access_token");

-- CreateIndex
CREATE INDEX "VoterTokens_student_id_idx" ON "VoterTokens"("student_id");

-- CreateIndex
CREATE INDEX "VoterTokens_student_email_idx" ON "VoterTokens"("student_email");

-- CreateIndex
CREATE INDEX "VoterTokens_election_id_idx" ON "VoterTokens"("election_id");

-- CreateIndex
CREATE UNIQUE INDEX "VoterTokens_student_id_election_id_key" ON "VoterTokens"("student_id", "election_id");

-- CreateIndex
CREATE INDEX "Votes_election_id_idx" ON "Votes"("election_id");

-- CreateIndex
CREATE INDEX "Votes_portfolio_id_idx" ON "Votes"("portfolio_id");

-- CreateIndex
CREATE INDEX "Votes_voter_token_hash_idx" ON "Votes"("voter_token_hash");

-- CreateIndex
CREATE INDEX "Votes_cast_at_idx" ON "Votes"("cast_at");

-- CreateIndex
CREATE UNIQUE INDEX "Votes_voter_token_hash_election_id_key" ON "Votes"("voter_token_hash", "election_id");

-- AddForeignKey
ALTER TABLE "Portfolios" ADD CONSTRAINT "Portfolios_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidates" ADD CONSTRAINT "Candidates_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidates" ADD CONSTRAINT "Candidates_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballots" ADD CONSTRAINT "Ballots_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballots" ADD CONSTRAINT "Ballots_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterTokens" ADD CONSTRAINT "VoterTokens_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSessions" ADD CONSTRAINT "StudentSessions_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAssignments" ADD CONSTRAINT "AdminAssignments_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteReceipts" ADD CONSTRAINT "VoteReceipts_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerkleTree" ADD CONSTRAINT "MerkleTree_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationTokens" ADD CONSTRAINT "InvitationTokens_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
