import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedPage } from '../components/AnimatedPage';
import { cardHover, buttonPrimary } from '../lib/motion';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useUpgrade } from '../contexts/UpgradeContext';
import { useEvent } from '../contexts/EventContext';
import { useApp } from '../contexts/AppContext';
import { agentAPI } from '../lib/api';
import { toast } from 'sonner';

// Types
interface AnalysisResult {
  summary: string;
  impact: string;
  risk: string;
  assumptions: string[];
  blindSpots: string[];
  recommendation: string;
  confidence: number;
}

interface DecisionNode {
  id: string;
  x: number;
  y: number;
  label: string;
  impact: number; // 0-100, determines size
  risk: 'low' | 'medium' | 'high'; // determines color
  status: 'validated' | 'analyzing' | 'reverted';
  date: string;
  description: string;
  connections: string[]; // ids of connected nodes
}

interface RecentDecision {
  id: string;
  title: string;
  date: string;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  impactScore: number;
  type: 'Quick' | 'Deep';
}

export default function DecisionForgePage() {
  const navigate = useNavigate();
  const { mode, getModeLabel, getModeColor } = useStrategicMode();
  const { metrics, checkUpgradeTriggers } = useUpgrade();
  const { socket } = useEvent();
  const { decisions, addDecision, addRisk } = useApp();

  const [activeTab, setActiveTab] = useState<'analysis' | 'map' | 'history'>('analysis');
  const [decisionTheme, setDecisionTheme] = useState('');
  const [context, setContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [deepMode, setDeepMode] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const activeJobIdRef = useRef<string | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [historyRiskFilter, setHistoryRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [historySort, setHistorySort] = useState<'date_desc' | 'impact_desc'>('date_desc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

  // Socket.io for Real-time Updates
  useEffect(() => {
    if (!socket) return;

    const handleJobUpdate = (data: any) => {
      if (data.jobId === activeJobId) {
        if (data.status === 'COMPLETED') {
          const resultPayload = data.result || {};
          setResult(resultPayload);
          setIsAnalyzing(false);
          setActiveJobId(null);
          activeJobIdRef.current = null;
          toast.dismiss('analysis-loading');
          toast.success('✨ Análise concluída em tempo real!');
          fetchHistory(); // Refresh history
          const parsedRiskLevel = resultPayload.risk?.toLowerCase().includes('alto') ? 'high' :
            resultPayload.risk?.toLowerCase().includes('médio') ? 'medium' : 'low';

          // Sync to global state
          addDecision({
            title: decisionTheme || 'Decisão Estratégica',
            status: 'analyzing',
            riskLevel: parsedRiskLevel,
            impactScore: parseInt(resultPayload.impact?.match(/\d+/)?.[0] || '50'),
            type: deepMode ? 'Deep' : 'Quick',
            summary: resultPayload.summary || 'Análise gerada por Inteligência Artificial.',
          });

          if (parsedRiskLevel === 'high' || parsedRiskLevel === 'medium') {
            addRisk({
              title: `Risco gerado por decisão: ${decisionTheme || 'Decisão Estratégica'}`,
              description: resultPayload.summary || 'Análise gerada por IA indicando riscos e pontos de atenção.',
              severity: parsedRiskLevel === 'high' ? 'critical' : 'high',
              probability: 'medium',
              status: 'active',
              mitigationPlan: resultPayload.mitigation || 'Requer acompanhamento ativo do Comitê Estratégico.'
            });
          }
        } else if (data.status === 'FAILED') {
          setIsAnalyzing(false);
          setActiveJobId(null);
          activeJobIdRef.current = null;
          toast.dismiss('analysis-loading');
          toast.error('❌ Falha na análise pelo agente.');
        }
      }
    };

    const handleAnalysisReady = (data: any) => {
      setResult(data);
      setIsAnalyzing(false);
      setActiveJobId(null);
      activeJobIdRef.current = null;
      toast.dismiss('analysis-loading');
      toast.success('✨ Análise estratégica pronta!');
      fetchHistory();
      const parsedRiskLevel = data.risk?.toLowerCase().includes('alto') ? 'high' :
        data.risk?.toLowerCase().includes('médio') ? 'medium' : 'low';

      // Sync to global state
      addDecision({
        title: decisionTheme || 'Decisão Estratégica',
        status: 'analyzing',
        riskLevel: parsedRiskLevel,
        impactScore: parseInt(data.impact?.match(/\d+/)?.[0] || '50'),
        type: deepMode ? 'Deep' : 'Quick',
        summary: data.summary || 'Análise gerada por Inteligência Artificial.',
      });

      if (parsedRiskLevel === 'high' || parsedRiskLevel === 'medium') {
        addRisk({
          title: `Risco gerado por decisão: ${decisionTheme || 'Decisão Estratégica'}`,
          description: data.summary || 'Análise gerada por IA indicando riscos e pontos de atenção.',
          severity: parsedRiskLevel === 'high' ? 'critical' : 'high',
          probability: 'medium',
          status: 'active',
          mitigationPlan: data.mitigation || 'Requer acompanhamento ativo do Comitê Estratégico.'
        });
      }
    };

    socket.on('agent:job_update', handleJobUpdate);
    socket.on('agent:decision_analysis_ready', handleAnalysisReady);

    return () => {
      socket.off('agent:job_update', handleJobUpdate);
      socket.off('agent:decision_analysis_ready', handleAnalysisReady);
    };
  }, [socket, activeJobId]);

  // Fetch History
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await agentAPI.getHistory('DECISION');
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);
  // Map real ones from context for visual map
  const decisionNodes: DecisionNode[] = useMemo(() => {
    return decisions.map((d, index) => {
      // Deterministic layout for visual appeal
      const x = 20 + ((index * 37) % 60);
      const y = 20 + ((index * 23) % 60);

      return {
        id: String(d.id),
        x,
        y,
        label: d.title || 'Decisão',
        impact: d.impactScore ?? 50,
        risk: (d.riskLevel === 'high' || d.riskLevel === 'critical') ? 'high' : d.riskLevel === 'medium' ? 'medium' : 'low',
        status: d.status === 'analyzing' ? 'analyzing' : d.status === 'reverted' ? 'reverted' : 'validated',
        date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        description: d.summary || 'Análise de decisão estratégica.',
        connections: [],
      };
    });
  }, [decisions]);

  const handleAnalyze = async () => {
    if (!decisionTheme) {
      toast.error('Por favor, descreva qual decisão quer analisar.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    toast.info('🔍 Enviando para análise estratégica...');

    try {
      const { jobId } = await agentAPI.decision(
        decisionTheme,
        {
          context,
          mode,
          deepMode
        }
      );

      setActiveJobId(jobId);
      activeJobIdRef.current = jobId;
      toast.loading('Brainstorming em progresso, por favor aguarde...', { id: 'analysis-loading' });

      // Fallback polling or just wait for socket
      const checkStatus = async () => {
        try {
          const job = await agentAPI.getJobStatus(jobId);
          if (job.status === 'COMPLETED') {
            const resultPayload = job.outputPayload || {};
            setResult(resultPayload);
            setIsAnalyzing(false);
            setActiveJobId(null);
            activeJobIdRef.current = null;
            toast.dismiss('analysis-loading');
            toast.success('✨ Análise concluída!');
            fetchHistory();
            const parsedRiskLevel = resultPayload.risk?.toLowerCase().includes('alto') ? 'high' :
              resultPayload.risk?.toLowerCase().includes('médio') ? 'medium' : 'low';

            // Sync to global state
            addDecision({
              title: job.inputPayload?.theme || decisionTheme || 'Decisão Estratégica',
              status: 'analyzing',
              riskLevel: parsedRiskLevel,
              impactScore: parseInt(resultPayload.impact?.match(/\d+/)?.[0] || '50'),
              type: job.inputPayload?.deepMode ? 'Deep' : 'Quick',
              summary: resultPayload.summary || 'Análise gerada por Inteligência Artificial.',
            });

            if (parsedRiskLevel === 'high' || parsedRiskLevel === 'medium') {
              addRisk({
                title: `Risco gerado por decisão: ${job.inputPayload?.theme || decisionTheme || 'Decisão Estratégica'}`,
                description: resultPayload.summary || 'Análise gerada por IA indicando riscos e pontos de atenção.',
                severity: parsedRiskLevel === 'high' ? 'critical' : 'high',
                probability: 'medium',
                status: 'active',
                mitigationPlan: resultPayload.mitigation || 'Requer acompanhamento ativo do Comitê Estratégico.'
              });
            }
          } else if (job.status === 'FAILED') {
            setIsAnalyzing(false);
            setActiveJobId(null);
            activeJobIdRef.current = null;
            toast.dismiss('analysis-loading');
            toast.error('❌ Falha na análise. Tente novamente.');
          } else {
            // Re-check after 5 seconds if still analyzing
            if (activeJobIdRef.current === jobId) setTimeout(checkStatus, 5000);
          }
        } catch (e) {
          console.error('Status check failed:', e);
        }
      };

      // We start a light polling as fallback to socket
      setTimeout(checkStatus, 10000);

    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      toast.error('Erro ao iniciar análise estratégica.');
    }
  };

  const selectedNode = decisionNodes.find(n => n.id === selectedNodeId);

  const filteredHistory = useMemo(() => {
    // Map AgentJob to RecentDecision format
    const mapped: RecentDecision[] = history.map(job => {
      const output = job.outputPayload || {};
      const input = job.inputPayload || {};
      return {
        id: job.id,
        title: input.theme || 'Análise de Decisão',
        date: new Date(job.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        riskLevel: output.risk?.toLowerCase().includes('alto') ? 'Alto' : output.risk?.toLowerCase().includes('médio') ? 'Médio' : 'Baixo',
        impactScore: parseInt(output.impact?.match(/\d+/)?.[0] || '50'),
        type: input.deepMode ? 'Deep' : 'Quick'
      };
    }).filter((decision) => {
      if (historyRiskFilter === 'all') return true;
      if (historyRiskFilter === 'high') return decision.riskLevel === 'Alto';
      if (historyRiskFilter === 'medium') return decision.riskLevel === 'Médio';
      return decision.riskLevel === 'Baixo';
    });

    if (historySort === 'impact_desc') {
      mapped.sort((a, b) => b.impactScore - a.impactScore);
    } else {
      mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return mapped;
  }, [history, historyRiskFilter, historySort]);

  const openDecisionInMap = (decisionId: string) => {
    setSelectedNodeId(decisionId);
    setActiveTab('map');
  };

  const cycleHistoryFilter = () => {
    setHistoryRiskFilter((current) => {
      if (current === 'all') return 'high';
      if (current === 'high') return 'medium';
      if (current === 'medium') return 'low';
      return 'all';
    });
  };

  const toggleHistorySort = () => {
    setHistorySort((current) => (current === 'date_desc' ? 'impact_desc' : 'date_desc'));
  };

  return (
    <AnimatedPage className="max-w-6xl mx-auto section-spacing pb-20">

      {/* Header */}
      <header className="space-y-6 pt-8 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-blue-500/5">
                  <Icons.Scale className="w-6 h-6 text-blue-500" />
                </div>
                DecisionForge
              </h1>
              <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 ${getModeColor()}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Modo: {getModeLabel()}
              </div>
            </div>
            <p className="text-xl text-zinc-400 font-light">Análise estruturada para decisões críticas.</p>
            <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
              Transforme decisões complexas em análises claras, com avaliação de risco e impacto.
            </p>
          </div>

          <Link
            to="/app/map"
            className="btn-primary"
          >
            <motion.div {...buttonPrimary} className="flex items-center gap-2">
              <Icons.Map className="w-4 h-4 " />
              Ver Mapa de Decisões
            </motion.div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-zinc-800">
          <TabButton
            active={activeTab === 'analysis'}
            onClick={() => setActiveTab('analysis')}
            label="Análise"
            icon={Icons.Sparkles}
          />
          <TabButton
            active={activeTab === 'map'}
            onClick={() => setActiveTab('map')}
            label="Mapa de Decisões"
            icon={Icons.GitFork}
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            label="Histórico"
            icon={Icons.History}
          />
        </div>
      </header>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">

          {/* TAB 1: ANALYSIS */}
          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="card-standard group cursor-pointer"
                  onClick={() => {
                    setDeepMode(false);
                    toast.info('Modo de análise rápida ativado.');
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                      <Icons.Zap className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3>Análise Rápida</h3>
                  </div>
                  <p className="text-sm text-zinc-500">Avaliação rápida de viabilidade e risco para decisões táticas.</p>
                </div>

                <div
                  className="card-standard group cursor-pointer relative overflow-hidden"
                  onClick={() => {
                    if (metrics.plan === 'free') {
                      checkUpgradeTriggers('attempt_deep_mode');
                      return;
                    }
                    setDeepMode(true);
                    toast.success('Deep Mode ativado.');
                  }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10"></div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Icons.Layers className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3>Sessão Estratégica</h3>
                  </div>
                  <p className="text-sm text-zinc-500">Análise completa com cenários e trade-offs para decisões complexas.</p>
                </div>
              </div>

              {/* Input Area */}
              <div className="max-w-3xl mx-auto card-standard">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 ml-1">Tema da decisão</label>
                    <input
                      type="text"
                      value={decisionTheme}
                      onChange={(e) => setDecisionTheme(e.target.value)}
                      placeholder="Ex: Devemos migrar para modelo B2B Enterprise?"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 ml-1">Contexto adicional</label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Adicione detalhes sobre o cenário atual, restrições ou objetivos..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
                    onClick={() => {
                      if (metrics.plan === 'free') {
                        checkUpgradeTriggers('attempt_deep_mode');
                      } else {
                        setDeepMode(!deepMode);
                      }
                    }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        <Icons.Layers className={`w-4 h-4 ${deepMode ? 'text-blue-400' : 'text-zinc-500'}`} />
                        Deep Mode
                        {metrics.plan === 'free' && <Icons.Lock className="w-3 h-3 text-orange-400" />}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">Análise de risco de 2ª ordem e simulação de cenários.</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full p-1 transition-colors relative ${deepMode ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                      <motion.div
                        layout
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: deepMode ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={!decisionTheme || isAnalyzing}
                    className="btn-primary w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Icons.Loader2 className="w-5 h-5 animate-spin" />
                        Processando Análise...
                      </>
                    ) : (
                      <>
                        <Icons.Sparkles className="w-5 h-5" />
                        Analisar com DecisionForge
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Result (Conditional) */}
              {result && (
                <div className="card-standard animate-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Icons.Target className="w-5 h-5 text-blue-500" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Resultado da Análise</h2>
                    </div>
                    {typeof result === 'object' && result?.confidence && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Nível de Confiança</span>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 font-bold text-sm">
                          {result.confidence}%
                        </div>
                      </div>
                    )}
                  </div>

                  {typeof result === 'string' ? (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-8 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {result}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-zinc-500 uppercase tracking-widest">Resumo</h3>
                            <p className="text-zinc-300 leading-relaxed">{result.summary || 'Não disponível'}</p>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                              <Icons.TrendingUp className="w-3 h-3" /> Impacto Estimado
                            </h3>
                            <p className="text-emerald-400 font-medium">{result.impact || '-'}</p>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                              <Icons.AlertTriangle className="w-3 h-3" /> Risco Identificado
                            </h3>
                            <p className="text-orange-400 font-medium">{result.risk || '-'}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-zinc-500 uppercase tracking-widest">Principais Suposições</h3>
                            <ul className="space-y-2">
                              {(result.assumptions || []).map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                                  <span className="w-1 h-1 rounded-full bg-zinc-600 mt-2"></span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-8">
                        <h3 className="text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Icons.Lightbulb className="w-4 h-4 text-yellow-500" />
                          Recomendação
                        </h3>
                        <p className="text-zinc-300 leading-relaxed border-l-2 border-yellow-500/50 pl-4">
                          {result.recommendation || 'Não disponível'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-6 pt-8 border-t border-zinc-800/50">
                <h2 className="text-zinc-500 uppercase tracking-widest px-1">Decisões Recentes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredHistory.slice(0, 3).map((decision) => (
                    <div
                      key={decision.id}
                      className="card-standard group cursor-pointer"
                      onClick={() => {
                        // Find the original job to set result
                        const job = history.find(j => j.id === decision.id);
                        if (job && job.outputPayload) {
                          setResult(job.outputPayload);
                          setActiveTab('analysis');
                        } else {
                          openDecisionInMap(decision.id);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${decision.riskLevel === 'Alto' ? 'bg-orange-500/10 text-orange-400' :
                          decision.riskLevel === 'Médio' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                          Risco {decision.riskLevel}
                        </div>
                        <span className="text-xs text-zinc-500">{decision.date}</span>
                      </div>
                      <h4 className="text-sm font-medium text-white group-hover:text-blue-500 transition-colors mb-2 line-clamp-2">
                        {decision.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Icons.Activity className="w-3 h-3" />
                        Score de Impacto: <span className="text-zinc-300">{decision.impactScore}</span>
                      </div>
                    </div>
                  ))}
                  {filteredHistory.length === 0 && !isLoadingHistory && (
                    <div className="col-span-3 py-10 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                      Nenhuma análise encontrada.
                    </div>
                  )}
                  {isLoadingHistory && (
                    <div className="col-span-3 py-10 text-center">
                      <Icons.Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-700" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DECISION MAP */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col lg:flex-row gap-6 h-[600px]"
            >
              {/* Main Graph Area */}
              <div className="flex-1 card-standard relative overflow-hidden shadow-inner shadow-black/50">
                <div className="absolute top-4 right-4 z-20">
                  <Link
                    to="/app/map"
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/80 backdrop-blur border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-700 rounded-lg transition-all"
                  >
                    <Icons.Maximize2 className="w-3 h-3" />
                    Abrir Análise Completa
                  </Link>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 to-transparent opacity-50"></div>

                {/* Grid Background */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  opacity: 0.1
                }}></div>

                {/* Connections (SVG Layer) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {decisionNodes.map(node =>
                    node.connections.map(targetId => {
                      const target = decisionNodes.find(n => n.id === targetId);
                      if (!target) return null;
                      return (
                        <line
                          key={`${node.id}-${target.id}`}
                          x1={`${node.x}%`}
                          y1={`${node.y}%`}
                          x2={`${target.x}%`}
                          y2={`${target.y}%`}
                          stroke="#52525b"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          className="opacity-40"
                        />
                      );
                    })
                  )}
                </svg>

                {/* Nodes */}
                {decisionNodes.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 z-10">
                    <Icons.GitFork className="w-12 h-12 mb-4 opacity-20" />
                    <p>Nenhuma decisão no mapa ainda.</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors" onClick={() => setActiveTab('analysis')}>
                      Criar Primeira Decisão
                    </button>
                  </div>
                ) : (
                  decisionNodes.map(node => (
                    <motion.div
                      key={node.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 flex flex-col items-center`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      <div className={`rounded-full border-2 shadow-lg transition-all duration-300 flex items-center justify-center
                        ${selectedNodeId === node.id ? 'ring-4 ring-white/10 scale-110' : ''}
                        ${node.risk === 'high' ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
                          node.risk === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                            'bg-emerald-500/20 border-emerald-500 text-emerald-500'}
                      `}
                        style={{
                          width: `${Math.max(40, node.impact * 0.8)}px`,
                          height: `${Math.max(40, node.impact * 0.8)}px`
                        }}
                      >
                        <span className="text-xs font-bold">{node.impact}</span>
                      </div>

                      {/* Label */}
                      <div className="mt-2 px-2 py-1 bg-zinc-950/80 backdrop-blur-sm rounded border border-zinc-800 text-xs text-zinc-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {node.label}
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-zinc-950/80 backdrop-blur p-3 rounded-lg border border-zinc-800 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="text-zinc-400">Baixo Risco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div> <span className="text-zinc-400">Médio Risco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> <span className="text-zinc-400">Alto Risco</span>
                  </div>
                </div>
              </div>

              {/* Detail Panel */}
              <div className="w-full lg:w-80 card-standard flex flex-col h-full">
                {selectedNode ? (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{selectedNode.date}</div>
                      <h3>{selectedNode.label}</h3>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium mt-3 ${selectedNode.status === 'validated' ? 'bg-emerald-500/10 text-emerald-500' :
                        selectedNode.status === 'reverted' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                        {selectedNode.status === 'validated' && <Icons.CheckCircle className="w-3 h-3" />}
                        {selectedNode.status === 'reverted' && <Icons.XCircle className="w-3 h-3" />}
                        {selectedNode.status === 'analyzing' && <Icons.Loader2 className="w-3 h-3" />}
                        {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Resumo Estratégico</h4>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {selectedNode.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                          <div className="text-[10px] text-zinc-500 uppercase">Impacto</div>
                          <div className="text-lg font-bold text-white">{selectedNode.impact}</div>
                        </div>
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                          <div className="text-[10px] text-zinc-500 uppercase">Risco</div>
                          <div className={`text-lg font-bold capitalize ${selectedNode.risk === 'high' ? 'text-orange-500' :
                            selectedNode.risk === 'medium' ? 'text-yellow-500' :
                              'text-emerald-500'
                            }`}>{selectedNode.risk}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3 pt-6 border-t border-zinc-800">
                      <button
                        className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        onClick={() => navigate('/app/map')}
                      >
                        <Icons.FileText className="w-4 h-4" />
                        Ver Análise Completa
                      </button>
                      <button
                        className="w-full py-2 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm font-medium transition-colors border border-zinc-800"
                        onClick={() => {
                          const title = selectedNode ? selectedNode.label : 'Nova decisão';
                          navigate(`/app/plans/create?source=decisionforge&title=${encodeURIComponent(title)}`);
                        }}
                      >
                        Conectar a Execution Plan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-zinc-500">
                    <div className="p-4 bg-zinc-950 rounded-full border border-zinc-800">
                      <Icons.Map className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm max-w-[200px]">Selecione uma decisão no mapa para ver os detalhes estratégicos.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Histórico de Decisões</h2>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-colors flex items-center gap-2"
                    onClick={cycleHistoryFilter}
                  >
                    <Icons.Filter className="w-3 h-3" /> Filtrar: {historyRiskFilter === 'all' ? 'Todos' : historyRiskFilter === 'high' ? 'Alto' : historyRiskFilter === 'medium' ? 'Médio' : 'Baixo'}
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-colors flex items-center gap-2"
                    onClick={toggleHistorySort}
                  >
                    <Icons.SortDesc className="w-3 h-3" /> Ordenar: {historySort === 'date_desc' ? 'Data' : 'Impacto'}
                  </button>
                </div>
              </div>

              <div className="card-standard overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Decisão</th>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Tipo</th>
                      <th className="px-6 py-4 font-medium">Risco</th>
                      <th className="px-6 py-4 font-medium">Impacto</th>
                      <th className="px-6 py-4 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                          Nenhuma decisão registrada no histórico.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((decision) => (
                        <tr key={decision.id} className="hover:bg-zinc-800/30 transition-colors group">
                          <td className="px-6 py-4 font-medium text-white">{decision.title}</td>
                          <td className="px-6 py-4 text-zinc-400">{decision.date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${decision.type === 'Deep' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                              }`}>
                              {decision.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 ${decision.riskLevel === 'Alto' ? 'text-orange-400' :
                              decision.riskLevel === 'Médio' ? 'text-yellow-400' :
                                'text-emerald-400'
                              }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${decision.riskLevel === 'Alto' ? 'bg-orange-400' :
                                decision.riskLevel === 'Médio' ? 'bg-yellow-400' :
                                  'bg-emerald-400'
                                }`}></div>
                              {decision.riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-300 font-mono">{decision.impactScore}</td>
                          <td className="px-6 py-4 text-right relative">
                            <button
                              className="text-zinc-500 hover:text-white transition-colors"
                              onClick={() => setOpenMenuId(openMenuId === decision.id ? null : decision.id)}
                            >
                              <Icons.MoreVertical className="w-4 h-4 ml-auto" />
                            </button>
                            {openMenuId === decision.id && (
                              <div ref={menuRef} className="absolute right-0 mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    setSelectedNodeId(decision.id);
                                    setActiveTab('map');
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-2 border-b border-zinc-800"
                                >
                                  <Icons.Map className="w-4 h-4" />
                                  Ver no Mapa
                                </button>
                                <button
                                  onClick={() => {
                                    toast.info('Editar decisão: ' + decision.title);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-2"
                                >
                                  <Icons.Edit2 className="w-4 h-4" />
                                  Editar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 text-sm font-medium transition-all relative flex items-center gap-2 ${active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-blue-500' : 'text-zinc-500'}`} />
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        />
      )}
    </button>
  );
}
