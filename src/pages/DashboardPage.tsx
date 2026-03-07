import { useMemo, useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useApp } from '../contexts/AppContext';
import { useUpgrade } from '../contexts/UpgradeContext';
import { DecisionEditModal } from '../components/DecisionEditModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { SimulationDrawer } from '../components/SimulationDrawer';
import { UpgradeSimulationModal } from '../components/UpgradeSimulationModal';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { AnimatedPage } from '../components/AnimatedPage';
import { staggerContainer, staggerChild, cardHover, buttonPrimary } from '../lib/motion';
import { Zap, Lock } from 'lucide-react';

interface PriorityItem {
  id: string;
  title: string;
  description: string;
  type: 'decision' | 'plan' | 'alert';
  rawScores: {
    impact: number;
    risk: number;
    urgency: number;
    blocking: number;
  };
  context?: string;
  actionLabel?: string;
  priorityLabel?: 'Crítica' | 'Alta' | 'Média' | 'Baixa';
  priorityColor?: string;
}

export default function DashboardPage() {
  const { mode, setMode } = useStrategicMode();
  const { user, decisions, risks, plans, isLoading, hasCompletedOnboarding, completeOnboarding } = useApp();
  const { checkUpgradeTriggers } = useUpgrade();
  const navigate = useNavigate();
  const [editingDecision, setEditingDecision] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSimulationClick = () => {
    // Debug log
    console.log('User plan:', user?.plan, 'Type:', typeof user?.plan);

    // Verificação case-insensitive e normalizada
    const userPlan = (user?.plan || '').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const hasStrategicPlan = userPlan === 'estrategico';

    if (hasStrategicPlan) {
      setShowSimulation(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const getItemRoute = (type: PriorityItem['type']) => {
    if (type === 'decision') return '/app/agent/decision';
    if (type === 'plan') return '/app/plans';
    return '/app/risks';
  };

  useEffect(() => {
    checkUpgradeTriggers();
  }, []);

  // Só mostrar o onboarding após o término do carregamento dos dados
  useEffect(() => {
    if (!isLoading) {
      setShowOnboarding(!hasCompletedOnboarding);
    }
  }, [hasCompletedOnboarding, isLoading]);

  const handleOnboardingComplete = async (data: { objective: string; mode: 'conservador' | 'equilibrado' | 'expansao' }) => {
    try {
      await completeOnboarding(data.objective, data.mode);
      setMode(data.mode);
      setShowOnboarding(false);
      toast.success('🎯 Seu perfil estratégico foi configurado!');
    } catch (error) {
      toast.error('Erro ao completar onboarding');
      console.error(error);
    }
  };

  // Transform AppContext data into PriorityItems
  const items: PriorityItem[] = useMemo(() => {
    const priorityItems: PriorityItem[] = [];

    // Map Decisions
    decisions.forEach(d => {
      if (d.status === 'analyzing' || d.status === 'draft') {
        priorityItems.push({
          id: d.id,
          title: d.title,
          description: d.summary,
          type: 'decision',
          rawScores: {
            impact: d.impactScore,
            risk: d.riskLevel === 'high' ? 90 : d.riskLevel === 'medium' ? 50 : 20,
            urgency: 80, // Mock urgency
            blocking: 50 // Mock blocking
          },
          priorityLabel: d.riskLevel === 'high' ? 'Alta' : d.riskLevel === 'medium' ? 'Média' : 'Baixa',
          priorityColor: d.riskLevel === 'high'
            ? 'text-[var(--status-warning)] bg-[var(--status-warning-bg)] border-[var(--status-warning)]/20'
            : 'text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-[var(--border-color)]'
        });
      }
    });

    // Map Risks
    risks.forEach(r => {
      if (r.status === 'active' || r.status === 'monitoring') {
        priorityItems.push({
          id: r.id,
          title: r.title,
          description: `Risco de origem: ${r.origin}`,
          type: 'alert',
          rawScores: {
            impact: r.level === 'high' ? 90 : 50,
            risk: r.level === 'high' ? 90 : 50,
            urgency: r.level === 'high' ? 90 : 50,
            blocking: 20
          },
          priorityLabel: r.level === 'high' ? 'Crítica' : r.level === 'medium' ? 'Alta' : 'Média',
          priorityColor: r.level === 'high'
            ? 'text-[var(--status-error)] bg-[var(--status-error-bg)] border-[var(--status-error)]/20'
            : 'text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-[var(--border-color)]'
        });
      }
    });

    // Map Plans
    plans.forEach(p => {
      if (p.status === 'active' || p.status === 'at_risk') {
        priorityItems.push({
          id: p.id,
          title: p.title,
          description: p.objective,
          type: 'plan',
          rawScores: {
            impact: p.priority === 'high' ? 85 : 50,
            risk: p.status === 'at_risk' ? 80 : 30,
            urgency: 60,
            blocking: 30
          },
          priorityLabel: p.priority === 'high' ? 'Alta' : 'Média',
          priorityColor: 'text-[var(--status-info)] bg-[var(--status-info-bg)] border-[var(--status-info)]/20'
        });
      }
    });

    return priorityItems;
  }, [decisions, risks, plans]);

  const sortedItems = useMemo(() => {
    let weights = { impact: 0.35, risk: 0.25, urgency: 0.20, blocking: 0.20 };

    if (mode === 'conservador') {
      weights = { impact: 0.25, risk: 0.35, urgency: 0.20, blocking: 0.20 };
    } else if (mode === 'expansao') {
      weights = { impact: 0.40, risk: 0.15, urgency: 0.25, blocking: 0.20 };
    }

    return [...items].sort((a, b) => {
      const scoreA =
        a.rawScores.impact * weights.impact +
        a.rawScores.risk * weights.risk +
        a.rawScores.urgency * weights.urgency +
        a.rawScores.blocking * weights.blocking;

      const scoreB =
        b.rawScores.impact * weights.impact +
        b.rawScores.risk * weights.risk +
        b.rawScores.urgency * weights.urgency +
        b.rawScores.blocking * weights.blocking;

      return scoreB - scoreA;
    });
  }, [items, mode]);

  const mainItem = sortedItems[0];
  const nextItems = sortedItems.slice(1, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent-color)] animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm">Carregando suas prioridades...</p>
        </div>
      </div>
    );
  }

  if (!mainItem) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="p-4 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <Icons.CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Tudo em dia!</h2>
        <p className="text-[var(--text-secondary)] max-w-md">Não há decisões pendentes ou riscos críticos no momento.</p>
        <Link to="/app/agent/decision" className="btn-primary px-8">
          Nova Análise
        </Link>
      </div>
    );
  }

  return (
    <AnimatedPage className="section-spacing pb-12 max-w-5xl mx-auto relative">

      {/* Floating Simulation Button */}
      <div className="fixed bottom-8 right-8 z-30">
        <motion.button
          onClick={handleSimulationClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`p-4 rounded-full text-white transition-all duration-300 flex items-center justify-center group shadow-lg ${(user?.plan?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'estrategico')
            ? 'bg-[var(--accent-color)] hover:brightness-110 shadow-[var(--accent-color)]/50'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] shadow-black/20'
            }`}
          title={(user?.plan?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'estrategico') ? 'Simular Cenário Estratégico' : 'Disponível no plano Estratégico'}
        >
          {(user?.plan?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'estrategico') ? (
            <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Strategic Objective Banner - if exists */}
      {user?.objective && (
        <motion.div
          {...staggerChild}
          className="mb-8 p-6 bg-gradient-to-r from-[var(--status-info-bg)] via-[var(--status-info-bg)]/5 to-transparent border border-[var(--status-info)]/20 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--status-info-bg)] rounded-lg">
              <Icons.Target className="w-5 h-5 text-[var(--status-info)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[var(--status-info)] uppercase tracking-wider mb-1">
                Seu Objetivo Estratégico
              </h3>
              <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {user.objective}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 1. FOCO ESTRATÉGICO (Dominante) */}
      <motion.section
        {...staggerChild}
        className="card-standard p-10 relative overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40 text-center group transition-all duration-500"
        style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-[var(--accent-color)]/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500" key={mainItem.id}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--status-info-bg)] border border-[var(--status-info)]/20 text-[var(--status-info)] text-xs font-bold uppercase tracking-widest mb-6">
            <Icons.Crosshair className="w-3 h-3" />
            Foco Agora
          </div>

          <h1 style={{ color: 'var(--text-primary)' }}>
            {mainItem.title}
          </h1>

          <p className="text-xl opacity-60 font-light leading-relaxed mb-10 max-w-2xl mt-4" style={{ color: 'var(--text-primary)' }}>
            {mainItem.description}
          </p>

          <motion.button
            {...buttonPrimary}
            className="btn-primary px-10"
            onClick={() => navigate(getItemRoute(mainItem.type))}
          >
            <Icons.Zap className="w-5 h-5" />
            {mainItem.actionLabel || 'Resolver Agora'}
          </motion.button>
        </div>
      </motion.section>

      {/* 2. PRÓXIMAS PRIORIDADES (Lista Minimalista) */}
      <motion.section
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        <h3 className="opacity-50 uppercase tracking-widest px-2" style={{ color: 'var(--text-secondary)' }}>A seguir</h3>
        <div className="card-standard p-0 overflow-hidden divide-y" style={{ borderColor: 'var(--border-color)', divideColor: 'var(--border-color)' }}>
          {nextItems.map((item, index) => (
            <motion.div
              key={item.id}
              {...cardHover}
              className="p-5 flex items-center justify-between group hover:bg-[var(--nav-hover)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="opacity-40 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>0{index + 1}</span>
                <span className="font-medium group-hover:text-[var(--accent-color)] transition-colors" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-xs font-medium px-2 py-1 rounded border ${item.priorityColor || 'text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}>
                  {item.priorityLabel || 'Normal'}
                </span>
                <Link to={getItemRoute(item.type)} className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors">
                  <Icons.ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* 3. MOMENTO ESTRATÉGICO (Visual Sofisticado) */}
        <motion.section
          {...staggerChild}
          {...cardHover}
          className="card-standard flex flex-col justify-between"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Icons.Activity className="w-4 h-4 text-[var(--status-success)]" />
              <h3 className="opacity-50 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Momento Estratégico</h3>
            </div>
            <h2 className="mb-2" style={{ color: 'var(--text-primary)' }}>
              {mode === 'expansao' ? 'Aceleração Máxima' : mode === 'conservador' ? 'Proteção de Caixa' : 'Fase de Expansão'}
            </h2>
            <p className="text-sm opacity-60 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {mode === 'expansao'
                ? 'Foco total em crescimento. Riscos calculados são aceitáveis para maximizar market share.'
                : mode === 'conservador'
                  ? 'Prioridade é mitigação de riscos e eficiência operacional. Evitar grandes apostas.'
                  : 'Sua coerência estratégica está alta (85%). O padrão de decisões recentes mostra uma transição clara para "Agressivo".'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              {mode === 'expansao' ? 'Alto Crescimento' : 'Risco Controlado'}
            </div>
            <div className="px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Execução Estável</div>
          </div>
        </motion.section>

        {/* 4. MOVIMENTO DE EXECUÇÃO */}
        <motion.section
          {...staggerChild}
          {...cardHover}
          className="card-standard"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Icons.Layers className="w-4 h-4 text-[var(--status-info)]" />
              <h3 className="opacity-50 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Execução</h3>
            </div>
            <Link to="/app/plans" className="text-xs text-[var(--status-info)] hover:opacity-80 flex items-center gap-1 font-medium transition-colors">
              Ver Planos <Icons.ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{plans.filter(p => p.status === 'active').length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: 'var(--text-secondary)' }}>Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{plans.filter(p => p.status === 'at_risk').length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: 'var(--text-secondary)' }}>Em Risco</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>15d</div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: 'var(--text-secondary)' }}>Marco</div>
            </div>
          </div>
        </motion.section>

      </div>

      <motion.section
        {...staggerChild}
        className="pt-8 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h3 className="opacity-50 uppercase tracking-widest mb-4 px-2" style={{ color: 'var(--text-secondary)' }}>Outros Alertas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {risks.slice(0, 3).map(risk => (
            <div key={risk.id} className="p-4 rounded-xl border transition-colors flex items-start gap-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${risk.level === 'high' ? 'bg-[var(--status-error)]' : 'bg-[var(--status-warning)]'}`}></div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{risk.title}</p>
                <p className="text-xs opacity-60 truncate" style={{ color: 'var(--text-secondary)' }}>{risk.origin}</p>
              </div>
            </div>
          ))}
          <Link to="/app/risks" className="p-4 rounded-xl border flex items-center justify-center text-xs transition-colors hover:bg-[var(--nav-hover)] cursor-pointer" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            Ver todos os alertas
          </Link>
        </div>
      </motion.section>

      {/* Decision Edit Modal */}
      {editingDecision && (
        <DecisionEditModal
          suggestion={editingDecision}
          onClose={() => setEditingDecision(null)}
          onSave={() => { }}
        />
      )}

      {/* Simulation Drawer */}
      <SimulationDrawer
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        risksList={risks.map(r => ({ id: r.id, title: r.title }))}
        tasksList={decisions.map(d => ({ id: d.id, title: d.title }))}
        plansList={plans.map(p => ({ id: p.id, title: p.title }))}
      />

      {/* Upgrade Simulation Modal */}
      <UpgradeSimulationModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

    </AnimatedPage>
  );
}
