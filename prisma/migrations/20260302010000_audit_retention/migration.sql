-- AlterTable Document
ALTER TABLE "Document" ADD COLUMN "isConfidential" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "retentionExpiresAt" TIMESTAMP(3);

-- CreateTable DocumentAuditLog
CREATE TABLE "DocumentAuditLog" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentAuditLog_documentId_createdAt_idx" ON "DocumentAuditLog"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentAuditLog_userId_createdAt_idx" ON "DocumentAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentAuditLog_action_createdAt_idx" ON "DocumentAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "Document_userId_retentionExpiresAt_idx" ON "Document"("userId", "retentionExpiresAt");

-- CreateIndex
CREATE INDEX "Document_userId_createdAt_idx" ON "Document"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "DocumentAuditLog" ADD CONSTRAINT "DocumentAuditLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAuditLog" ADD CONSTRAINT "DocumentAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
