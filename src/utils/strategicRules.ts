import { StrategicMode } from '../contexts/StrategicContext';

interface StrategicRule {
  riskWeight: number;
  impactWeight: number;
  urgencyWeight: number;
  blockerWeight: number;
  executionParallelism: number; // Recommended max parallel initiatives
  alertSensitivity: 'high' | 'medium' | 'low';
  description: string;
  executionSuggestion: string;
  riskFocus: string;
}

export const STRATEGIC_RULES: Record<StrategicMode, StrategicRule> = {
  conservador: {
    riskWeight: 0.35,
    impactWeight: 0.25,
    urgencyWeight: 0.20,
    blockerWeight: 0.20,
    executionParallelism: 2,
    alertSensitivity: 'high',
    description: 'Controle de caixa e mitigação de riscos. Priorize estabilidade.',
    executionSuggestion: 'Reduza escopo, mitigue riscos e valide antes de escalar.',
    riskFocus: 'Ameaças à estabilidade operacional.'
  },
  equilibrado: {
    riskWeight: 0.25,
    impactWeight: 0.35,
    urgencyWeight: 0.20,
    blockerWeight: 0.20,
    executionParallelism: 3,
    alertSensitivity: 'medium',
    description: 'Equilíbrio entre crescimento e segurança. Ritmo sustentável.',
    executionSuggestion: 'Mantenha consistência e ritmo sustentável nas entregas.',
    riskFocus: 'Impactos no equilíbrio operacional.'
  },
  expansao: {
    riskWeight: 0.15,
    impactWeight: 0.40,
    urgencyWeight: 0.25,
    blockerWeight: 0.20,
    executionParallelism: 5,
    alertSensitivity: 'low',
    description: 'Crescimento e velocidade em primeiro lugar. Aceite riscos calculados.',
    executionSuggestion: 'Aumente cadência, antecipe tarefas de impacto e aceite trade-offs.',
    riskFocus: 'Bloqueios ao crescimento no curto prazo.'
  }
};

export function getStrategicRules(mode: StrategicMode): StrategicRule {
  return STRATEGIC_RULES[mode];
}
