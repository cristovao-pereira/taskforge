import { useMemo, useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useApp } from '../contexts/AppContext';
import { useUpgrade } from '../contexts/UpgradeContext';
import { DecisionEditModal } from '../components/DecisionEditModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { SimulationDrawer } from '../components/SimulationDrawer';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { AnimatedPage } from '../components/AnimatedPage';
import { staggerContainer, staggerChild, cardHover, buttonPrimary } from '../lib/motion';
import { Zap } from 'lucide-react';

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

  const getItemRoute = (type: PriorityItem['type']) => {
    if (type === 'decision') return '/app/agent/decision';
    if (type === 'plan') return '/app/plans';
    return '/app/risks';
  };

  useEffect(() => {
    checkUpgradeTriggers();
  }, []);

  useEffect(() => {
    setShowOnboarding(!hasCompletedOnboarding);
  }, [hasCompletedOnboarding]);

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
            ? 'text-orange-400 bg-orange-500/5 border-orange-500/10' 
            : 'text-yellow-500 bg-yellow-500/5 border-yellow-500/10'
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
            ? 'text-red-400 bg-red-500/10 border-red-500/20' 
            : 'text-zinc-500 bg-zinc-800/50 border-zinc-700/50'
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
          priorityColor: 'text-blue-400 bg-blue-500/5 border-blue-500/10'
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
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-blue-500 animate-spin"></div>
          <p className="text-zinc-500 text-sm">Carregando suas prioridades...</p>
        </div>
      </div>
    );
  }

  if (!mainItem) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
          <Icons.CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Tudo em dia!</h2>
        <p className="text-zinc-500 max-w-md">Não há decisões pendentes ou riscos críticos no momento.</p>
        <Link to="/app/agent/decision" className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors">
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
          onClick={() => setShowSimulation(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-full shadow-lg shadow-blue-500/50 text-white transition-all duration-300 flex items-center justify-center group"
          title="Simular Cenário Estratégico"
        >
          <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </motion.button>
      </div>

      {/* Strategic Objective Banner - if exists */}
      {user?.objective && (
        <motion.div
          {...staggerChild}
          className="mb-8 p-6 bg-gradient-to-r from-blue-950/30 via-blue-900/20 to-transparent border border-blue-500/20 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Icons.Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-1">
                Seu Objetivo Estratégico
              </h3>
              <p className="text-base text-zinc-300 leading-relaxed">
                {user.objective}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 1. FOCO ESTRATÉGICO (Dominante) */}
        <motion.section 
          {...staggerChild}
          className="card-standard p-10 relative overflow-hidden shadow-2xl shadow-black/40 text-center group transition-all duration-500 bg-[#1e293b] border-zinc-800"
        >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500" key={mainItem.id}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Icons.Crosshair className="w-3 h-3" />
            Foco Agora
          </div>

          <h1>
            {mainItem.title}
          </h1>
          
          <p className="text-xl text-zinc-400 font-light leading-relaxed mb-10 max-w-2xl mt-4">
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
        <h3 className="text-zinc-500 uppercase tracking-widest px-2">A seguir</h3>
        <div className="card-standard divide-y divide-zinc-800/50">
            {nextItems.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  {...cardHover}
                  className="p-5 flex items-center justify-between group hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                      <span className="text-zinc-500 font-mono text-xs">0{index + 1}</span>
                      <span className="text-zinc-300 font-medium group-hover:text-blue-400 transition-colors">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-6">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${item.priorityColor || 'text-zinc-500 bg-zinc-800/50 border-zinc-700/50'}`}>
                        {item.priorityLabel || 'Normal'}
                      </span>
                        <Link to={getItemRoute(item.type)} className="text-zinc-600 hover:text-blue-400 transition-colors">
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
                    <Icons.Activity className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-zinc-300 uppercase tracking-widest">Momento Estratégico</h3>
                </div>
                <h2 className="mb-2">
                  {mode === 'expansao' ? 'Aceleração Máxima' : mode === 'conservador' ? 'Proteção de Caixa' : 'Fase de Expansão'}
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {mode === 'expansao' 
                    ? 'Foco total em crescimento. Riscos calculados são aceitáveis para maximizar market share.'
                    : mode === 'conservador'
                    ? 'Prioridade é mitigação de riscos e eficiência operacional. Evitar grandes apostas.'
                    : 'Sua coerência estratégica está alta (85%). O padrão de decisões recentes mostra uma transição clara para "Agressivo".'
                  }
                </p>
            </div>
            <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-zinc-950 rounded border border-zinc-800 text-xs text-zinc-400">
                  {mode === 'expansao' ? 'Alto Crescimento' : 'Risco Controlado'}
                </div>
                <div className="px-3 py-1.5 bg-zinc-950 rounded border border-zinc-800 text-xs text-zinc-400">Execução Estável</div>
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
                    <Icons.Layers className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-zinc-300 uppercase tracking-widest">Execução</h3>
                </div>
                <Link to="/app/plans" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                    Ver Planos <Icons.ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-3xl font-bold text-white mb-1">{plans.filter(p => p.status === 'active').length}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Ativos</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white mb-1">{plans.filter(p => p.status === 'at_risk').length}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Em Risco</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white mb-1">15d</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Marco</div>
                </div>
            </div>
            </motion.section>

      </div>

      {/* 5. ALERTAS SECUNDÁRIOS (Reduzidos/Silenciosos) */}
        <motion.section 
          {...staggerChild}
          className="pt-8 border-t border-zinc-800/50"
        >
        <h3 className="text-zinc-600 uppercase tracking-widest mb-4 px-2">Outros Alertas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {risks.slice(0, 3).map(risk => (
              <div key={risk.id} className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${risk.level === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                  <div>
                      <p className="text-sm text-zinc-300 font-medium mb-1">{risk.title}</p>
                      <p className="text-xs text-zinc-500 line-clamp-1">{risk.origin}</p>
                  </div>
              </div>
            ))}
            <Link to="/app/risks" className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors flex items-center justify-center text-zinc-500 text-xs hover:text-zinc-300 cursor-pointer">
                Ver todos os alertas
            </Link>
        </div>
            </motion.section>

      {/* Decision Edit Modal */}
      {editingDecision && (
          <DecisionEditModal 
              suggestion={editingDecision} 
              onClose={() => setEditingDecision(null)} 
              onSave={() => {}}
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

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      </AnimatedPage>
  );
}
