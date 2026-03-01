-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "strategicMode" TEXT NOT NULL DEFAULT 'equilibrado',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "impact" TEXT NOT NULL DEFAULT 'medium',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "userId" TEXT NOT NULL,
    "decisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "dueDate" TIMESTAMP(3),
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'active',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "storageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentInsights" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "summary" TEXT,
    "decisionsJson" TEXT,
    "risksJson" TEXT,
    "opportunitiesJson" TEXT,
    "suggestedPlanJson" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentInsights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "impactScore" INTEGER NOT NULL DEFAULT 0,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "confidenceScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT,
    "phasesJson" TEXT,
    "tasksJson" TEXT,
    "timelineEstimate" TEXT,
    "confidenceScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExplanationLog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "whatChanged" TEXT NOT NULL,
    "whyChanged" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "deltas" TEXT,
    "relatedEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExplanationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicDNA" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "decisionQuality" INTEGER NOT NULL DEFAULT 75,
    "riskDiscipline" INTEGER NOT NULL DEFAULT 60,
    "executionDiscipline" INTEGER NOT NULL DEFAULT 80,
    "focusLeverage" INTEGER NOT NULL DEFAULT 70,
    "strategicConsistency" INTEGER NOT NULL DEFAULT 65,
    "overallScore" INTEGER NOT NULL DEFAULT 71,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategicDNA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemHealth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeRisksSeverity" INTEGER NOT NULL DEFAULT 85,
    "executionStability" INTEGER NOT NULL DEFAULT 70,
    "alignment" INTEGER NOT NULL DEFAULT 90,
    "momentum" INTEGER NOT NULL DEFAULT 60,
    "overallScore" INTEGER NOT NULL DEFAULT 78,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DecisionToDocument" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DocumentToPlan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DocumentToRisk" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentInsights_documentId_key" ON "DocumentInsights"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExplanationLog_relatedEventId_key" ON "ExplanationLog"("relatedEventId");

-- CreateIndex
CREATE UNIQUE INDEX "StrategicDNA_userId_key" ON "StrategicDNA"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemHealth_userId_key" ON "SystemHealth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_DecisionToDocument_AB_unique" ON "_DecisionToDocument"("A", "B");

-- CreateIndex
CREATE INDEX "_DecisionToDocument_B_index" ON "_DecisionToDocument"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToPlan_AB_unique" ON "_DocumentToPlan"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToPlan_B_index" ON "_DocumentToPlan"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToRisk_AB_unique" ON "_DocumentToRisk"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToRisk_B_index" ON "_DocumentToRisk"("B");

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentInsights" ADD CONSTRAINT "DocumentInsights_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionSuggestion" ADD CONSTRAINT "DecisionSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionSuggestion" ADD CONSTRAINT "DecisionSuggestion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSuggestion" ADD CONSTRAINT "PlanSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSuggestion" ADD CONSTRAINT "PlanSuggestion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExplanationLog" ADD CONSTRAINT "ExplanationLog_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "EventLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicDNA" ADD CONSTRAINT "StrategicDNA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemHealth" ADD CONSTRAINT "SystemHealth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DecisionToDocument" ADD CONSTRAINT "_DecisionToDocument_A_fkey" FOREIGN KEY ("A") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DecisionToDocument" ADD CONSTRAINT "_DecisionToDocument_B_fkey" FOREIGN KEY ("B") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToPlan" ADD CONSTRAINT "_DocumentToPlan_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToPlan" ADD CONSTRAINT "_DocumentToPlan_B_fkey" FOREIGN KEY ("B") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToRisk" ADD CONSTRAINT "_DocumentToRisk_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToRisk" ADD CONSTRAINT "_DocumentToRisk_B_fkey" FOREIGN KEY ("B") REFERENCES "Risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
