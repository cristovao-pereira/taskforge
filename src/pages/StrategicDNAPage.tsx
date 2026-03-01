import { Icons } from '../components/Icons';
import { useEvent } from '../contexts/EventContext';
import { useMetrics } from '../contexts/MetricsContext';

export default function StrategicDNAPage() {
  const { getExplanationsByEntity } = useEvent();
  const { dna } = useMetrics();
  const dnaChanges = getExplanationsByEntity('system', 3);

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
            
            <p className="text-xl text-zinc-400 font-light max-w-2xl">
              Um perfil vivo de como você pensa, decide e executa.
            </p>
          </div>

          <div className={`card-standard flex flex-col items-center ${getScoreBg(dna.overallScore)}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Score Geral</span>
              <span className={`text-4xl font-bold ${getScoreColor(dna.overallScore)}`}>{dna.overallScore}</span>
          </div>
        </div>
      </header>

      {/* DNA Breakdown */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DnaPillar label="Decisões" value={dna.decisionQuality} />
        <DnaPillar label="Riscos" value={dna.riskDiscipline} />
        <DnaPillar label="Execução" value={dna.executionDiscipline} />
        <DnaPillar label="Foco" value={dna.focusLeverage} />
        <DnaPillar label="Consistência" value={dna.strategicConsistency} />
      </section>

      {/* Recent Changes Section */}
      {dnaChanges.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-zinc-800"></div>
            <h2 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Icons.Activity className="w-4 h-4" />
              O que mudou recentemente
            </h2>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {dnaChanges.map((change) => (
              <div key={change.id} className="card-standard flex items-start gap-4">
                <div className="p-2 bg-zinc-800 rounded-lg shrink-0 mt-1">
                  <Icons.GitCommit className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="space-y-1">
                  <h3>{change.title}</h3>
                  <p className="text-xs text-zinc-400">{change.whatChanged} — <span className="text-zinc-500 italic">{change.whyChanged}</span></p>
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
          <div className="h-px flex-1 bg-zinc-800"></div>
          <h2 className="text-zinc-500 uppercase tracking-widest">Forças Estratégicas</h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
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
          <div className="h-px flex-1 bg-zinc-800"></div>
          <h2 className="text-zinc-500 uppercase tracking-widest">Pontos Cegos Recorrentes</h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="card-standard overflow-hidden divide-y divide-zinc-800/50">
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
            <h2 className="text-zinc-500 uppercase tracking-widest">Seu Perfil de Risco</h2>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>
          
          <div className="card-standard space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Score Médio de Risco</div>
                <div className="text-3xl font-bold text-white">7.2<span className="text-zinc-600 text-lg font-normal">/10</span></div>
              </div>
              <div className="text-right">
                <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Perfil de Risco</div>
                <div className="text-orange-400 font-medium">Crescimento Agressivo</div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Risco Mais Comum</span>
                <span className="text-zinc-200">Runway Operacional</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Frequência de Alto Risco</span>
                <span className="text-zinc-200">34% das decisões</span>
              </div>
            </div>
          </div>
        </section>

        {/* Execution Profile */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-zinc-500 uppercase tracking-widest">Como Você Executa</h2>
            <div className="h-px flex-1 bg-zinc-800"></div>
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
          <div className="h-px flex-1 bg-zinc-800"></div>
          <h2 className="text-zinc-500 uppercase tracking-widest">Sua Evolução</h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="relative border-l border-zinc-800 ml-4 space-y-8 pl-8 py-2">
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

      {/* Footer */}
      <footer className="text-center space-y-8 pt-12 border-t border-zinc-900">
        <div className="space-y-2">
          <div className="flex justify-center opacity-50 mb-4">
            <Icons.Quote className="w-8 h-8 text-zinc-700" />
          </div>
          <p className="text-2xl font-serif italic text-zinc-300">"Estratégia não é talento. É pensamento treinado."</p>
        </div>
        
        <button className="btn-primary mx-auto px-8">
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
      <h4 className="text-zinc-500 uppercase tracking-wider mb-1">{label}</h4>
      <div className={`text-2xl font-bold ${getColor(value)}`}>{value}</div>
    </div>
  );
}

function StrengthCard({ icon: Icon, title, description }: any) {
  return (
    <div className="card-standard group">
      <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center mb-4 border border-zinc-800 group-hover:border-blue-500/30 group-hover:text-blue-500 transition-all text-zinc-400">
        <Icon className="w-5 h-5" />
      </div>
      <h3>{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
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
  )
}

function ExecutionMetric({ label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800/50">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-white font-mono font-medium">{value}</span>
    </div>
  )
}

function EvolutionItem({ date, title, description, active }: any) {
  return (
    <div className="relative">
      <div className={`absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-zinc-950 ${active ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-zinc-700'}`}></div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{date}</div>
      <h3 className={`font-semibold mb-1 ${active ? 'text-white' : 'text-zinc-300'}`}>{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">{description}</p>
    </div>
  )
}
