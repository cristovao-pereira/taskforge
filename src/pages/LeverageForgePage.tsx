import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useEvent } from '../contexts/EventContext';
import { useApp } from '../contexts/AppContext';
import { agentAPI } from '@/lib/api';
import { toast } from 'sonner';

interface AnalysisResult {
  summary: string;
  impactPoints: string[];
  lowReturnIniciatives: string[];
  bottlenecks: string;
  scalingOpportunities: string;
  focusRecommendations: string;
  estimatedImpact: string;
  leverageScore: string;
}

export default function LeverageForgePage() {
  const navigate = useNavigate();
  const { mode, getModeLabel, getModeColor } = useStrategicMode();
  const { socket } = useEvent();
  const { addPlan, addRisk } = useApp();

  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const activeJobIdRef = useRef<string | null>(null);
  // Socket.io for Real-time Updates
  useEffect(() => {
    if (!socket) return;

    const handleJobUpdate = (data: any) => {
      if (data.jobId === activeJobId) {
        if (data.status === 'COMPLETED') {
          const resultPayload = data.result || {};
          setResult(resultPayload);
          setIsAnalyzing(false);
          setShowResult(true);
          setActiveJobId(null);
          activeJobIdRef.current = null;
          toast.success('✨ Análise de alavancagem concluída!');
          fetchHistory();
          // Sync to global state
          addPlan({
            title: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : '') || 'Análise de Alavancagem',
            origin: 'LeverageForge',
            date: new Date().toISOString().split('T')[0],
            status: 'active',
            progress: 0,
            priority: 'high',
            objective: resultPayload.summary || 'Identificar pontos de alto retorno.',
            timeline: 'Planejamento Inicial',
            phases: [],
            intelligence: {
              risks: resultPayload.bottlenecks ? [resultPayload.bottlenecks] : [],
              dependencies: [],
              impact: resultPayload.estimatedImpact || 'Alto',
              confidence: parseInt(resultPayload.leverageScore?.match(/\d+/)?.[0] || '75'),
              rationale: resultPayload.focusRecommendations || 'Foco em iniciativas de alto retorno.',
            }
          });

          if (resultPayload.bottlenecks && resultPayload.bottlenecks.length > 5 && resultPayload.bottlenecks.toLowerCase() !== 'nenhum') {
            addRisk({
              title: `Gargalo de Alavancagem: ${inputText.slice(0, 30) || 'Análise Otimizada'}`,
              description: resultPayload.bottlenecks,
              severity: 'high',
              probability: 'high',
              status: 'active',
              mitigationPlan: resultPayload.focusRecommendations || 'Foco em iniciativas de alto retorno e eliminação de desperdício.'
            });
          }
        } else if (data.status === 'FAILED') {
          setIsAnalyzing(false);
          setActiveJobId(null);
          activeJobIdRef.current = null;
          toast.dismiss('leverage-loading');
          toast.error('❌ Falha na análise de alavancagem enviada ao agente.');
        }
      }
    };

    const handleLeverageReady = (data: any) => {
      setResult(data);
      setIsAnalyzing(false);
      setShowResult(true);
      setActiveJobId(null);
      activeJobIdRef.current = null;
      toast.dismiss('leverage-loading');
      toast.success('✨ Oportunidades de impacto identificadas!');
      fetchHistory();
      // Sync to global state
      addPlan({
        title: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : '') || 'Análise de Alavancagem',
        origin: 'LeverageForge',
        date: new Date().toISOString().split('T')[0],
        status: 'active',
        progress: 0,
        priority: 'high',
        objective: data.summary || 'Identificar pontos de alto retorno.',
        timeline: 'Planejamento Inicial',
        phases: [],
        intelligence: {
          risks: data.bottlenecks ? [data.bottlenecks] : [],
          dependencies: [],
          impact: data.estimatedImpact || 'Alto',
          confidence: parseInt(data.leverageScore?.match(/\d+/)?.[0] || '75'),
          rationale: data.focusRecommendations || 'Foco em iniciativas de alto retorno.',
        }
      });

      if (data.bottlenecks && data.bottlenecks.length > 5 && data.bottlenecks.toLowerCase() !== 'nenhum') {
        addRisk({
          title: `Gargalo de Alavancagem: ${inputText.slice(0, 30) || 'Análise Otimizada'}`,
          description: data.bottlenecks,
          severity: 'high',
          probability: 'high',
          status: 'active',
          mitigationPlan: data.focusRecommendations || 'Foco em iniciativas de alto retorno e eliminação de desperdício.'
        });
      }
    };

    socket.on('agent:job_update', handleJobUpdate);
    socket.on('agent:leverage_analysis_ready', handleLeverageReady);

    return () => {
      socket.off('agent:job_update', handleJobUpdate);
      socket.off('agent:leverage_analysis_ready', handleLeverageReady);
    };
  }, [socket, activeJobId]);

  // Fetch History
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await agentAPI.getHistory('LEVERAGE');
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
  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error('Por favor, descreva seu cenário para análise.');
      return;
    }

    setIsAnalyzing(true);
    setShowResult(false);
    setResult(null);
    toast.info('🔍 Analisando pontos de alavancagem...');

    try {
      const { jobId } = await agentAPI.leverage(
        inputText,
        {
          mode
        }
      );

      setActiveJobId(jobId);
      activeJobIdRef.current = jobId;
      toast.loading('Calculando impacto estratégico...', { id: 'leverage-loading' });

      const checkStatus = async () => {
        try {
          const job = await agentAPI.getJobStatus(jobId);
          if (job.status === 'COMPLETED') {
            const resultPayload = job.outputPayload || {};
            setResult(resultPayload);
            setIsAnalyzing(false);
            setShowResult(true);
            setActiveJobId(null);
            activeJobIdRef.current = null;
            toast.dismiss('leverage-loading');
            toast.success('✨ Alavancagem mapeada!');
            fetchHistory();
            // Sync to global state
            addPlan({
              title: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : '') || 'Análise de Alavancagem',
              origin: 'LeverageForge',
              date: new Date().toISOString().split('T')[0],
              status: 'active',
              progress: 0,
              priority: 'high',
              objective: resultPayload.summary || 'Identificar pontos de alto retorno.',
              timeline: 'Planejamento Inicial',
              phases: [],
              intelligence: {
                risks: resultPayload.bottlenecks ? [resultPayload.bottlenecks] : [],
                dependencies: [],
                impact: resultPayload.estimatedImpact || 'Alto',
                confidence: parseInt(resultPayload.leverageScore?.match(/\d+/)?.[0] || '75'),
                rationale: resultPayload.focusRecommendations || 'Foco em iniciativas de alto retorno.',
              }
            });

            if (resultPayload.bottlenecks && resultPayload.bottlenecks.length > 5 && resultPayload.bottlenecks.toLowerCase() !== 'nenhum') {
              addRisk({
                title: `Gargalo de Alavancagem: ${inputText.slice(0, 30) || 'Análise Otimizada'}`,
                description: resultPayload.bottlenecks,
                severity: 'high',
                probability: 'high',
                status: 'active',
                mitigationPlan: resultPayload.focusRecommendations || 'Foco em iniciativas de alto retorno e eliminação de desperdício.'
              });
            }
          } else if (job.status === 'FAILED') {
            setIsAnalyzing(false);
            setActiveJobId(null);
            activeJobIdRef.current = null;
            toast.dismiss('leverage-loading');
            toast.error('❌ Falha na análise. Tente novamente.');
          } else {
            if (activeJobIdRef.current === jobId) setTimeout(checkStatus, 5000);
          }
        } catch (e) {
          console.error('Status check failed:', e);
        }
      };

      setTimeout(checkStatus, 10000);

    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      toast.error('Erro ao iniciar LeverageForge.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto section-spacing pb-20 animate-in fade-in duration-700">

      {/* Header */}
      <header className="space-y-6 pt-8 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg shadow-[var(--accent-color)]/10">
                  <Icons.Target className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                LeverageForge
              </h1>
              <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 ${getModeColor()}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Modo: {getModeLabel()}
              </div>
            </div>

            <p className="text-2xl text-[var(--text-primary)] font-light max-w-2xl">
              "Identifique onde concentrar esforço para gerar máximo impacto."
            </p>
            <p className="text-base text-[var(--text-secondary)] max-w-lg leading-relaxed">
              Descubra oportunidades de alavancagem estratégica e elimine dispersão de foco.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button className="btn-primary px-6" onClick={handleAnalyze}>
                <Icons.Zap className="w-4 h-4" />
                Análise Rápida de Alavancagem
              </button>
              <button className="btn-secondary px-6" onClick={handleAnalyze}>
                <Icons.Layers className="w-4 h-4" />
                Deep Strategic Leverage
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: How it works */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          icon={Icons.Zap}
          title="Análise Rápida"
          items={[
            "Identifica tarefas de alto impacto",
            "Detecta desperdício de esforço",
            "Prioriza iniciativas estratégicas"
          ]}
        />
        <InfoCard
          icon={Icons.Layers}
          title="Deep Strategic Leverage"
          items={[
            "Analisa planos ativos",
            "Identifica gargalos",
            "Simula cenários de foco",
            "Sugere reestruturação estratégica"
          ]}
        />
      </section>

      {/* Section 2: Analysis Input */}
      <section className="space-y-6">
        <div className="card-standard p-1">
          <div className="p-4 border-b border-[var(--border-color)] mb-2">
            <h3 className="text-[var(--text-secondary)]">Descreva seu cenário atual ou plano em andamento</h3>
          </div>

          <textarea
            className="w-full h-48 bg-transparent text-[var(--text-primary)] p-4 focus:outline-none resize-none placeholder:text-[var(--text-secondary)]/50 font-mono text-sm"
            placeholder="Temos 5 iniciativas rodando simultaneamente, foco em crescimento e expansão..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 rounded-b-xl">
            <div className="flex gap-3">
              <button className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors" onClick={() => navigate('/app/documents')}>
                <Icons.Folder className="w-4 h-4" />
                Usar Documento do Document Center
              </button>
              <button className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors" onClick={() => navigate('/app/plans')}>
                <Icons.BarChart3 className="w-4 h-4" />
                Analisar Execution Plans ativos
              </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isAnalyzing}
              className={`btn-primary px-6 ${(!inputText.trim() || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAnalyzing ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Icons.Sparkles className="w-4 h-4" />
                  Analisar com LeverageForge
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: Strategic Result */}
      {showResult && (
        <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
            <h2 className="text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Icons.Target className="w-4 h-4 text-[var(--accent-color)]" />
              Resultado Estratégico
            </h2>
            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResultBlock title="Resumo do Cenário" icon={Icons.AlignLeft}>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {result?.summary || 'Processando resumo...'}
              </p>
            </ResultBlock>

            <ResultBlock title="Pontos de Maior Impacto" icon={Icons.TrendingUp} color="text-[var(--status-success)]">
              <ul className="space-y-2">
                {result?.impactPoints?.map((point, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                    <Icons.CheckCircle className="w-4 h-4 text-[var(--status-success)]" />
                    {point}
                  </li>
                ))}
                {!result?.impactPoints?.length && <li className="text-sm text-[var(--text-secondary)]/50 italic">Nenhum ponto detectado.</li>}
              </ul>
            </ResultBlock>

            <ResultBlock title="Iniciativas de Baixo Retorno" icon={Icons.AlertTriangle} color="text-[var(--status-warning)]">
              <ul className="space-y-2">
                {result?.lowReturnIniciatives?.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Icons.XCircle className="w-4 h-4 text-[var(--status-warning)]" />
                    {item}
                  </li>
                ))}
                {!result?.lowReturnIniciatives?.length && <li className="text-sm text-[var(--text-secondary)]/50 italic">Nenhum desperdício óbvio.</li>}
              </ul>
            </ResultBlock>

            <ResultBlock title="Gargalos Identificados" icon={Icons.Filter}>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {result?.bottlenecks || 'Nenhum gargalo crítico identificado.'}
              </p>
            </ResultBlock>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResultBlock title="Oportunidades de Escala" icon={Icons.Scale} color="text-[var(--status-info)]">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {result?.scalingOpportunities || 'Não foram identificadas escalas imediatas.'}
              </p>
            </ResultBlock>

            <ResultBlock title="Recomendações de Foco" icon={Icons.Crosshair} color="text-[var(--status-warning)]">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {result?.focusRecommendations || 'Mantenha o curso atual.'}
              </p>
            </ResultBlock>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-standard">
              <div className="flex items-center gap-2 mb-2">
                <Icons.BarChart3 className="w-4 h-4 text-[var(--text-secondary)]" />
                <h3 className="text-[var(--text-primary)] uppercase tracking-wide">Impacto Estimado</h3>
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{result?.estimatedImpact || '0%'}</div>
              <p className="text-xs text-[var(--text-secondary)]">estimativa de melhoria nos resultados.</p>
            </div>

            <div className="card-standard">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Activity className="w-4 h-4 text-[var(--accent-color)]" />
                <h3 className="text-[var(--text-primary)] uppercase tracking-wide">Leverage Score</h3>
              </div>
              <div className="text-3xl font-bold text-[var(--accent-color)] mb-1">{result?.leverageScore || '0/10'}</div>
              <p className="text-xs text-[var(--text-secondary)]">Potencial de alavancagem estratégica.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-[var(--border-color)]">
            <ActionButton icon={Icons.ListTodo} label="Reorganizar Execution Plan" onClick={() => navigate('/app/plans')} />
            <ActionButton icon={Icons.Plus} label="Gerar Novo Plano Otimizado" onClick={() => navigate('/app/plans/create?source=leverageforge')} />
            <ActionButton icon={Icons.GitFork} label="Enviar decisão para DecisionForge" onClick={() => navigate('/app/agent/decision')} />
            <ActionButton icon={Icons.Save} label="Salvar como Strategic Session" variant="outline" onClick={() => navigate('/app/sessions')} />
          </div>
        </section>
      )}

      {/* Section 4: History */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
            <Icons.History className="w-4 h-4" />
            Histórico de Análises
          </h2>
          <div className="h-px flex-1 bg-[var(--border-color)]"></div>
        </div>

        <div className="card-standard overflow-hidden divide-y divide-[var(--border-color)]">
          {history.map((job) => {
            const output = job.outputPayload || {};
            const input = job.inputPayload || {};

            const textContent = input.input || input.inputText || input.objective || '';
            const displayTitle = textContent
              ? (textContent.length > 40 ? textContent.substring(0, 40) + '...' : textContent)
              : 'Análise de Alavancagem';

            return (
              <HistoryItem
                key={job.id}
                title={displayTitle}
                date={new Date(job.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                score={output.leverageScore || 'N/A'}
                impact={parseFloat(output.estimatedImpact) > 20 ? 'Alto' : 'Médio'}
                onOpen={() => {
                  if (job.outputPayload) {
                    setResult(job.outputPayload);
                    setInputText(textContent);
                    setShowResult(true);
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  } else {
                    setInputText(textContent);
                    setShowResult(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    toast.info('Esta análise não possui um resultado concluído. Você pode tentar novamente.');
                  }
                }}
              />
            );
          })}
          {history.length === 0 && !isLoadingHistory && (
            <div className="p-10 text-center text-[var(--text-secondary)] italic">
              Nenhuma análise de alavancagem encontrada no histórico.
            </div>
          )}
          {isLoadingHistory && (
            <div className="p-8 text-center">
              <Icons.Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--text-secondary)]" />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center space-y-8 pt-12 border-t border-[var(--border-color)]">
        <div className="space-y-2">
          <p className="text-xl font-serif italic text-[var(--text-secondary)]">"Alavancagem correta multiplica resultados sem multiplicar esforço."</p>
        </div>
      </footer>

    </div>
  );
}

function InfoCard({ icon: Icon, title, items }: any) {
  return (
    <div className="card-standard group">
      <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center mb-4 border border-[var(--border-color)] group-hover:border-[var(--accent-color)]/30 group-hover:text-[var(--accent-color)] transition-all text-[var(--text-secondary)]">
        <Icon className="w-5 h-5" />
      </div>
      <h3>{title}</h3>
      <ul className="space-y-2">
        {items.map((item: string, index: number) => (
          <li key={index} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-[var(--border-color)] mt-2 shrink-0 group-hover:bg-[var(--accent-color)]/50 transition-colors"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultBlock({ title, icon: Icon, children, color = "text-[var(--text-secondary)]" }: any) {
  return (
    <div className="card-standard">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className="text-[var(--text-primary)] uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ActionButton({ icon: Icon, label, variant = 'primary', onClick }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${variant === 'primary'
      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]'
      : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)]'
      }`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function HistoryItem({ title, date, score, impact, onOpen }: any) {
  return (
    <div onClick={onOpen} className="p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)]/50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center border border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase">Score</span>
          <span className="text-sm font-bold text-[var(--accent-color)]">{score}</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">{title}</h4>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>{date}</span>
            <span>•</span>
            <span>Impacto {impact}</span>
          </div>
        </div>
      </div>
      <div className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100">
        Ver análise
        <Icons.ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}
