import { Icons } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import { useMetrics } from '../contexts/MetricsContext';

export default function StrategicDNAPage() {
  const navigate = useNavigate();
  const { getExplanationsByEntity } = useEvent();
  const { dna } = useMetrics();
  const dnaChanges = getExplanationsByEntity('system', 3);

  const isEmpty = !dna || dna.overallScore === 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="max-w-4xl mx-auto section-spacing pb-20 animate-in fade-in duration-700">

      {/* Header */}
      <header className="space-y-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-blue-500/5">
                  <Icons.Fingerprint className="w-6 h-6 text-blue-500" />
                </div>
                Seu DNA Estratégico
              </h1>
            </div>

            <p className="text-xl font-light max-w-2xl opacity-70" style={{ color: 'var(--text-primary)' }}>
              Um perfil vivo de como você pensa, decide e executa.
            </p>
          </div>

          <div className={`card-standard flex flex-col items-center ${getScoreBg(dna?.overallScore || 0)}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Score Geral</span>
            <span className={`text-4xl font-bold ${getScoreColor(dna?.overallScore || 0)}`}>{dna?.overallScore || 0}</span>
          </div>
        </div>
      </header>

      {/* DNA Breakdown */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DnaPillar label="Decisões" value={dna?.decisionQuality || 0} />
        <DnaPillar label="Riscos" value={dna?.riskDiscipline || 0} />
        <DnaPillar label="Execução" value={dna?.executionDiscipline || 0} />
        <DnaPillar label="Foco" value={dna?.focusLeverage || 0} />
        <DnaPillar label="Consistência" value={dna?.strategicConsistency || 0} />
      </section>

      {isEmpty ? (
        <div className="card-standard text-center py-20 mt-12 border-dashed border-2 bg-transparent" style={{ borderColor: 'var(--border-color)' }}>
          <div className="mx-auto w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <Icons.Fingerprint className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>DNA em Construção</h2>
          <p className="max-w-md mx-auto mb-8 opacity-70" style={{ color: 'var(--text-secondary)' }}>
            Seu perfil estratégico será moldado aqui. Comece a registrar suas decisões, identificar riscos e criar planos.
          </p>
          <Link to="/app/agent/decision" className="btn-primary mx-auto w-fit">
            Registrar Primeira Decisão
          </Link>
        </div>
      ) : (
        <div className="space-y-12 mt-12">
          {/* Recent Changes Section */}
          {dnaChanges.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
                <h2 className="uppercase tracking-widest flex items-center gap-2 text-[10px] font-bold opacity-50" style={{ color: 'var(--text-secondary)' }}>
                  <Icons.Activity className="w-4 h-4" />
                  O que mudou recentemente
                </h2>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {dnaChanges.map((change) => (
                  <div key={change.id} className="card-standard flex items-start gap-4">
                    <div className="p-2 rounded-lg shrink-0 mt-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <Icons.GitCommit className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div className="space-y-1">
                      <h3 style={{ color: 'var(--text-primary)' }}>{change.title}</h3>
                      <p className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>{change.whatChanged} — <span className="italic opacity-70">{change.whyChanged}</span></p>
                      <p className="text-xs text-emerald-500/80 mt-1 flex items-center gap-1">
                        <Icons.ArrowRight className="w-3 h-3" />
                        {change.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 1: Strengths */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
              <h2 className="uppercase tracking-widest text-[10px] font-bold opacity-50" style={{ color: 'var(--text-secondary)' }}>Forças Estratégicas</h2>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StrengthCard
                icon={Icons.Zap}
                title="Forte Intuição de Produto"
                description="Você consistentemente identifica propostas de valor centradas no usuário antes da validação de mercado."
              />
              <StrengthCard
                icon={Icons.Target}
                title="Alto Viés de Execução"
                description="Você tende a mover-se rapidamente da decisão para a ação, minimizando a paralisia por análise."
              />
              <StrengthCard
                icon={Icons.Layers}
                title="Pensamento Analítico Estruturado"
                description="Você naturalmente decompõe problemas complexos em seus princípios fundamentais constituintes."
              />
              <StrengthCard
                icon={Icons.Clock}
                title="Orientação de Longo Prazo"
                description="Decisões são consistentemente ponderadas contra horizontes estratégicos de 12+ meses."
              />
            </div>
          </section>

          {/* Section 2: Blind Spots */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
              <h2 className="uppercase tracking-widest text-[10px] font-bold opacity-50" style={{ color: 'var(--text-secondary)' }}>Pontos Cegos Recorrentes</h2>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
            </div>

            <div className="card-standard overflow-hidden divide-y" style={{ borderColor: 'var(--border-color)', divideColor: 'var(--border-color)' }}>
              <BlindSpotItem
                title="Prazos excessivamente otimistas"
                description="Tendência a subestimar a integração de dívida técnica em ~40%."
                recurrence="Alta"
                color="text-orange-500"
              />
              <BlindSpotItem
                title="Subestimar a concorrência de mercado"
                description="Frequentemente assumindo 'oceano azul' onde existem concorrentes diretos."
                recurrence="Média"
                color="text-yellow-500"
              />
              <BlindSpotItem
                title="Evitar risco de precificação"
                description="Relutância em testar preços mais altos apesar da validação de valor."
                recurrence="Média"
                color="text-yellow-500"
              />
            </div>
          </section>

          {/* Section 3 & 4: Risk & Execution (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Risk Tendencies */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="uppercase tracking-widest text-[10px] font-bold opacity-50" style={{ color: 'var(--text-secondary)' }}>Seu Perfil de Risco</h2>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
              </div>

              <div className="card-standard space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1" style={{ color: 'var(--text-secondary)' }}>Score Médio de Risco</div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>7.2<span className="opacity-30 text-lg font-normal">/10</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1" style={{ color: 'var(--text-secondary)' }}>Perfil de Risco</div>
                    <div className="text-orange-400 font-medium">Crescimento Agressivo</div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Risco Mais Comum</span>
                    <span style={{ color: 'var(--text-primary)' }}>Runway Operacional</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Frequência de Alto Risco</span>
                    <span style={{ color: 'var(--text-primary)' }}>34% das decisões</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Execution Profile */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="uppercase tracking-widest text-[10px] font-bold opacity-50" style={{ color: 'var(--text-secondary)' }}>Como Você Executa</h2>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
              </div>

              <div className="card-standard space-y-6">
                <div className="space-y-4">
                  <ExecutionMetric label="Priorização de Alto Impacto" value="82%" />
                  <ExecutionMetric label="Foco vs Multitarefa" value="65/35" />
                  <ExecutionMetric label="Tarefas Eliminadas (Semana)" value="12 média" />
                </div>
              </div>
            </section>
          </div>

          {/* Section 5: Strategic Evolution */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
              <h2 className="uppercase tracking-widest text-[10px] font-bold opacity-50" style={{ color: 'var(--text-secondary)' }}>Sua Evolução</h2>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
            </div>

            <div className="relative border-l ml-4 space-y-8 pl-8 py-2" style={{ borderColor: 'var(--border-color)' }}>
              <EvolutionItem
                date="Atual"
                title="Foco na Execução"
                description="De exploração ampla para execução direcionada em canais de alta alavancagem."
                active={true}
              />
              <EvolutionItem
                date="Mês Passado"
                title="Maior Consciência de Risco"
                description="Começou a quantificar riscos de forma consistente nas decisões."
                active={false}
              />
              <EvolutionItem
                date="2 Meses Atrás"
                title="Decisões Mais Claras"
                description="De decisões baseadas em instinto para validação estruturada."
                active={false}
              />
            </div>
          </section>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center space-y-8 pt-12 mt-12 border-t border-zinc-900">
        <div className="space-y-2">
          <div className="flex justify-center opacity-30 mb-4">
            <Icons.Quote className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
          </div>
          <p className="text-2xl font-serif italic" style={{ color: 'var(--text-primary)' }}>"Estratégia não é talento. É pensamento treinado."</p>
        </div>

        <button className="btn-primary mx-auto px-8" onClick={() => navigate('/app/sessions')}>
          Iniciar Nova Sessão Estratégica
          <Icons.ArrowRight className="w-5 h-5" />
        </button>
      </footer>

    </div>
  );
}

function DnaPillar({ label, value }: any) {
  const getColor = (v: number) => {
    if (v >= 80) return 'text-emerald-500';
    if (v >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="card-standard p-4 text-center">
      <h4 className="uppercase tracking-widest text-[10px] font-bold opacity-50 mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</h4>
      <div className={`text-2xl font-bold ${getColor(value)}`}>{value}</div>
    </div>
  );
}

function StrengthCard({ icon: Icon, title, description }: any) {
  return (
    <div className="card-standard group">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 border group-hover:border-blue-500/30 group-hover:text-blue-500 transition-all opacity-70" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </div>
  );
}

function BlindSpotItem({ title, description, recurrence, color }: any) {
  return (
    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/50 transition-colors">
      <div>
        <h3 className="text-zinc-200 font-medium mb-1">{title}</h3>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium border border-current opacity-80 ${color === 'text-orange-500' ? 'bg-orange-500/10 text-orange-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
        {recurrence} Recurrence
      </div>
    </div>
  );
}

function ExecutionMetric({ label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800/50">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-white font-mono font-medium">{value}</span>
    </div>
  );
}

function EvolutionItem({ date, title, description, active }: any) {
  return (
    <div className="relative">
      <div className={`absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-zinc-950 ${active ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-zinc-700'}`}></div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{date}</div>
      <h3 className={`font-semibold mb-1 ${active ? 'text-white' : 'text-zinc-300'}`}>{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">{description}</p>
    </div>
  );
}
