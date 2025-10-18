-- CreateTable
CREATE TABLE "public"."InvitationTokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'ORCHESTRATOR',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "InvitationTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitationTokens_email_key" ON "public"."InvitationTokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationTokens_token_key" ON "public"."InvitationTokens"("token");

-- AddForeignKey
ALTER TABLE "public"."InvitationTokens" ADD CONSTRAINT "InvitationTokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
