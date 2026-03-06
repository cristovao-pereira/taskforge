import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'cristovaopb@gmail.com';

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log(`User with email ${email} not found.`);
        return;
    }

    console.log(`Found user ${user.id}. Deleting related data...`);

    await prisma.$transaction(async (tx) => {
        // Collect related records
        const docs = await tx.document.findMany({ where: { userId: user.id } });
        const docIds = docs.map(d => d.id);

        const eventLogs = await tx.eventLog.findMany({ where: { userId: user.id } });
        const eventLogIds = eventLogs.map(e => e.id);

        const plans = await tx.plan.findMany({ where: { userId: user.id } });
        const planIds = plans.map(p => p.id);

        console.log('Deleting dependent records...');

        // Level 2 dependecies
        await tx.documentInsights.deleteMany({ where: { documentId: { in: docIds } } });
        await tx.explanationLog.deleteMany({ where: { relatedEventId: { in: eventLogIds } } });
        await tx.task.deleteMany({ where: { planId: { in: planIds } } });

        // Level 1 dependencies pointing to document
        await tx.decisionSuggestion.deleteMany({ where: { userId: user.id } });
        await tx.planSuggestion.deleteMany({ where: { userId: user.id } });
        await tx.documentAuditLog.deleteMany({ where: { userId: user.id } });
        await tx.documentIngestionJob.deleteMany({ where: { userId: user.id } });

        // Update documents to remove relationships before deleting documents to avoid foreign key issues
        // Actually Prisma handles relations in many-to-many automatically when one side is deleted

        // Level 1 dependencies pointing to user
        await tx.document.deleteMany({ where: { userId: user.id } });
        await tx.suggestionFeedback.deleteMany({ where: { userId: user.id } });
        await tx.eventLog.deleteMany({ where: { userId: user.id } });

        await tx.plan.deleteMany({ where: { userId: user.id } });
        await tx.decision.deleteMany({ where: { userId: user.id } });
        await tx.risk.deleteMany({ where: { userId: user.id } });
        await tx.session.deleteMany({ where: { userId: user.id } });

        await tx.strategicDNA.deleteMany({ where: { userId: user.id } });
        await tx.systemHealth.deleteMany({ where: { userId: user.id } });

        await tx.agentJob.deleteMany({ where: { userId: user.id } });

        // Finally delete the user
        console.log('Deleting user...');
        await tx.user.delete({ where: { id: user.id } });
    }, {
        timeout: 60000 // 60 seconds
    });

    console.log('Successfully deleted user and all related data.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
