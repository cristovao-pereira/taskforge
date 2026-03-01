
import { Decision, Risk, ExecutionPlan, StrategicSession, User } from '../types';

// Mock Data
let MOCK_USER: User = {
  id: 'u1',
  name: 'Alexandre',
  email: 'alexandre@example.com',
  company: 'TechFlow Solutions',
  role: 'CTO',
  objective: 'Escalar a operação técnica para suportar o crescimento de 3x em 12 meses.',
  preferences: {
    strategicMode: 'balanced',
    deepMode: true,
    alertSensitivity: 'normal',
  },
};

const MOCK_DECISIONS: Decision[] = [
  { 
    id: 'd1', 
    title: 'Pivotar para Modelo de Vendas Enterprise', 
    date: '2025-10-24', 
    status: 'analyzing', 
    riskLevel: 'high', 
    impactScore: 92, 
    type: 'Strategy', 
    summary: 'Mudança estratégica para focar em grandes contas.',
    outcome: 'Pending'
  },
  { 
    id: 'd2', 
    title: 'Contratar Head de Engenharia', 
    date: '2025-09-12', 
    status: 'implemented', 
    riskLevel: 'medium', 
    impactScore: 85, 
    type: 'Hiring', 
    summary: 'Contratação chave para escalar o time técnico.',
    outcome: 'Positive'
  },
  { 
    id: 'd3', 
    title: 'Aumentar Preços SaaS em 20%', 
    date: '2025-08-05', 
    status: 'implemented', 
    riskLevel: 'high', 
    impactScore: 78, 
    type: 'Pricing', 
    summary: 'Ajuste de preços para melhorar margens.',
    outcome: 'Negative'
  },
  { 
    id: 'd4', 
    title: 'Lançar MVP do App Mobile', 
    date: '2025-07-15', 
    status: 'implemented', 
    riskLevel: 'low', 
    impactScore: 65, 
    type: 'Product', 
    summary: 'Lançamento do MVP mobile para validação.',
    outcome: 'Positive'
  },
  { 
    id: 'd5', 
    title: 'Expandir para Mercado Europeu', 
    date: '2025-06-01', 
    status: 'analyzing', 
    riskLevel: 'medium', 
    impactScore: 70, 
    type: 'Growth', 
    summary: 'Exploração de novos mercados geográficos.',
    outcome: 'Pending'
  },
];

const MOCK_RISKS: Risk[] = [
  { id: 'r1', title: 'Dependência crítica de contratação atrasada', type: 'dependency', origin: 'Execution Plans', relatedItem: 'Enterprise Sales Transition', level: 'high', date: '2025-10-26', status: 'active' },
  { id: 'r2', title: 'Suposição de CAC não validada em canais pagos', type: 'strategic', origin: 'DecisionForge', relatedItem: 'Q4 Marketing Rollout', level: 'medium', date: '2025-10-23', status: 'monitoring' },
  { id: 'r3', title: 'Conflito de recursos entre Product e Marketing', type: 'execution', origin: 'Execution Plans', relatedItem: 'Mobile App MVP', level: 'low', date: '2025-10-28', status: 'active' },
];

const MOCK_PLANS: ExecutionPlan[] = [
  {
    id: 'p1',
    title: 'Lançamento de Marketing Q4',
    origin: 'ClarityForge',
    date: '2025-10-20',
    status: 'active',
    progress: 35,
    priority: 'high',
    objective: 'Expandir a presença da marca nos canais digitais e aumentar a geração de leads qualificados em 25% até o final do trimestre.',
    timeline: '20 Out - 15 Dez',
    phases: [
      {
        name: 'Fase 1 — Pesquisa e Configuração',
        tasks: [
          { id: 't1', text: 'Auditar desempenho atual das redes sociais', completed: true, assignee: 'Você', deadline: '22 Out' },
          { id: 't2', text: 'Definir segmentos de público-alvo', completed: true, assignee: 'Você', deadline: '25 Out' },
          { id: 't3', text: 'Configurar pixels de rastreamento e analytics', completed: false, assignee: 'Time Dev', deadline: '28 Out' },
        ]
      },
      {
        name: 'Fase 2 — Produção de Conteúdo',
        tasks: [
          { id: 't4', text: 'Rascunhar série de posts para blog (4 artigos)', completed: false, assignee: 'Redator', deadline: '05 Nov' },
          { id: 't5', text: 'Criar peças publicitárias para LinkedIn', completed: false, assignee: 'Designer', deadline: '10 Nov' },
        ]
      },
      {
        name: 'Fase 3 — Lançamento e Otimização',
        tasks: [
          { id: 't6', text: 'Lançar campanha', completed: false, assignee: 'Você', deadline: '15 Nov' },
          { id: 't7', text: 'Revisão semanal de desempenho', completed: false, assignee: 'Você', deadline: '22 Nov' },
        ]
      }
    ],
    intelligence: {
      risks: ['Estouro de orçamento devido a CPC alto', 'Fadiga criativa'],
      dependencies: ['Aprovação de assets de design', 'Otimização de landing page'],
      impact: 'Alto potencial de receita',
      confidence: 85,
      rationale: 'Com base na sessão de clareza, focar em crescimento orgânico é muito lento. Aquisição paga é necessária para atingir as metas do Q4.'
    }
  },
  {
    id: 'p2',
    title: 'Transição para Vendas Enterprise',
    origin: 'DecisionForge',
    date: '2025-09-15',
    status: 'at_risk',
    progress: 60,
    priority: 'high',
    objective: 'Transição de PLG para um modelo liderado por vendas para contas enterprise visando aumentar o ACV.',
    timeline: '15 Set - 30 Nov',
    phases: [
      {
        name: 'Fase 1 — Fundação',
        tasks: [
          { id: 't1', text: 'Definir ICP Enterprise', completed: true, assignee: 'Você', deadline: '20 Set' },
          { id: 't2', text: 'Criar deck de vendas', completed: true, assignee: 'Você', deadline: '25 Set' },
        ]
      },
      {
        name: 'Fase 2 — Prospecção',
        tasks: [
          { id: 't3', text: 'Construir lista de leads (100 contatos)', completed: true, assignee: 'SDR', deadline: '05 Out' },
          { id: 't4', text: 'Iniciar sequência de prospecção fria', completed: false, assignee: 'SDR', deadline: '10 Out' },
        ]
      }
    ],
    intelligence: {
      risks: ['Ciclos de vendas mais longos afetando fluxo de caixa', 'Falta de funcionalidades enterprise'],
      dependencies: ['Contratação de vendas', 'Alinhamento do roadmap de produto'],
      impact: 'Mudança estratégica',
      confidence: 70,
      rationale: 'Análise do DecisionForge indicou alto churn no segmento SMB. Subir de mercado é crítico para a sustentabilidade.'
    }
  },
  {
    id: 'p3',
    title: 'Lançamento de Produto Q3',
    origin: 'LeverageForge',
    date: '2025-07-01',
    status: 'completed',
    progress: 100,
    priority: 'medium',
    objective: 'Lançar funcionalidades da v2.0 para base de usuários existente.',
    timeline: '01 Jul - 15 Ago',
    phases: [],
    intelligence: {
      risks: [],
      dependencies: [],
      impact: 'Aumento de retenção',
      confidence: 90
    }
  }
];

const MOCK_SESSIONS: StrategicSession[] = [
  { id: 's1', title: 'Revisão de Estratégia de Marketing Q4', module: 'ClarityForge', mode: 'deep', date: '2025-10-28', status: 'active', summary: 'Analisando eficácia de canais.', progress: 65 },
  { id: 's2', title: 'Viabilidade do Pivô Enterprise', module: 'DecisionForge', mode: 'deep', date: '2025-10-24', status: 'completed', summary: 'Potencial de LTV alto validado.' },
];

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service Methods
export const mockService = {
  // User
  getUser: async (): Promise<User> => {
    await delay(300);
    return MOCK_USER;
  },
  updateUser: async (user: Partial<User>): Promise<User> => {
    await delay(500);
    MOCK_USER = { ...MOCK_USER, ...user };
    return MOCK_USER;
  },

  // Decisions
  getDecisions: async (): Promise<Decision[]> => {
    await delay(400);
    return [...MOCK_DECISIONS];
  },
  createDecision: async (decision: Omit<Decision, 'id' | 'date'>): Promise<Decision> => {
    await delay(600);
    const newDecision: Decision = {
      ...decision,
      id: `d${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    MOCK_DECISIONS.unshift(newDecision);
    return newDecision;
  },

  // Risks
  getRisks: async (): Promise<Risk[]> => {
    await delay(300);
    return [...MOCK_RISKS];
  },
  resolveRisk: async (id: string): Promise<void> => {
    await delay(500);
    const index = MOCK_RISKS.findIndex(r => r.id === id);
    if (index !== -1) {
      MOCK_RISKS[index].status = 'resolved';
    }
  },

  // Plans
  getPlans: async (): Promise<ExecutionPlan[]> => {
    await delay(400);
    return [...MOCK_PLANS];
  },

  // Sessions
  getSessions: async (): Promise<StrategicSession[]> => {
    await delay(300);
    return [...MOCK_SESSIONS];
  },
};
