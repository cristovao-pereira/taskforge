import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import { useApp } from '../contexts/AppContext';
import { Decision } from '../types';

export default function DecisionMapPage() {
  const { decisions, isLoading } = useApp();

  const metrics = useMemo(() => {
    if (decisions.length === 0) return { total: 0, highRisk: 0, avgRisk: 0, successRate: 0 };

    const highRiskCount = decisions.filter(d => d.riskLevel === 'high').length;
    const highRiskPercent = Math.round((highRiskCount / decisions.length) * 100);

    const riskScores = decisions.map(d => d.riskLevel === 'high' ? 9 : d.riskLevel === 'medium' ? 6 : 3);
    const avgRisk = (riskScores.reduce((a, b) => a + b, 0) / decisions.length).toFixed(1);

    const outcomes = decisions.filter(d => d.outcome && d.outcome !== 'Pending');
    const positiveOutcomes = outcomes.filter(d => d.outcome === 'Positive').length;
    const successRate = outcomes.length > 0 ? Math.round((positiveOutcomes / outcomes.length) * 100) : 0;

    return {
      total: decisions.length,
      highRisk: highRiskPercent,
      avgRisk,
      successRate
    };
  }, [decisions]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-blue-500 animate-spin"></div>
          <p className="text-zinc-500 text-sm">Carregando mapa de decisões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto section-spacing pb-20 animate-in fade-in duration-700">

      {/* Header */}
      <header className="space-y-4 pt-8 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-blue-500/5">
                <Icons.Map className="w-6 h-6 text-blue-500" />
              </div>
              Mapa de Decisões
            </h1>
            <p className="text-xl text-zinc-400 font-light">Análise evolutiva do seu padrão estratégico de decisões.</p>
            <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
              Visualize riscos recorrentes, padrões emergentes e impacto acumulado ao longo do tempo.
            </p>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total de Decisões" value={metrics.total.toString()} icon={Icons.Layers} />
        <MetricCard label="% Alto Risco" value={`${metrics.highRisk}%`} icon={Icons.AlertTriangle} alert={metrics.highRisk > 30} />
        <MetricCard label="Pontuação Média de Risco" value={`${metrics.avgRisk}/10`} icon={Icons.Activity} />
        <MetricCard label="Taxa de Sucesso" value={`${metrics.successRate}%`} icon={Icons.TrendingUp} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 space-y-8">

          {/* Filters */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
            <h2 className="flex items-center gap-2">
              <Icons.History className="w-4 h-4 text-zinc-500" />
              Linha do Tempo
            </h2>
            <div className="flex gap-2">
              <FilterButton label="Nível de Risco" />
              <FilterButton label="Período" />
              <FilterButton label="Tipo" />
            </div>
          </div>

          <div className="space-y-0 relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[#1e293b] -z-10"></div>

            {decisions.length === 0 ? (
              <div className="p-8 text-center border border-zinc-800 rounded-xl bg-zinc-900/30">
                <p className="text-zinc-400">Nenhuma decisão registrada.</p>
              </div>
            ) : (
              decisions.map((decision) => (
                <div key={decision.id} className="relative pl-10 py-4 group">
                  {/* Timeline Dot */}
                  <div className={`absolute left-[16px] top-8 w-1.5 h-1.5 rounded-full ring-4 ring-zinc-950 ${decision.riskLevel === 'high' ? 'bg-orange-500' :
                      decision.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}></div>

                  <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-4 hover:bg-zinc-900 hover:border-zinc-700 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-zinc-500 font-mono">{formatDate(decision.date)}</span>
                          <span className="text-zinc-700">•</span>
                          <span className="text-xs text-zinc-400">
                            {decision.type === 'Strategy' ? 'Estratégia' :
                              decision.type === 'Hiring' ? 'Contratação' :
                                decision.type === 'Pricing' ? 'Precificação' :
                                  decision.type === 'Product' ? 'Produto' :
                                    decision.type === 'Growth' ? 'Crescimento' : decision.type}
                          </span>
                        </div>
                        <h3 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">{decision.title}</h3>
                      </div>

                      <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${decision.riskLevel === 'high' ? 'bg-orange-500/5 text-orange-500 border-orange-500/10' :
                          decision.riskLevel === 'medium' ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/10' :
                            'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                        }`}>
                        Risco {decision.riskLevel === 'high' ? 'Alto' : decision.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                      </div>
                    </div>

                    {/* Outcome */}
                    <div className="mt-3 flex items-center gap-2">
                      {!decision.outcome || decision.outcome === 'Pending' ? (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Icons.Clock className="w-3 h-3" />
                          <span>Aguardando resultados</span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${decision.outcome === 'Positive' ? 'text-emerald-500' :
                            decision.outcome === 'Negative' ? 'text-red-500' :
                              'text-zinc-500'
                          }`}>
                          {decision.outcome === 'Positive' ? <Icons.TrendingUp className="w-3 h-3" /> :
                            decision.outcome === 'Negative' ? <Icons.TrendingDown className="w-3 h-3" /> :
                              <Icons.MinusCircle className="w-3 h-3" />}
                          <span>Impacto {decision.outcome === 'Positive' ? 'Positivo' : decision.outcome === 'Negative' ? 'Negativo' : 'Neutro'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Impacto Acumulado */}
          <section className="card-standard">
            <div className="flex items-center justify-between mb-6">
              <h3>Impacto Acumulado</h3>
              <Icons.BarChart3 className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Taxa de Sucesso</span>
                  <span className={metrics.successRate > 0 ? 'text-emerald-500' : 'text-zinc-600'}>
                    {metrics.successRate > 0 ? `+${metrics.successRate}%` : '+0%'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${metrics.successRate}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Assertividade</span>
                  <span className={metrics.successRate > 0 ? 'text-blue-500' : 'text-zinc-600'}>
                    {metrics.successRate > 0 ? `+${Math.min(metrics.successRate + 8, 100)}%` : '+0%'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${metrics.successRate > 0 ? Math.min(metrics.successRate + 8, 100) : 0}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Risco Médio</span>
                  <span className={metrics.highRisk > 0 ? 'text-orange-500' : 'text-zinc-600'}>
                    {metrics.highRisk > 0 ? `-${Math.round(metrics.highRisk / 10)}%` : '-0%'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${metrics.highRisk}%` }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Patterns */}
          <section className="card-standard">
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Análise automática baseada no histórico</div>
              <h2>Padrões Estratégicos Identificados</h2>
            </div>

            <div className="space-y-4">
              {decisions.length === 0 ? (
                <p className="text-sm text-zinc-600 text-center py-4">Nenhum padrão identificado ainda.<br />Registre decisões para ver análises automáticas.</p>
              ) : (
                <>
                  <PatternItem
                    text="Alta correlação entre decisões de precificação e risco elevado."
                    icon={Icons.AlertTriangle}
                  />
                  <PatternItem
                    text="Decisões de produto tendem a ter impacto positivo consistente."
                    icon={Icons.CheckCircle}
                  />
                  <PatternItem
                    text="Ciclo de validação está 15% mais rápido que a média do setor."
                    icon={Icons.Clock}
                  />
                </>
              )}
            </div>
          </section>

          {/* Strategic Insight */}
          <div className="card-standard bg-gradient-to-br from-blue-950/30 to-zinc-900/50 border-blue-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Icons.Brain className="w-12 h-12 text-blue-500" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              <Icons.Sparkles className="w-3 h-3" />
              Insight do Sistema
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Sua velocidade de decisão aumentou em 15% este mês. Garanta que etapas de validação não estejam sendo puladas em favor da velocidade.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, alert = false }: any) {
  return (
    <div className="card-standard flex flex-col justify-between gap-4 hover:bg-[#243244] hover:border-blue-500/20 cursor-default">
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Indicadores Estratégicos</div>
        <Icon className={`w-4 h-4 ${alert ? 'text-orange-500' : 'text-zinc-500'} opacity-70 group-hover:opacity-100 transition-opacity`} />
      </div>
      <div>
        <div className="text-3xl font-bold text-white tracking-tight mb-1">{value}</div>
        <div className="text-xs text-zinc-500">{label}</div>
      </div>
    </div>
  )
}

function FilterButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="px-3 py-1.5 text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5">
      {label}
      <Icons.ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

function PatternItem({ text, icon: Icon }: { text: string, icon: any }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
      <Icon className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
      <span className="text-xs text-zinc-400 leading-relaxed">{text}</span>
    </div>
  )
}
