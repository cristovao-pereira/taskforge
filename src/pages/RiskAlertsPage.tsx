import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { AnimatedPage } from '../components/AnimatedPage';
import { cardHover } from '../lib/motion';
import { useStrategicMode } from '../contexts/StrategicContext';
import { getStrategicRules } from '../utils/strategicRules';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

interface Insight {
  id: string;
  text: string;
  type: 'warning' | 'info' | 'success';
}

interface HistoryItem {
  id: string;
  title: string;
  relatedItem: string;
  resolvedDate: string;
  impact: string;
}

export default function RiskAlertsPage() {
  const navigate = useNavigate();
  const { mode, getModeLabel, getModeColor } = useStrategicMode();
  const rules = getStrategicRules(mode);
  const { risks, resolveRisk, isLoading } = useApp();
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const activeRisks = useMemo(() => risks.filter(r => r.status === 'active' || r.status === 'monitoring'), [risks]);
  const visibleRisks = useMemo(() => {
    if (riskFilter === 'all') return activeRisks;
    return activeRisks.filter((risk) => risk.level === riskFilter);
  }, [activeRisks, riskFilter]);
  const criticalRisks = useMemo(() => activeRisks.filter(r => r.level === 'high'), [activeRisks]);
  
  const handleResolve = async (id: string) => {
    toast.promise(resolveRisk(id), {
      loading: 'Resolvendo...',
      success: 'Risco resolvido!',
      error: 'Erro ao resolver'
    });
  };

  const insights: Insight[] = [
    { id: '1', text: 'Reavaliar suposição identificada na sessão Enterprise Pivot', type: 'warning' },
    { id: '2', text: 'Antecipar fase Implementation para reduzir risco de mercado', type: 'info' },
    { id: '3', text: 'Agendar nova Strategic Session para revisar cenário atual', type: 'info' }
  ];

  const history: HistoryItem[] = [
    {
      id: '1',
      title: 'Risco de churn por aumento de preço',
      relatedItem: 'SaaS Pricing Model',
      resolvedDate: 'Oct 15, 2025',
      impact: 'Mitigado via comunicação antecipada'
    },
    {
      id: '2',
      title: 'Falta de redundância técnica',
      relatedItem: 'Infrastructure Upgrade',
      resolvedDate: 'Sep 30, 2025',
      impact: 'Contratação de DevOps freelancer'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-red-500 animate-spin"></div>
          <p className="text-zinc-500 text-sm">Analisando riscos...</p>
        </div>
      </div>
    );
  }

  return (
     <AnimatedPage className="max-w-5xl mx-auto section-spacing pb-20">
      
      {/* Header */}
      <header className="space-y-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-orange-500/5 relative">
                  <Icons.ShieldAlert className="w-6 h-6 text-orange-500" />
                  <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-zinc-900 ${getModeColor().replace('text-', 'bg-').replace('border-', '')}`}></div>
                </div>
                Alertas de Risco
              </h1>
            </div>
            
            <p className="text-xl text-zinc-400 font-light max-w-2xl">
              Antecipe riscos antes que eles virem problemas.
            </p>
            <p className="text-sm text-zinc-500 max-w-lg leading-relaxed">
              Monitoramento estratégico contínuo baseado nas suas Sessões Estratégicas e Planos de Execução.
            </p>
          </div>

          {/* Strategic Focus Alert */}
          <div className="max-w-xs w-full card-standard flex items-start gap-3">
              <div className="p-2 bg-zinc-800 rounded shrink-0 mt-0.5">
                  <Icons.Target className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Foco do Modo {getModeLabel()}</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{rules.riskFocus}</p>
              </div>
          </div>
        </div>
      </header>

      {/* Section 1: Risk Overview */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard label="Saúde Geral" value="78%" icon={Icons.Activity} color="text-emerald-500" />
        <OverviewCard label="Riscos Ativos" value={activeRisks.length.toString()} icon={Icons.AlertOctagon} color="text-white" />
        <OverviewCard label="Exigem Atenção" value={criticalRisks.length.toString()} icon={Icons.AlertTriangle} color="text-orange-500" />
        <OverviewCard label="Tendência" value="Diminuindo" icon={Icons.TrendingUp} color="text-emerald-500" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Active Alerts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Icons.Bell className="w-4 h-4" />
              Alertas Ativos
            </h2>
            <button
              onClick={() => setRiskFilter((current) => current === 'all' ? 'high' : current === 'high' ? 'medium' : current === 'medium' ? 'low' : 'all')}
              className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Icons.Filter className="w-3 h-3" /> Filtrar: {riskFilter === 'all' ? 'Todos' : riskFilter === 'high' ? 'Alto' : riskFilter === 'medium' ? 'Médio' : 'Baixo'}
            </button>
          </div>

          <div className="space-y-4">
            {visibleRisks.length === 0 ? (
               <div className="p-8 text-center border border-zinc-800 rounded-xl bg-zinc-900/30">
                 <Icons.CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                 <p className="text-zinc-400">Nenhum risco ativo detectado.</p>
               </div>
            ) : (
              visibleRisks.map((risk) => (
                <RiskCard
                  key={risk.id}
                  risk={risk}
                  onResolve={() => handleResolve(risk.id)}
                  onViewPlan={() => navigate('/app/plans')}
                  onAdjust={() => navigate('/app/agent/decision')}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Insights & History */}
        <div className="space-y-8">
          
          {/* Insights */}
          <section className="card-standard">
            <div className="flex items-center gap-2 mb-6">
              <Icons.Sparkles className="w-4 h-4 text-blue-500" />
              <h2 className="text-zinc-300 uppercase tracking-widest">Sugestões</h2>
            </div>
            
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/50 text-xs text-zinc-300 leading-relaxed hover:border-zinc-700 transition-colors cursor-default">
                  {insight.text}
                </div>
              ))}
            </div>
          </section>

          {/* History */}
          <section className="space-y-4">
            <h2 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
              <Icons.History className="w-4 h-4" />
              Resolvidos
            </h2>
            <div className="card-standard divide-y divide-zinc-800/50">
              {history.map((item) => (
                <div key={item.id} className="p-4 hover:bg-zinc-900/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium text-zinc-300">{item.title}</h4>
                    <span className="text-[10px] text-zinc-600">{item.resolvedDate}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mb-2">{item.relatedItem}</div>
                  <div className="text-xs text-emerald-500/80 flex items-center gap-1">
                    <Icons.CheckCircle className="w-3 h-3" />
                    {item.impact}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center space-y-8 pt-12 border-t border-zinc-900">
        <div className="space-y-2">
          <p className="text-xl font-serif italic text-zinc-300">"Risco identificado cedo é vantagem competitiva."</p>
        </div>
        
        <button className="btn-primary mx-auto px-6" onClick={() => navigate('/app/sessions')}>
          <Icons.Brain className="w-4 h-4" />
          Iniciar Nova Strategic Session
        </button>
      </footer>

    </AnimatedPage>
  );
}

function OverviewCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="card-standard flex flex-col items-center justify-center text-center gap-2">
      <Icon className={`w-5 h-5 ${color} opacity-80`} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <h4 className="text-zinc-500 uppercase tracking-wider">{label}</h4>
    </div>
  )
}

const RiskCard: React.FC<{ risk: any, onResolve: () => void, onViewPlan: () => void, onAdjust: () => void }> = ({ risk, onResolve, onViewPlan, onAdjust }) => {
  const isCritical = risk.level === 'high';

  return (
    <div className={`card-standard group ${
      isCritical ? 'border-orange-500/20 shadow-lg shadow-orange-500/5' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              risk.type === 'strategic' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
              risk.type === 'execution' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
              risk.type === 'dependency' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
              'text-zinc-400 bg-zinc-800 border-zinc-700'
            }`}>
              {risk.type === 'strategic' ? 'Estratégico' : risk.type === 'execution' ? 'Execução' : risk.type === 'dependency' ? 'Dependência' : 'Prazo'}
            </span>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Icons.Layers className="w-3 h-3" />
              {risk.origin}
            </span>
          </div>
          <h3 className="group-hover:text-blue-400 transition-colors">{risk.title}</h3>
        </div>
        
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border ${
          risk.level === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
          risk.level === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          <Icons.AlertTriangle className="w-3 h-3" />
          {risk.level === 'high' ? 'Alto' : risk.level === 'medium' ? 'Moderado' : 'Baixo'}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
        <span className="text-zinc-400">Relacionado a:</span>
        <span className="text-zinc-300 font-medium">{risk.relatedItem}</span>
        <span className="mx-1">•</span>
        <span>{risk.date}</span>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/50">
        <button onClick={onViewPlan} className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded hover:bg-zinc-800">
          <Icons.Eye className="w-3.5 h-3.5" />
          Ver Plano
        </button>
        <button onClick={onAdjust} className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded hover:bg-zinc-800">
          <Icons.Edit2 className="w-3.5 h-3.5" />
          Ajustar
        </button>
        <button 
          onClick={onResolve}
          className="text-xs font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors ml-auto px-3 py-1.5 rounded hover:bg-emerald-500/10"
        >
          <Icons.CheckCircle className="w-3.5 h-3.5" />
          Resolver
        </button>
      </div>
    </div>
  );
}
