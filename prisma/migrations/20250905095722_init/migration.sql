-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('VOTER', 'ADMIN', 'SUPERADMIN', 'APPROVER', 'ORCHESTRATOR');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."ElectionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'LIVE', 'CLOSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Elections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ElectionStatus" NOT NULL DEFAULT 'DRAFT',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,

    CONSTRAINT "Elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Portfolios" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Candidates" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "photo_url" TEXT,
    "manifesto" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ballots" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "ballot_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ballots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterTokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "VoterTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminAssignments" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAssignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Votes" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "cast_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Analytics" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "votes_count" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditTrail" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "election_id" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VoterTokens_otp_key" ON "public"."VoterTokens"("otp");

-- AddForeignKey
ALTER TABLE "public"."Elections" ADD CONSTRAINT "Elections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Elections" ADD CONSTRAINT "Elections_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Portfolios" ADD CONSTRAINT "Portfolios_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "public"."Elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidates" ADD CONSTRAINT "Candidates_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "public"."Elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidates" ADD CONSTRAINT "Candidates_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."Portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ballots" ADD CONSTRAINT "Ballots_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "public"."Elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ballots" ADD CONSTRAINT "Ballots_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."Portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterTokens" ADD CONSTRAINT "VoterTokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterTokens" ADD CONSTRAINT "VoterTokens_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "public"."Elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminAssignments" ADD CONSTRAINT "AdminAssignments_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminAssignments" ADD CONSTRAINT "AdminAssignments_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "public"."Elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminAssignments" ADD CONSTRAINT "AdminAssignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Votes" ADD CONSTRAINT "Votes_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "public"."Elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Votes" ADD CONSTRAINT "Votes_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."Portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Votes" ADD CONSTRAINT "Votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."Candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "public"."Elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."Portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."Candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditTrail" ADD CONSTRAINT "AuditTrail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditTrail" ADD CONSTRAINT "AuditTrail_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "public"."Elections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
