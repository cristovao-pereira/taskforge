import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export interface SimulationResult {
  before: {
    health: Record<string, number>;
    dna: Record<string, number>;
    topRisks: Array<{ id: string; title: string; severity: number }>;
    topPriorities: Array<{ id: string; title: string; score: number }>;
  };
  after: {
    health: Record<string, number>;
    dna: Record<string, number>;
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

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  risksList?: Array<{ id: string; title: string }>;
  tasksList?: Array<{ id: string; title: string }>;
  plansList?: Array<{ id: string; title: string }>;
}

export function SimulationDrawer({
  isOpen,
  onClose,
  risksList = [],
  tasksList = [],
  plansList = [],
}: SimulationDrawerProps) {
  const [mode, setMode] = useState<'conservador' | 'equilibrado' | 'expansao'>(
    'equilibrado'
  );
  const [actions, setActions] = useState<
    Array<{ type: string; id: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const addAction = (type: string, id: string) => {
    if (actions.length >= 3) {
      toast.warning('Máximo de 3 ações permitidas na simulação');
      return;
    }
    setActions([...actions, { type, id }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSimulate = async () => {
    if (actions.length === 0) {
      toast.warning('Selecione pelo menos uma ação para simular');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hypotheticalMode: mode,
          actions: actions.map(a => ({
            type: a.type,
            id: a.id,
          })),
        }),
      });

      if (!response.ok) throw new Error('Falha na simulação');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao simular cenário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setActions([]);
    setResult(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-[#0f172a] border-l border-slate-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Simulação Estratégica</h2>
                    <p className="text-xs text-blue-400 mt-1">Recurso do plano Estratégico</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Teste cenários sem alterar dados reais
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!result ? (
                <>
                  {/* Seção A: Modo Estratégico */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-3">
                      Modo Estratégico
                    </label>
                    <div className="space-y-2">
                      {(
                        ['conservador', 'equilibrado', 'expansao'] as const
                      ).map(m => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            mode === m
                              ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                              : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {m === 'conservador' ? '🛡️ Conservador' : m === 'equilibrado' ? '⚖️ Equilibrado' : '🚀 Expansão'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seção B: Ações Hipotéticas */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-3">
                      Ações Hipotéticas ({actions.length}/3)
                    </label>

                    {/* Resolve Risk */}
                    {risksList.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-2">Resolver Risco</p>
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              addAction('resolve_risk', e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700  rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="">Selecione um risco...</option>
                          {risksList.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Complete Task */}
                    {tasksList.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-2">Concluir Tarefa</p>
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              addAction('complete_task', e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="">Selecione uma tarefa...</option>
                          {tasksList.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Complete Plan */}
                    {plansList.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-2">Concluir Plano</p>
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              addAction('complete_plan', e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="">Selecione um plano...</option>
                          {plansList.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Selected Actions */}
                    <div className="space-y-2">
                      {actions.map((action, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-lg p-3"
                        >
                          <span className="text-sm text-slate-300">
                            {action.type === 'resolve_risk' && '🛡️ Resolver risco'}
                            {action.type === 'complete_task' && '✓ Concluir tarefa'}
                            {action.type === 'complete_plan' && '🎯 Concluir plano'}
                          </span>
                          <button
                            onClick={() => removeAction(idx)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Resultado */
                <SimulationResultDisplay result={result} />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 p-6 space-y-2">
              {!result ? (
                <>
                  <button
                    onClick={handleSimulate}
                    disabled={isLoading || actions.length === 0}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                  >
                    {isLoading ? 'Simulando...' : 'Rodar Simulação'}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleClear}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                  >
                    Nova Simulação
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                </>
              )}
              <p className="text-xs text-slate-500 text-center mt-4">
                ⚠️ Simulação — nenhuma alteração foi salva
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente de Resultado
function SimulationResultDisplay({ result }: { result: SimulationResult }) {
  return (
    <div className="space-y-6 pb-4">
      {/* Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-lg p-4"
      >
        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
          Saúde Estratégica
        </p>
        <div className="flex items-end gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Antes</p>
            <p className="text-3xl font-bold text-slate-200">
              {Math.round(result.before.health.overallScore || 0)}%
            </p>
          </div>
          <div className="text-2xl font-bold text-slate-400">→</div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Depois</p>
            <p className="text-3xl font-bold text-emerald-300">
              {Math.round(result.after.health.overallScore || 0)}%
            </p>
          </div>
          <div>
            <p
              className={`text-sm font-bold ${
                result.deltas.health >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {result.deltas.health >= 0 ? '+' : ''}{Math.round(result.deltas.health)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* DNA Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-lg p-4"
      >
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
          DNA Estratégico
        </p>
        <div className="flex items-end gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Antes</p>
            <p className="text-3xl font-bold text-slate-200">
              {Math.round(result.before.dna.overallScore || 0)}
            </p>
          </div>
          <div className="text-2xl font-bold text-slate-400">→</div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Depois</p>
            <p className="text-3xl font-bold text-blue-300">
              {Math.round(result.after.dna.overallScore || 0)}
            </p>
          </div>
          <div>
            <p
              className={`text-sm font-bold ${
                result.deltas.dna >= 0 ? 'text-blue-400' : 'text-red-400'
              }`}
            >
              {result.deltas.dna >= 0 ? '+' : ''}{Math.round(result.deltas.dna)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Explicação */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
      >
        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Por que mudou?
        </p>
        <ul className="space-y-2">
          {result.explanations.map((exp, idx) => (
            <li
              key={idx}
              className="text-sm text-slate-400 flex gap-2"
            >
              <span className="text-yellow-500 mt-0.5">•</span>
              <span>{exp}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
