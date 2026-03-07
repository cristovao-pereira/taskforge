import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useApp } from '../contexts/AppContext';

export default function StrategicSessionsPage() {
  const navigate = useNavigate();
  const [moduleFilter, setModuleFilter] = useState<'all' | 'DecisionForge' | 'ClarityForge' | 'LeverageForge'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'deep' | 'quick'>('all');
  const [sortMode, setSortMode] = useState<'recent' | 'risk' | 'deep' | 'module'>('recent');
  const { sessions, isLoading } = useApp();

  const activeSession = useMemo(() => sessions.find(s => s.status === 'active'), [sessions]);
  const completedSessions = useMemo(() => {
    const filtered = sessions.filter((session) => session.status === 'completed')
      .filter((session) => moduleFilter === 'all' ? true : session.module === moduleFilter)
      .filter((session) => {
        if (modeFilter === 'all') return true;
        return modeFilter === 'deep' ? session.mode === 'deep' : session.mode !== 'deep';
      });

    if (sortMode === 'module') {
      filtered.sort((a, b) => String(a.module).localeCompare(String(b.module)));
    }

    if (sortMode === 'deep') {
      filtered.sort((a, b) => (b.mode === 'deep' ? 1 : 0) - (a.mode === 'deep' ? 1 : 0));
    }

    return filtered;
  }, [sessions, moduleFilter, modeFilter, sortMode]);

  const firstSessionDate = sessions.length > 0 ? sessions[sessions.length - 1].date : 'N/A';
  const lastSessionDate = sessions.length > 0 ? sessions[0].date : 'N/A';

  const mainModule = useMemo(() => {
    if (sessions.length === 0) return 'N/A';
    const counts = sessions.reduce((acc, s: any) => {
      const mod = String(s.module || 'Desconhecido');
      acc[mod] = Number(acc[mod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--border-color)] border-t-[var(--status-priority)] animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm">Carregando sessões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto section-spacing pb-20 animate-in fade-in duration-700">

      {/* Header */}
      <header className="space-y-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] shadow-lg shadow-[var(--accent-color)]/5">
                  <Icons.Brain className="w-6 h-6 text-[var(--accent-color)]" />
                </div>
                Sessões Estratégicas
              </h1>
            </div>

            <p className="text-xl text-[var(--text-secondary)] font-light max-w-2xl">
              Seu histórico estratégico estruturado.
            </p>
            <p className="text-sm text-[var(--text-secondary)] opacity-80 max-w-lg leading-relaxed">
              Revise análises passadas, retome sessões ativas e acompanhe sua evolução estratégica.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="btn-primary" onClick={() => navigate('/app/agent/decision')}>
              <Icons.Plus className="w-4 h-4" />
              Nova Sessão
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <FilterButton label="Todos os Módulos" active={moduleFilter === 'all'} onClick={() => setModuleFilter('all')} />
          <FilterButton label="DecisionForge" active={moduleFilter === 'DecisionForge'} onClick={() => setModuleFilter('DecisionForge')} />
          <FilterButton label="ClarityForge" active={moduleFilter === 'ClarityForge'} onClick={() => setModuleFilter('ClarityForge')} />
          <FilterButton label="LeverageForge" active={moduleFilter === 'LeverageForge'} onClick={() => setModuleFilter('LeverageForge')} />
          <div className="w-px h-6 bg-zinc-800 mx-2 hidden sm:block"></div>
          <FilterButton label="Modo Profundo" active={modeFilter === 'deep'} onClick={() => setModeFilter('deep')} />
          <FilterButton label="Modo Rápido" active={modeFilter === 'quick'} onClick={() => setModeFilter('quick')} />
        </div>

        <div className="relative group">
          <button onClick={() => setSortMode((current) => current === 'recent' ? 'module' : 'recent')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-800">
            <Icons.SortDesc className="w-3.5 h-3.5" />
            <span>Ordenar por: {sortMode === 'recent' ? 'Mais Recentes' : sortMode === 'risk' ? 'Maior Risco' : sortMode === 'deep' ? 'Sessões Profundas' : 'Nome do Módulo'}</span>
            <Icons.ChevronDown className="w-3 h-3 opacity-50" />
          </button>

          <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
            <div className="py-1">
              <button onClick={() => setSortMode('recent')} className="w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between" style={{
                color: 'var(--status-warning)',
                backgroundColor: 'var(--status-warning-bg)'
              }}>
                Mais Recentes
                {sortMode === 'recent' && <Icons.Check className="w-3 h-3" />}
              </button>
              <button onClick={() => setSortMode('risk')} className="w-full text-left px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                Maior Risco
              </button>
              <button onClick={() => setSortMode('deep')} className="w-full text-left px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                Sessões Profundas
              </button>
              <button onClick={() => setSortMode('module')} className="w-full text-left px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                Nome do Módulo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Session */}
      {activeSession && (
        <section className="space-y-4">
          <h2 className="text-zinc-500 uppercase tracking-widest px-1">Sessão Ativa</h2>
          <div className="card-standard border-[var(--status-warning)]/30 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--status-warning)]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[var(--status-warning)]/5 to-transparent opacity-50"></div>

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-bold uppercase tracking-wider border border-[var(--accent-color)]/20">
                    {activeSession.module}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] opacity-70 flex items-center gap-1">
                    <Icons.Clock className="w-3 h-3" />
                    {activeSession.date}
                  </span>
                </div>
                <h3>{activeSession.title}</h3>
                <div className="flex items-center gap-2 text-sm text-[var(--accent-color)]">
                  <Icons.Loader2 className="w-4 h-4 animate-spin" />
                  <span>Em andamento</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4 min-w-[200px]">
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Progresso</span>
                    <span>{activeSession.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--status-warning)] rounded-full" style={{ width: `${activeSession.progress || 0}%` }}></div>
                  </div>
                </div>
                <button className="btn-primary w-full md:w-auto" onClick={() => navigate('/app/chat')}>
                  <Icons.Play className="w-4 h-4 fill-current" />
                  Continuar Sessão
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sessions List */}
      <section className="space-y-6">
        <h2 className="text-zinc-500 uppercase tracking-widest px-1">Sessões Anteriores</h2>
        <div className="grid gap-4">
          {completedSessions.length === 0 ? (
            <div className="card-standard text-center bg-zinc-900/30">
              <p className="text-zinc-400">Nenhuma sessão anterior encontrada.</p>
            </div>
          ) : (
            completedSessions.map((session) => (
              <SessionCard key={session.id} session={session} onOpen={() => navigate('/app/chat')} />
            ))
          )}
        </div>
      </section>

      {/* Strategic Evolution */}
      <section className="space-y-6 border-t border-zinc-900 pt-12">
        <h2 className="text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
          <Icons.TrendingUp className="w-4 h-4" />
          Evolução Estratégica
        </h2>
        <div className="card-standard flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Primeira Sessão</div>
              <div className="text-sm font-medium text-zinc-300">{firstSessionDate}</div>
            </div>
            <div className="h-px w-12 bg-zinc-800 hidden md:block"></div>
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Última Sessão</div>
              <div className="text-sm font-medium text-white">{lastSessionDate}</div>
            </div>
          </div>

          <div className="h-px w-full bg-zinc-800 md:hidden"></div>

          <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
            <div className="space-y-1 text-center md:text-right">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Decisões Analisadas</div>
              <div className="text-xl font-bold text-white">{sessions.length}</div>
            </div>
            <div className="space-y-1 text-center md:text-right">
              <div className="text-[10px] text-[var(--text-secondary)] opacity-70 uppercase tracking-wider">Tendência de Risco</div>
              <div className={`text-sm font-medium flex items-center gap-1 justify-center md:justify-end`} style={{
                color: sessions.length > 0 ? 'var(--status-success)' : 'var(--text-secondary)'
              }}>
                {sessions.length > 0 ? <Icons.TrendingUp className="w-4 h-4" /> : null}
                {sessions.length > 0 ? 'Otimizando' : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Session Summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <SummaryMetric label="Total de Sessões" value={sessions.length.toString()} />
        <SummaryMetric label="Sessões Profundas" value={sessions.filter(s => s.mode === 'deep').length.toString()} />
        <SummaryMetric label="Risco Médio" value={sessions.length > 0 ? "Médio" : "N/A"} color={sessions.length > 0 ? "var(--status-warning)" : "var(--text-secondary)"} />
        <SummaryMetric label="Módulo Principal" value={mainModule} />
      </section>

      {/* Footer */}
      <footer className="text-center space-y-8 pt-8">
        <div className="space-y-2">
          <p className="text-xl font-serif italic text-zinc-300">"O pensamento documentado compõe-se ao longo do tempo."</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Comece a pensar intencionalmente</p>
          <button className="btn-primary mx-auto px-8" onClick={() => navigate('/app/agent/decision')}>
            Iniciar Nova Sessão Estratégica
            <Icons.ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${active
      ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
      }`}>
      {label}
    </button>
  );
}

const SessionCard: React.FC<{ session: any, onOpen?: () => void }> = ({ session, onOpen }) => {
  const getModuleStyles = (module: string) => {
    switch (module) {
      case 'DecisionForge': return { color: 'var(--status-warning)', backgroundColor: 'var(--status-warning-bg)', borderColor: 'var(--status-warning)20' };
      case 'ClarityForge': return { color: 'var(--accent-color)', backgroundColor: 'var(--accent-color)10', borderColor: 'var(--accent-color)20' };
      case 'LeverageForge': return { color: 'var(--accent-color)', backgroundColor: 'var(--accent-color)10', borderColor: 'var(--accent-color)20' };
      default: return { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' };
    }
  };

  return (
    <div className="card-standard group">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border`} style={getModuleStyles(session.module)}>
              {session.module}
            </span>
            <span className="text-xs text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-950">
              {session.mode === 'deep' ? 'Modo Profundo' : 'Modo Rápido'}
            </span>
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Icons.Calendar className="w-3 h-3" />
              {session.date}
            </span>
          </div>
          <h3>{session.title}</h3>
        </div>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed mb-6 border-l-2 border-zinc-800 pl-4">
        {session.summary}
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
        <button onClick={onOpen} className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
          <Icons.Eye className="w-4 h-4" />
          Ver Análise Completa
        </button>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value, color = 'white' }: { label: string, value: string, color?: string }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center gap-1">
      <span className={`text-xl font-bold`} style={{ color }}>{value}</span>
      <span className="text-[10px] text-[var(--text-secondary)] opacity-70 uppercase tracking-wider">{label}</span>
    </div>
  );
}
