import prisma from '../lib/prisma';
import { StrategicDNA, SystemHealth } from '@prisma/client';

/**
 * Simulation Engine - Calcula impacto de ações hipotéticas
 * Sem gravar no banco. Apenas em memória.
 */

interface SimulationAction {
  type: 'resolve_risk' | 'complete_task' | 'complete_plan' | 'accept_suggestion';
  id: string;
}

interface SimulationRequest {
  userId: string;
  hypotheticalMode: 'conservador' | 'equilibrado' | 'expansao';
  actions: SimulationAction[];
}

interface SimulationResult {
  before: {
    health: SystemHealth;
    dna: StrategicDNA;
    topRisks: Array<{ id: string; title: string; severity: number }>;
    topPriorities: Array<{ id: string; title: string; score: number }>;
  };
  after: {
    health: SystemHealth;
    dna: StrategicDNA;
    topRisks: Array<{ id: string; title: string; severity: number }>;
    topPriorities: Array<{ id: string; title: string; score: number }>;
  };
  deltas: {
    health: number;
    dna: number;
    healthBreakdown: Record<string, number>;
    dnaBreakdown: Record<string, number>;
  };
  explanations: string[];
}

// Constantes
const INITIAL_DNA = {
  decisionQuality: 75,
  riskDiscipline: 60,
  executionDiscipline: 80,
  focusLeverage: 70,
  strategicConsistency: 65,
};

const INITIAL_HEALTH = {
  activeRisksSeverity: 85,
  executionStability: 70,
  alignment: 90,
  momentum: 60,
};

// Calcular score DNA
function calculateDnaScore(dna: Partial<StrategicDNA>): number {
  return Math.round(
    (dna.decisionQuality || 0) * 0.25 +
    (dna.riskDiscipline || 0) * 0.20 +
    (dna.executionDiscipline || 0) * 0.25 +
    (dna.focusLeverage || 0) * 0.15 +
    (dna.strategicConsistency || 0) * 0.15
  );
}

// Calcular score Health com ponderações do mode
function calculateHealthScore(health: Partial<SystemHealth>, mode: string): number {
  let w = { activeRisks: 0.35, execution: 0.35, alignment: 0.20, momentum: 0.10 };

  if (mode === 'conservador') {
    w = { activeRisks: 0.45, execution: 0.30, alignment: 0.15, momentum: 0.10 };
  } else if (mode === 'expansao') {
    w = { activeRisks: 0.25, execution: 0.40, alignment: 0.20, momentum: 0.15 };
  }

  return Math.round(
    (health.activeRisksSeverity || 0) * w.activeRisks +
    (health.executionStability || 0) * w.execution +
    (health.alignment || 0) * w.alignment +
    (health.momentum || 0) * w.momentum
  );
}

export async function simulateScenario(req: SimulationRequest): Promise<SimulationResult> {
  const { userId, hypotheticalMode, actions } = req;

  // 1. Carregar estado atual
  const [user, dnaRecord, healthRecord, activeRisks, activeDecisions, activePlans] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.strategicDNA.findUnique({ where: { userId } }),
    prisma.systemHealth.findUnique({ where: { userId } }),
    prisma.risk.findMany({
      where: { userId, status: 'active' },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.decision.findMany({
      where: { userId, status: { in: ['draft', 'active'] } },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.plan.findMany({
      where: { userId, status: { in: ['planning', 'active'] } },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!user) throw new Error('User not found');

  // Inicializar se não existem
  let dna = dnaRecord || { ...INITIAL_DNA, userId };
  let health = healthRecord || { ...INITIAL_HEALTH, userId };

  // Clone em memória (simulação)
  const simuDna = JSON.parse(JSON.stringify(dna));
  const simuHealth = JSON.parse(JSON.stringify(health));

  // Estado anterior
  const beforeHealth = JSON.parse(JSON.stringify(health));
  const beforeDna = JSON.parse(JSON.stringify(dna));

  // 2. Aplicar ações hipotéticas
  const explanations: string[] = [];

  for (const action of actions) {
    if (action.type === 'resolve_risk') {
      // Resolver risco: +10 activeRisksSeverity, +5 riskDiscipline
      simuHealth.activeRisksSeverity = Math.min(
        100,
        simuHealth.activeRisksSeverity + 10
      );
      simuDna.riskDiscipline = Math.min(100, simuDna.riskDiscipline + 5);
      explanations.push('Resolução de risco crítico melhorou a severidade ativa e disciplina de risco.');
    } else if (action.type === 'complete_task') {
      // Concluir tarefa: +1 executionDiscipline, +2 momentum
      simuDna.executionDiscipline = Math.min(100, simuDna.executionDiscipline + 1);
      simuHealth.momentum = Math.min(100, simuHealth.momentum + 2);
      explanations.push('Conclusão de tarefa crítica aumentou disciplina de execução e momentum.');
    } else if (action.type === 'complete_plan') {
      // Concluir plano: +2 executionDiscipline, +3 momentum, +4 strategicConsistency
      simuDna.executionDiscipline = Math.min(100, simuDna.executionDiscipline + 2);
      simuHealth.momentum = Math.min(100, simuHealth.momentum + 3);
      simuDna.strategicConsistency = Math.min(100, simuDna.strategicConsistency + 4);
      explanations.push('Conclusão de plano estratégico elevou consistência e momentum global.');
    } else if (action.type === 'accept_suggestion') {
      // Aceitar sugestão: +3 decisionQuality, +1 focusLeverage
      simuDna.decisionQuality = Math.min(100, simuDna.decisionQuality + 3);
      simuDna.focusLeverage = Math.min(100, simuDna.focusLeverage + 1);
      explanations.push('Implementação de sugestão estratégica reforçou qualidade de decisões.');
    }
  }

  // 3. Recalcular scores
  simuDna.overallScore = calculateDnaScore(simuDna);
  simuHealth.overallScore = calculateHealthScore(simuHealth, hypotheticalMode);

  // 4. Gerar Top Risks
  const topRisks = activeRisks.slice(0, 3).map(r => ({
    id: r.id,
    title: r.title,
    severity: parseInt(r.severity.replace(/[^0-9]/g, '') || '50'),
  }));

  // 5. Gerar Top Priorities (simplificado para MVP)
  const topPriorities = [
    ...activeDecisions
      .slice(0, 2)
      .map(d => ({
        id: d.id,
        title: d.title,
        score: parseInt(d.impact.replace(/[^0-9]/g, '') || '0'),
      })),
    ...activePlans
      .slice(0, 1)
      .map(p => ({
        id: p.id,
        title: p.title,
        score: 75,
      })),
  ].slice(0, 3);

  // 6. Calcular deltas
  const healthDelta = simuHealth.overallScore - beforeHealth.overallScore;
  const dnaDelta = simuDna.overallScore - beforeDna.overallScore;

  const result: SimulationResult = {
    before: {
      health: beforeHealth,
      dna: beforeDna,
      topRisks,
      topPriorities,
    },
    after: {
      health: simuHealth,
      dna: simuDna,
      topRisks: topRisks.map(r => ({
        ...r,
        severity: Math.min(100, Math.max(0, r.severity - 5)), // Ligeira melhora se ações foram aplicadas
      })),
      topPriorities,
    },
    deltas: {
      health: healthDelta,
      dna: dnaDelta,
      healthBreakdown: {
        activeRisksSeverity: simuHealth.activeRisksSeverity - beforeHealth.activeRisksSeverity,
        executionStability: simuHealth.executionStability - beforeHealth.executionStability,
        alignment: simuHealth.alignment - beforeHealth.alignment,
        momentum: simuHealth.momentum - beforeHealth.momentum,
      },
      dnaBreakdown: {
        decisionQuality: simuDna.decisionQuality - beforeDna.decisionQuality,
        riskDiscipline: simuDna.riskDiscipline - beforeDna.riskDiscipline,
        executionDiscipline: simuDna.executionDiscipline - beforeDna.executionDiscipline,
        focusLeverage: simuDna.focusLeverage - beforeDna.focusLeverage,
        strategicConsistency: simuDna.strategicConsistency - beforeDna.strategicConsistency,
      },
    },
    explanations:
      explanations.length > 0
        ? explanations.slice(0, 3)
        : ['Nenhuma ação simulada foi aplicada.'],
  };

  return result;
}
