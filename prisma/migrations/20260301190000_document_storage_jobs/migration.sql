-- AlterTable
ALTER TABLE "Document"
ADD COLUMN "storagePath" TEXT,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "checksum" TEXT;

-- CreateTable
CREATE TABLE "DocumentIngestionJob" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "payloadJson" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentIngestionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentIngestionJob_status_nextRetryAt_idx" ON "DocumentIngestionJob"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "DocumentIngestionJob_documentId_createdAt_idx" ON "DocumentIngestionJob"("documentId", "createdAt");

-- AddForeignKey
ALTER TABLE "DocumentIngestionJob" ADD CONSTRAINT "DocumentIngestionJob_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentIngestionJob" ADD CONSTRAINT "DocumentIngestionJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
