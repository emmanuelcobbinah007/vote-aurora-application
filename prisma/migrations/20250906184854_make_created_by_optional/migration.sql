-- DropForeignKey
ALTER TABLE "public"."InvitationTokens" DROP CONSTRAINT "InvitationTokens_created_by_fkey";

-- AlterTable
ALTER TABLE "public"."InvitationTokens" ALTER COLUMN "created_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."InvitationTokens" ADD CONSTRAINT "InvitationTokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
