import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
                strategicMode: true,
                hasCompletedOnboarding: true,
                objective: true,
                createdAt: true,
            }
        });

        if (!user) {
            console.log(`❌ Usuário não encontrado: ${email}`);
            return;
        }

        console.log('\n✅ Usuário encontrado:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email:     ${user.email}`);
        console.log(`👤 Nome:      ${user.name || 'N/A'}`);
        console.log(`💎 Plano:     ${user.plan || 'gratis'}`);
        console.log(`🎯 Modo:      ${user.strategicMode || 'equilibrado'}`);
        console.log(`✓ Onboarding: ${user.hasCompletedOnboarding ? 'Sim' : 'Não'}`);
        console.log(`📝 Objetivo:  ${user.objective || 'N/A'}`);
        console.log(`🆔 ID:        ${user.id}`);
        console.log(`📅 Criado:    ${user.createdAt}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Verificar se tem plano estratégico
        const normalizedPlan = user.plan?.toLowerCase().trim();
        if (normalizedPlan === 'estrategico') {
            console.log('✅ PLANO ESTRATÉGICO ATIVO - pode acessar simulações');
        } else {
            console.log(`⚠️  Plano atual: ${user.plan || 'gratis'} - sem acesso a simulações`);
        }

    } catch (error) {
        console.error('Erro ao consultar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2] || 'cristovaopb@gmail.com';
console.log(`\n🔍 Consultando usuário: ${email}...\n`);
checkUser(email);
