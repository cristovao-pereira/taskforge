-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "objective" TEXT;

-- AlterTable
ALTER TABLE "_DecisionToDocument" ADD CONSTRAINT "_DecisionToDocument_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DecisionToDocument_AB_unique";

-- AlterTable
ALTER TABLE "_DocumentToPlan" ADD CONSTRAINT "_DocumentToPlan_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DocumentToPlan_AB_unique";

-- AlterTable
ALTER TABLE "_DocumentToRisk" ADD CONSTRAINT "_DocumentToRisk_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DocumentToRisk_AB_unique";
