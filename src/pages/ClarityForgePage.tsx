import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icons } from '@/components/Icons';
import { AnimatedPage } from '@/components/AnimatedPage';
import { useStrategicMode } from '@/contexts/StrategicContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useEvent } from '@/contexts/EventContext';
import { useApp } from '@/contexts/AppContext';
import { agentAPI } from '@/lib/api';
import { toast } from 'sonner';

interface AnalysisResult {
  summary: string;
  themes: string[];
  decisions: string[];
  actions: string[];
  ambiguities: string;
  recommendations: string;
}

export default function ClarityForgePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode, getModeLabel, getModeColor } = useStrategicMode();
  const { deepMode } = usePreferences();
  const { socket } = useEvent();
  const { addSession } = useApp();

  const [activeMode, setActiveMode] = useState<'simple' | 'strategic' | 'executive'>('strategic');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const activeJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'simple' || modeParam === 'strategic' || modeParam === 'executive') {
      setActiveMode(modeParam);
    }
  }, [searchParams]);

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
          toast.success('✨ Organização concluída!');
          fetchHistory();
          // Sync to global state
          addSession({
            title: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : '') || 'Sessão de Clareza',
            module: 'ClarityForge',
            mode: activeMode === 'strategic' || activeMode === 'executive' || deepMode ? 'deep' : 'quick',
            status: 'completed',
            summary: resultPayload.summary || 'Organização estruturada por Inteligência Artificial.',
          });
        } else if (data.status === 'FAILED') {
          setIsAnalyzing(false);
          setActiveJobId(null);
          activeJobIdRef.current = null;
          toast.dismiss('clarity-loading');
          toast.error('❌ Falha na organização enviada ao agente.');
        }
      }
    };

    const handleClarityReady = (data: any) => {
      setResult(data);
      setIsAnalyzing(false);
      setShowResult(true);
      setActiveJobId(null);
      activeJobIdRef.current = null;
      toast.dismiss('clarity-loading');
      toast.success('✨ Estrutura mental pronta!');
      fetchHistory();
      // Sync to global state
      addSession({
        title: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : '') || 'Sessão de Clareza',
        module: 'ClarityForge',
        mode: activeMode === 'strategic' || activeMode === 'executive' || deepMode ? 'deep' : 'quick',
        status: 'completed',
        summary: data.summary || 'Organização estruturada por Inteligência Artificial.',
      });
    };

    socket.on('agent:job_update', handleJobUpdate);
    socket.on('agent:clarity_structure_ready', handleClarityReady);

    return () => {
      socket.off('agent:job_update', handleJobUpdate);
      socket.off('agent:clarity_structure_ready', handleClarityReady);
    };
  }, [socket, activeJobId]);

  // Fetch History
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await agentAPI.getHistory('CLARITY');
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

  const navigateWithMode = (nextMode: 'simple' | 'strategic' | 'executive') => {
    setActiveMode(nextMode);
    setSearchParams({ mode: nextMode });
  };

  const historyItems = [
    {
      id: 'h1',
      title: 'Planejamento Q3 Marketing',
      type: 'Reunião',
      date: 'Hoje, 10:30',
      seedText: 'Reunião de planejamento de marketing para Q3 com foco em canais de aquisição, budget e metas por squad.'
    },
    {
      id: 'h2',
      title: 'Ideias para Nova Feature de IA',
      type: 'Brainstorm',
      date: 'Ontem, 16:45',
      seedText: 'Brainstorm sobre nova feature de IA para priorização automática de backlog e recomendação de decisões.'
    },
    {
      id: 'h3',
      title: 'Análise de Concorrentes - Relatório Anual',
      type: 'Documento',
      date: '24 Out, 09:15',
      seedText: 'Resumo do relatório anual de concorrentes com posicionamento, preços, diferenciais e riscos de mercado.'
    },
  ] as const;

  const handleOpenHistory = (seedText: string) => {
    setInputText(seedText);
    setShowResult(true);
    setActiveMode('strategic');
  };

  const handleExport = () => {
    const content = [
      '=== ESTRUTURA CLARITYFORGE ===',
      `Modo: ${activeMode}`,
      '',
      'INPUT:',
      inputText || 'Sem conteúdo informado.',
      '',
      'Resultado: Estruturação gerada com sucesso.'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clarityforge-estrutura.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error('Por favor, insira algum texto para organizar.');
      return;
    }

    setIsAnalyzing(true);
    setShowResult(false);
    setResult(null);
    toast.info('🔍 Organizando seus pensamentos...');

    try {
      const { jobId } = await agentAPI.clarity(
        inputText,
        {
          mode,
          activeMode,
          deepMode
        }
      );

      setActiveJobId(jobId);
      activeJobIdRef.current = jobId;
      toast.loading('Estruturando informações, aguarde...', { id: 'clarity-loading' });

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
            toast.dismiss('clarity-loading');
            toast.success('✨ Estrutura concluída!');
            fetchHistory();
            // Sync to global state
            addSession({
              title: job.inputPayload?.inputText?.slice(0, 50) + (job.inputPayload?.inputText?.length > 50 ? '...' : '') || inputText.slice(0, 50) + (inputText.length > 50 ? '...' : '') || 'Sessão de Clareza',
              module: 'ClarityForge',
              mode: activeMode === 'strategic' || activeMode === 'executive' || deepMode ? 'deep' : 'quick',
              status: 'completed',
              summary: resultPayload.summary || 'Organização estruturada por Inteligência Artificial.',
            });
          } else if (job.status === 'FAILED') {
            setIsAnalyzing(false);
            setActiveJobId(null);
            activeJobIdRef.current = null;
            toast.dismiss('clarity-loading');
            toast.error('❌ Falha na organização. Tente novamente.');
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
      toast.error('Erro ao iniciar ClarityForge.');
    }
  };

  return (
    <AnimatedPage className="max-w-5xl mx-auto section-spacing pb-20">

      {/* Header */}
      <header className="space-y-6 pt-8 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg shadow-[var(--accent-color)]/10">
                  <Icons.Sparkles className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                ClarityForge
              </h1>
              <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 ${getModeColor()}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Modo: {getModeLabel()}
              </div>
            </div>

            <p className="text-2xl text-[var(--text-primary)] font-light max-w-2xl">
              "Organize informação dispersa em estrutura estratégica."
            </p>
            <p className="text-base text-[var(--text-secondary)] max-w-lg leading-relaxed">
              Transforme brainstorms, reuniões e documentos em estruturas claras e acionáveis.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button className="btn-primary px-6" onClick={() => navigateWithMode('simple')}>
                <Icons.Zap className="w-4 h-4" />
                Estrutura Rápida
              </button>
              <button className="btn-secondary px-6" onClick={() => navigateWithMode('executive')}>
                <Icons.Search className="w-4 h-4" />
                Análise Profunda
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Usage Types */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UsageCard
          icon={Icons.Lightbulb}
          title="Brainstorm"
          items={[
            "Organiza ideias soltas",
            "Define prioridades",
            "Identifica temas centrais"
          ]}
        />
        <UsageCard
          icon={Icons.Users}
          title="Reunião"
          items={[
            "Resume decisões",
            "Lista ações",
            "Identifica responsabilidades implícitas"
          ]}
        />
        <UsageCard
          icon={Icons.FileText}
          title="Documento"
          items={[
            "Estrutura capítulos",
            "Identifica argumentos principais",
            "Detecta contradições",
            "Sugere organização estratégica"
          ]}
        />
      </section>

      {/* Section 2: Input Area */}
      <section className="space-y-6">
        <div className="card-standard p-1">
          <div className="flex items-center gap-1 p-2 border-b border-[var(--border-color)] mb-2">
            <ModeButton
              active={activeMode === 'simple'}
              onClick={() => navigateWithMode('simple')}
              label="Estrutura Simples"
            />
            <ModeButton
              active={activeMode === 'strategic'}
              onClick={() => navigateWithMode('strategic')}
              label="Estrutura Estratégica"
            />
            <ModeButton
              active={activeMode === 'executive'}
              onClick={() => navigateWithMode('executive')}
              label="Estrutura Executiva"
            />
          </div>

          <textarea
            className="w-full h-48 bg-transparent text-[var(--text-primary)] p-4 focus:outline-none resize-none placeholder:text-[var(--text-secondary)]/50 font-mono text-sm"
            placeholder="Notas da call com time comercial, dúvidas sobre pricing, ideias sobre expansão..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 rounded-b-xl">
            <button
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
              onClick={() => navigate('/app/documents')}
            >
              <Icons.Folder className="w-4 h-4" />
              Usar Documento do Document Center
            </button>

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
                  Organizar com ClarityForge
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: Structured Result (Conditional) */}
      {showResult && (
        <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
            <h2 className="text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
              <Icons.CheckCircle className="w-4 h-4 text-[var(--status-success)]" />
              Resultado Estruturado
            </h2>
            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResultBlock title="Resumo Estruturado" icon={Icons.AlignLeft}>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {result?.summary || 'Processando resumo...'}
              </p>
            </ResultBlock>

            <ResultBlock title="Principais Temas" icon={Icons.Hash}>
              <ul className="space-y-2">
                {result?.themes?.map((theme, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]"></span>
                    {theme}
                  </li>
                ))}
                {!result?.themes && <li className="text-sm text-[var(--text-secondary)]/50 italic">Nenhum tema identificado.</li>}
              </ul>
            </ResultBlock>

            <ResultBlock title="Decisões Detectadas" icon={Icons.GitCommit}>
              <ul className="space-y-3">
                {result?.decisions?.map((dec, i) => (
                  <li key={i} className="text-sm text-[var(--text-primary)] border-l-2 border-[var(--status-success)] pl-3">
                    {dec}
                  </li>
                ))}
                {!result?.decisions && <li className="text-sm text-[var(--text-secondary)]/50 italic">Nenhuma decisão explícita.</li>}
              </ul>
            </ResultBlock>

            <ResultBlock title="Ações Identificadas" icon={Icons.CheckSquare}>
              <ul className="space-y-2">
                {result?.actions?.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <Icons.Square className="w-4 h-4 mt-0.5 text-[var(--text-secondary)]/50" />
                    <span>{action}</span>
                  </li>
                ))}
                {!result?.actions && <li className="text-sm text-[var(--text-secondary)]/50 italic">Nenhuma ação listada.</li>}
              </ul>
            </ResultBlock>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResultBlock title="Pontos Ambíguos" icon={Icons.HelpCircle} color="text-[var(--status-warning)]">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {result?.ambiguities || 'Nenhuma ambiguidade crítica detectada.'}
              </p>
            </ResultBlock>

            <ResultBlock title="Recomendações de Organização" icon={Icons.Layout} color="text-[var(--status-info)]">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {result?.recommendations || 'Use o DecisionForge para aprofundar as decisões listadas.'}
              </p>
            </ResultBlock>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-[var(--border-color)]">
            <ActionButton icon={Icons.GitFork} label="Enviar para DecisionForge" onClick={() => navigate('/app/agent/decision')} />
            <ActionButton icon={Icons.ListTodo} label="Gerar Execution Plan" onClick={() => navigate('/app/plans/create?source=clarityforge')} />
            <ActionButton icon={Icons.Brain} label="Salvar como Strategic Session" onClick={() => navigate('/app/sessions')} />
            <ActionButton icon={Icons.Download} label="Exportar Estrutura" variant="outline" onClick={handleExport} />
          </div>
        </section>
      )}

      {/* Section 4: History */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
            <Icons.History className="w-4 h-4" />
            Histórico de Estruturações
          </h2>
          <div className="h-px flex-1 bg-[var(--border-color)]"></div>
        </div>

        <div className="card-standard overflow-hidden divide-y divide-[var(--border-color)]">
          {history.map((job) => {
            const input = job.inputPayload || {};
            const typeLabels: Record<string, string> = {
              'simple': 'Simples',
              'strategic': 'Estratégica',
              'executive': 'Executiva'
            };

            const textContent = input.input || input.inputText || '';
            const displayTitle = textContent
              ? (textContent.length > 40 ? textContent.substring(0, 40) + '...' : textContent)
              : 'Estruturação';

            const mode = input.activeMode || input.context?.activeMode || 'strategic';

            return (
              <HistoryItem
                key={job.id}
                onOpen={() => {
                  if (job.outputPayload) {
                    setResult(job.outputPayload);
                    setInputText(textContent);
                    setShowResult(true);
                    setActiveMode(mode);
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  } else {
                    setInputText(textContent);
                    setShowResult(false);
                    setActiveMode(mode);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    toast.info('Esta análise não possui um resultado concluído. Você pode tentar novamente.');
                  }
                }}
                title={displayTitle}
                type={typeLabels[mode] || 'Estratégica'}
                date={new Date(job.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              />
            );
          })}
          {history.length === 0 && !isLoadingHistory && (
            <div className="p-10 text-center text-[var(--text-secondary)] italic">
              Nenhuma estruturação encontrada no histórico.
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
          <p className="text-xl font-serif italic text-[var(--text-secondary)]">"Clareza é a base da execução disciplinada."</p>
        </div>
      </footer>

    </AnimatedPage>
  );
}

function UsageCard({ icon: Icon, title, items }: any) {
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

function ModeButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${active
        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
        }`}
    >
      {label}
    </button>
  );
}

function ResultBlock({ title, icon: Icon, children, color = "text-[var(--accent-color)]" }: any) {
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

function HistoryItem({ title, type, date, onOpen }: any) {
  return (
    <div onClick={onOpen} className="p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)]/50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border-color)] ${type === 'Brainstorm' ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' :
            type === 'Reunião' ? 'bg-[var(--status-info-bg)] text-[var(--status-info)]' :
              type === 'Simples' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' :
                type === 'Executiva' ? 'bg-[var(--status-error-bg)] text-[var(--status-error)]' :
                  'bg-[var(--status-priority-bg)] text-[var(--status-priority)]'
          }`}>
          {type === 'Brainstorm' && <Icons.Lightbulb className="w-4 h-4" />}
          {type === 'Reunião' && <Icons.Users className="w-4 h-4" />}
          {type === 'Documento' && <Icons.FileText className="w-4 h-4" />}
          {type === 'Simples' && <Icons.Zap className="w-4 h-4" />}
          {type === 'Estratégica' && <Icons.Sparkles className="w-4 h-4" />}
          {type === 'Executiva' && <Icons.Search className="w-4 h-4" />}
          {!['Brainstorm', 'Reunião', 'Documento', 'Simples', 'Estratégica', 'Executiva'].includes(type) && <Icons.Sparkles className="w-4 h-4" />}
        </div>
        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">{title}</h4>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>{type}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100">
        Ver estrutura
        <Icons.ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}
