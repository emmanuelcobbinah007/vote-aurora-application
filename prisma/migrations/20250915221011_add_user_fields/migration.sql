-- AlterTable
ALTER TABLE "public"."Users" ADD COLUMN     "account_locked_until" TIMESTAMP(3),
ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_failed_attempt" TIMESTAMP(3),
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "password_changed_at" TIMESTAMP(3);
