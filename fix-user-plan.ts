// Fix user plan - Run this script if your user is blocked
// Usage: node fix-user-plan.js <userId> <planName>
// Example: node fix-user-plan.js abc123 strategic

import prisma from './lib/prisma';

const userId = process.argv[2];
const planName = process.argv[3]?.toLowerCase() || 'strategic';

if (!userId) {
  console.error('❌ Erro: userId é obrigatório');
  console.error('Uso: node fix-user-plan.js <userId> [planName]');
  console.error('Exemplo: node fix-user-plan.js abc123 strategic');
  process.exit(1);
}

async function fixUserPlan() {
  try {
    console.log(`🔍 Buscando usuário: ${userId}`);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`❌ Usuário não encontrado: ${userId}`);
      process.exit(1);
    }

    console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`📊 Plano atual: ${user.plan || 'null/undefined'}`);

    // Normalizar planName
    const validPlans = ['free', 'builder', 'strategic', 'estrategico'];
    let normalizedPlan = planName;
    
    if (planName === 'estrategico') {
      normalizedPlan = 'strategic';
      console.log('📝 Normalizando: "estrategico" → "strategic"');
    }

    if (!validPlans.includes(planName)) {
      console.error(`❌ Plano inválido: ${planName}`);
      console.error(`   Planos válidos: ${validPlans.join(', ')}`);
      process.exit(1);
    }

    // Atualizar
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { plan: normalizedPlan },
    });

    console.log(`✅ Plano atualizado para: ${updated.plan}`);
    console.log(`\n🚀 Tente acessar a Simulação Estratégica agora!`);
    console.log(`   O botão deve aparecer azul (desbloqueado) no Dashboard.`);
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserPlan();
