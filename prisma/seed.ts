import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@taskforge.app' },
    update: {},
    create: {
      id: 'user-1',
      email: 'demo@taskforge.app',
      name: 'Demo User',
      strategicMode: 'equilibrado',
    },
  })
  console.log('✅ Created demo user:', demoUser.email)

  // Create Strategic DNA (DNA Estratégico)
  const strategicDna = await prisma.strategicDNA.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      decisionQuality: 82,
      riskDiscipline: 75,
      executionDiscipline: 88,
      focusLeverage: 78,
      strategicConsistency: 80,
      overallScore: 81,
    },
  })
  console.log('✅ Created Strategic DNA (DNA Estratégico) for user')

  // Create System Health record
  const systemHealth = await prisma.systemHealth.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      activeRisksSeverity: 65,
      executionStability: 85,
      alignment: 90,
      momentum: 75,
      overallScore: 79,
    },
  })
  console.log('✅ Created System Health record')

  // Create sample decisions
  const decision1 = await prisma.decision.create({
    data: {
      title: 'Migrate to PostgreSQL for Production',
      description: 'Transition from SQLite to PostgreSQL to support production scale and concurrent access',
      status: 'active',
      impact: 'high',
      confidence: 85,
      userId: demoUser.id,
    },
  })

  const decision2 = await prisma.decision.create({
    data: {
      title: 'Implement Firebase Authentication',
      description: 'Add secure authentication using Firebase Auth to replace hardcoded user logic',
      status: 'draft',
      impact: 'critical',
      confidence: 90,
      userId: demoUser.id,
    },
  })
  console.log('✅ Created sample decisions')

  // Create strategic session
  const session = await prisma.session.create({
    data: {
      userId: demoUser.id,
      title: 'Production Readiness Assessment',
      type: 'strategy',
      status: 'completed',
      startedAt: new Date('2026-03-01T10:00:00'),
      endedAt: new Date('2026-03-01T12:00:00'),
    },
  })
  console.log('✅ Created strategic session')

  // Create sample plan
  const plan = await prisma.plan.create({
    data: {
      userId: demoUser.id,
      title: 'Q1 2026 Production Launch',
      description: 'Complete production deployment with security, scalability, and monitoring',
      status: 'active',
      priority: 'critical',
      decisionId: decision1.id,
    },
  })
  console.log('✅ Created sample plan')

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        planId: plan.id,
        title: 'Setup PostgreSQL database',
        status: 'todo',
        dueDate: new Date('2026-03-10'),
      },
      {
        planId: plan.id,
        title: 'Deploy Firebase Auth',
        status: 'todo',
        dueDate: new Date('2026-03-15'),
      },
      {
        planId: plan.id,
        title: 'Configure CORS allowlist',
        status: 'todo',
        dueDate: new Date('2026-03-20'),
      },
    ],
  })
  console.log('✅ Created sample tasks')

  // Create sample risk
  const risk = await prisma.risk.create({
    data: {
      userId: demoUser.id,
      title: 'No Authentication System',
      description: 'Current system has no authentication, all endpoints are publicly accessible',
      severity: 'critical',
      status: 'active',
    },
  })
  console.log('✅ Created sample risk')

  // Create sample document
  const document = await prisma.document.create({
    data: {
      userId: demoUser.id,
      title: 'Production Plan - Database Migration',
      type: 'PDF',
      size: 1024000,
      status: 'processed',
      processedAt: new Date(),
      linkedDecisions: {
        connect: { id: decision1.id },
      },
    },
  })
  console.log('✅ Created sample document')

  // Create event logs
  await prisma.eventLog.createMany({
    data: [
      {
        userId: demoUser.id,
        eventType: 'decision_created',
        entityType: 'decision',
        entityId: decision1.id,
        metadata: JSON.stringify({ impact: 'high', title: decision1.title }),
      },
      {
        userId: demoUser.id,
        eventType: 'plan_created',
        entityType: 'plan',
        entityId: plan.id,
        metadata: JSON.stringify({ status: 'active', title: plan.title }),
      },
    ],
  })
  console.log('✅ Created event logs')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
