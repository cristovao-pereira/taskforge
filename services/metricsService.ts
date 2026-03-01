import prisma from '../lib/prisma';
import { StrategicDNA, SystemHealth } from '@prisma/client';

// Constants
const INITIAL_DNA = {
  decisionQuality: 75,
  riskDiscipline: 60,
  executionDiscipline: 80,
  focusLeverage: 70,
  strategicConsistency: 65,
  overallScore: 71,
};

const INITIAL_HEALTH = {
  activeRisksSeverity: 85,
  executionStability: 70,
  alignment: 90,
  momentum: 60,
  overallScore: 78,
};

// Helper: Calculate DNA Score
function calculateDnaScore(dna: StrategicDNA): number {
  return Math.round(
    (dna.decisionQuality * 0.25) +
    (dna.riskDiscipline * 0.20) +
    (dna.executionDiscipline * 0.25) +
    (dna.focusLeverage * 0.15) +
    (dna.strategicConsistency * 0.15)
  );
}

// Helper: Calculate Health Score
function calculateHealthScore(health: SystemHealth, mode: string): number {
  let w = { activeRisks: 0.35, execution: 0.35, alignment: 0.20, momentum: 0.10 };
    
  if (mode === 'conservador') {
    w = { activeRisks: 0.45, execution: 0.30, alignment: 0.15, momentum: 0.10 };
  } else if (mode === 'expansao') {
    w = { activeRisks: 0.25, execution: 0.40, alignment: 0.20, momentum: 0.15 };
  }

  return Math.round(
    (health.activeRisksSeverity * w.activeRisks) +
    (health.executionStability * w.execution) +
    (health.alignment * w.alignment) +
    (health.momentum * w.momentum)
  );
}

export async function processEvent(eventId: string) {
    try {
        const event = await prisma.eventLog.findUnique({
            where: { id: eventId },
            include: { user: { include: { strategicDna: true, systemHealth: true } } }
        });

        if (!event || !event.user) return null;

        const user = event.user;
        let dna = user.strategicDna;
        let health = user.systemHealth;

        // Initialize if missing
        if (!dna) {
            dna = await prisma.strategicDNA.create({
                data: { ...INITIAL_DNA, userId: user.id }
            });
        }
        if (!health) {
            health = await prisma.systemHealth.create({
                data: { ...INITIAL_HEALTH, userId: user.id }
            });
        }

        let dnaChanged = false;
        let healthChanged = false;
        let changeReason = '';
        let changeRecommendation = '';
        let mode = user.strategicMode || 'equilibrado';

        // Handle Mode Change specifically to update user preference
        if (event.eventType === 'mode.changed') {
            const meta = JSON.parse(event.metadata || '{}');
            if (meta.newMode) {
                mode = meta.newMode;
                await prisma.user.update({
                    where: { id: user.id },
                    data: { strategicMode: mode }
                });
            }
        }

        // Logic Engine
        if (event.eventType === 'risk.escalated') {
            const penalty = mode === 'conservador' ? 15 : 10;
            health.activeRisksSeverity = Math.max(0, health.activeRisksSeverity - penalty);
            healthChanged = true;
            changeReason = 'Risco crítico escalado impactou severidade.';
            changeRecommendation = 'Focar na mitigação imediata do risco.';
        } else if (event.eventType === 'risk.resolved') {
            health.activeRisksSeverity = Math.min(100, health.activeRisksSeverity + 10);
            dna.riskDiscipline = Math.min(100, dna.riskDiscipline + 5);
            healthChanged = true;
            dnaChanged = true;
            changeReason = 'Resolução de risco melhorou estabilidade.';
            changeRecommendation = 'Manter disciplina de monitoramento.';
        } else if (event.eventType === 'task.overdue') {
            dna.executionDiscipline = Math.max(0, dna.executionDiscipline - 5);
            health.executionStability = Math.max(0, health.executionStability - 8);
            healthChanged = true;
            dnaChanged = true;
            changeReason = 'Atraso em tarefa crítica reduziu disciplina de execução.';
            changeRecommendation = 'Renegociar prazos ou desbloquear impedimentos.';
        } else if (event.eventType === 'task.completed') {
            dna.executionDiscipline = Math.min(100, dna.executionDiscipline + 1);
            health.momentum = Math.min(100, health.momentum + 2);
            healthChanged = true;
            dnaChanged = true;
        } else if (event.eventType === 'mode.changed') {
            // Just recalculate health based on new mode
            healthChanged = true;
            changeReason = 'Alteração de modo reponderou os riscos.';
            changeRecommendation = 'Verificar novos alertas prioritários.';
        }

        const updates = [];

        // Recalculate Scores
        if (dnaChanged) {
            const oldScore = dna.overallScore;
            dna.overallScore = calculateDnaScore(dna);
            await prisma.strategicDNA.update({
                where: { id: dna.id },
                data: {
                    riskDiscipline: dna.riskDiscipline,
                    executionDiscipline: dna.executionDiscipline,
                    overallScore: dna.overallScore,
                    lastUpdated: new Date()
                }
            });

            if (Math.abs(dna.overallScore - oldScore) >= 1) {
                 updates.push({
                     type: 'dna_update',
                     scoreBefore: oldScore,
                     scoreAfter: dna.overallScore,
                     reason: changeReason || 'Recálculo automático de métricas.',
                     recommendation: changeRecommendation || 'Revisar pilares estratégicos.'
                 });
            }
        }

        if (healthChanged) {
            const oldScore = health.overallScore;
            health.overallScore = calculateHealthScore(health, mode);
            await prisma.systemHealth.update({
                where: { id: health.id },
                data: {
                    activeRisksSeverity: health.activeRisksSeverity,
                    executionStability: health.executionStability,
                    momentum: health.momentum,
                    overallScore: health.overallScore,
                    lastUpdated: new Date()
                }
            });

            if (Math.abs(health.overallScore - oldScore) >= 1) {
                 updates.push({
                     type: 'health_update',
                     scoreBefore: oldScore,
                     scoreAfter: health.overallScore,
                     reason: changeReason || 'Recálculo automático de saúde.',
                     recommendation: changeRecommendation || 'Verificar painel de status.'
                 });
            }
        }
        
        return updates.length > 0 ? updates : null;
    } catch (error) {
        console.error('Error in processEvent:', error);
        return null;
    }
}
