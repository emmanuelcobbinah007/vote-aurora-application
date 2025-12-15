-- DropForeignKey
ALTER TABLE "public"."AuditTrail" DROP CONSTRAINT "AuditTrail_user_id_fkey";

-- AlterTable
ALTER TABLE "AuditTrail" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
