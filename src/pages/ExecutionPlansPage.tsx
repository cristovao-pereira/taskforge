import { useState, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { useStrategicMode } from '../contexts/StrategicContext';
import { getStrategicRules } from '../utils/strategicRules';
import { useApp } from '../contexts/AppContext';
import { ExecutionPlan } from '../types';

export default function ExecutionPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<ExecutionPlan | null>(null);
  const { mode, getModeLabel, getModeColor } = useStrategicMode();
  const rules = getStrategicRules(mode);
  const { plans, isLoading } = useApp();

  const activePlans = useMemo(() => plans.filter(p => p.status !== 'completed'), [plans]);
  const completedPlans = useMemo(() => plans.filter(p => p.status === 'completed'), [plans]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planejamento';
      case 'active': return 'Em andamento';
      case 'at_risk': return 'Em risco';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-orange-500 animate-spin"></div>
          <p className="text-zinc-500 text-sm">Carregando planos...</p>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div className="max-w-6xl mx-auto section-spacing pb-20 animate-in fade-in duration-500">
        <button 
          onClick={() => setSelectedPlan(null)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors text-sm font-medium"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Voltar para Planos
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Plan Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    selectedPlan.origin === 'DecisionForge' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                    selectedPlan.origin === 'ClarityForge' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                    'text-blue-400 bg-blue-500/10 border-blue-500/20'
                  }`}>
                    {selectedPlan.origin}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    selectedPlan.status === 'active' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                    selectedPlan.status === 'at_risk' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {getStatusLabel(selectedPlan.status)}
                  </span>
                </div>
                
                {/* Strategic Mode Badge */}
                <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 ${getModeColor()}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    Modo: {getModeLabel()}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-blue-500/5">
                  <Icons.ListTodo className="w-6 h-6 text-blue-500" />
                </div>
                <h1>{selectedPlan.title}</h1>
              </div>
              
              {/* System Suggestions Block */}
              <div className="card-standard border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700"></div>
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg shrink-0">
                        <Icons.Sparkles className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-zinc-200 mb-1">Sugestão do Sistema ({getModeLabel()})</h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {rules.executionSuggestion}
                        </p>
                    </div>
                </div>
              </div>

              <div className="card-standard">
                  <h3 className="text-zinc-500 uppercase tracking-widest mb-2">Objetivo</h3>
                <p className="text-zinc-300 leading-relaxed">{selectedPlan.objective}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                  <Icons.Clock className="w-4 h-4" />
                  <span>Timeline: <span className="text-zinc-300">{selectedPlan.timeline || 'Não definida'}</span></span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {selectedPlan.phases?.map((phase, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-zinc-400 uppercase tracking-wider pl-1">{phase.name}</h3>
                  <div className="space-y-2">
                    {phase.tasks.map((task) => (
                      <div key={task.id} className="group flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all">
                        <button className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          task.completed 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'border-zinc-700 hover:border-blue-500/50'
                        }`}>
                          {task.completed && <Icons.Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                            {task.text}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-wider">
                              <Icons.User className="w-3 h-3" /> {task.assignee}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-wider">
                              <Icons.Calendar className="w-3 h-3" /> {task.deadline}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Strategic Intelligence */}
          <div className="space-y-6">
            <div className="card-standard space-y-6 sticky top-8">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Brain className="w-5 h-5 text-blue-500" />
                <h3 className="text-zinc-300 uppercase tracking-widest">Visão do Plano</h3>
              </div>

              {selectedPlan.intelligence?.rationale && (
                <div className="space-y-2">
                  <h4 className="text-zinc-500 uppercase tracking-wider">Por que este plano?</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-blue-500/30 pl-3">
                    {selectedPlan.intelligence.rationale}
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="space-y-2">
                  <h4 className="text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Icons.Target className="w-3 h-3" /> Confiança
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedPlan.intelligence?.confidence || 0}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">{selectedPlan.intelligence?.confidence || 0}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Icons.AlertTriangle className="w-3 h-3" /> Riscos
                  </h4>
                  <ul className="space-y-1">
                    {selectedPlan.intelligence?.risks.map((risk, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-orange-500 mt-1.5"></span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Icons.Layers className="w-3 h-3" /> Dependências
                  </h4>
                  <ul className="space-y-1">
                    {selectedPlan.intelligence?.dependencies.map((dep, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5"></span>
                        {dep}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Icons.TrendingUp className="w-3 h-3" /> Impacto Esperado
                  </h4>
                  <p className="text-xs text-zinc-300 font-medium bg-zinc-800/50 p-2 rounded border border-zinc-800">
                    {selectedPlan.intelligence?.impact || 'Não avaliado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto section-spacing pb-20 animate-in fade-in duration-700">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8 border-b border-zinc-800 pb-8">
        <div className="space-y-2">
          <h1>Planos de Execução</h1>
          <p className="text-xl text-zinc-400 font-light">Transforme estratégia em ação.</p>
          <p className="text-sm text-zinc-500 max-w-lg leading-relaxed">
            Planos de ação estruturados gerados a partir das suas sessões estratégicas.
          </p>
        </div>
        <button className="btn-primary px-6">
          <Icons.Plus className="w-5 h-5" />
          Criar Plano de Execução
        </button>
      </header>

      {/* Active Plans */}
      <section className="space-y-6">
        <h2 className="text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
          <Icons.Activity className="w-4 h-4" />
          Planos Ativos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePlans.length === 0 ? (
            <div className="col-span-1 md:col-span-2 card-standard text-center bg-zinc-900/30">
              <p className="text-zinc-400">Nenhum plano ativo encontrado.</p>
            </div>
          ) : (
            activePlans.map((plan) => (
              <div key={plan.id} className="card-standard group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-blue-500 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-4 pl-2">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      plan.origin === 'DecisionForge' ? 'text-orange-400' :
                      plan.origin === 'ClarityForge' ? 'text-purple-400' :
                      'text-blue-400'
                    }`}>
                      {plan.origin}
                    </span>
                    <h3 className="group-hover:text-blue-500 transition-colors">{plan.title}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    plan.priority === 'high' || plan.priority === 'critical' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                    plan.priority === 'medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    Prioridade {getPriorityLabel(plan.priority)}
                  </div>
                </div>

                <div className="space-y-4 pl-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Icons.Calendar className="w-3 h-3" /> {plan.date}
                    </span>
                    <span className={`font-medium ${
                      plan.status === 'at_risk' ? 'text-orange-400' : 'text-zinc-400'
                    }`}>
                      {getStatusLabel(plan.status)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Progresso</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        plan.status === 'at_risk' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} style={{ width: `${plan.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-800/50 p-2 rounded border border-zinc-800/50">
                    <Icons.Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span><span className="text-zinc-500">Impacto Estratégico:</span> {plan.intelligence?.impact || 'Não avaliado'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Icons.ListTodo className="w-3 h-3" />
                      {plan.phases?.reduce((acc, phase) => acc + phase.tasks.length, 0) || 0} tarefas
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedPlan(plan)}
                        className="text-xs font-medium text-white hover:text-blue-500 transition-colors flex items-center gap-1"
                      >
                        Abrir Plano <Icons.ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Completed Plans */}
      <section className="space-y-6">
        <h2 className="text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
          <Icons.CheckCircle className="w-4 h-4" />
          Planos Concluídos
        </h2>
        <div className="card-standard divide-y divide-zinc-800">
          {completedPlans.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-zinc-500 text-sm">Nenhum plano concluído.</p>
            </div>
          ) : (
            completedPlans.map((plan) => (
              <div key={plan.id} className="p-4 flex items-center justify-between hover:bg-zinc-900 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Icons.Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{plan.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>Concluído em {plan.date}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{plan.intelligence?.impact || 'Impacto não avaliado'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPlan(plan)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 border border-zinc-800 rounded-lg hover:bg-zinc-800"
                >
                  Ver Resumo
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center space-y-8 pt-8 border-t border-zinc-900">
        <div className="space-y-2">
          <p className="text-xl font-serif italic text-zinc-300">"Execução potencializa clareza."</p>
        </div>
        
        <button className="btn-primary mx-auto px-6">
          <Icons.Sparkles className="w-4 h-4" />
          Gerar Plano a partir de Strategic Session
        </button>
      </footer>

    </div>
  );
}
