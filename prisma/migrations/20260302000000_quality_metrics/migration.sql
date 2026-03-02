-- AlterTable DocumentInsights
ALTER TABLE "DocumentInsights" ADD COLUMN "processingTimeMs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "processedAt" TIMESTAMP(3);

-- CreateTable SuggestionFeedback
CREATE TABLE "SuggestionFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "suggestionType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "usefulnessScore" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuggestionFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SuggestionFeedback_userId_createdAt_idx" ON "SuggestionFeedback"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SuggestionFeedback_suggestionType_action_idx" ON "SuggestionFeedback"("suggestionType", "action");

-- AddForeignKey
ALTER TABLE "SuggestionFeedback" ADD CONSTRAINT "SuggestionFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
