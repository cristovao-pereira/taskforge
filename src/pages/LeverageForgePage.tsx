import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useStrategicMode } from '../contexts/StrategicContext';

export default function LeverageForgePage() {
  const navigate = useNavigate();
  const { mode, getModeLabel, getModeColor } = useStrategicMode();
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    // Simulate analysis delay
    console.log('Analyzing with strategic mode:', mode);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto section-spacing pb-20 animate-in fade-in duration-700">
      
      {/* Header */}
      <header className="space-y-6 pt-8 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-blue-500/10">
                  <Icons.Target className="w-6 h-6 text-blue-500" />
                </div>
                LeverageForge
              </h1>
              <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 ${getModeColor()}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Modo: {getModeLabel()}
              </div>
            </div>
            
            <p className="text-2xl text-zinc-300 font-light max-w-2xl">
              "Identifique onde concentrar esforço para gerar máximo impacto."
            </p>
            <p className="text-base text-zinc-500 max-w-lg leading-relaxed">
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
          <div className="p-4 border-b border-zinc-800/50 mb-2">
             <h3 className="text-zinc-400">Descreva seu cenário atual ou plano em andamento</h3>
          </div>
          
          <textarea 
            className="w-full h-48 bg-transparent text-zinc-300 p-4 focus:outline-none resize-none placeholder:text-zinc-600 font-mono text-sm"
            placeholder="Temos 5 iniciativas rodando simultaneamente, foco em crescimento e expansão..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          
          <div className="flex items-center justify-between p-4 border-t border-zinc-800/50 bg-zinc-900/30 rounded-b-xl">
            <div className="flex gap-3">
                <button className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-2 transition-colors" onClick={() => navigate('/app/documents')}>
                <Icons.Folder className="w-4 h-4" />
                Usar Documento do Document Center
                </button>
                <button className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-2 transition-colors" onClick={() => navigate('/app/plans')}>
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
            <div className="h-px flex-1 bg-zinc-800"></div>
            <h2 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Icons.Target className="w-4 h-4 text-blue-500" />
              Resultado Estratégico
            </h2>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResultBlock title="Resumo do Cenário" icon={Icons.AlignLeft}>
              <p className="text-zinc-400 text-sm leading-relaxed">
                O cenário atual indica alta dispersão de recursos em múltiplas iniciativas de crescimento (5 simultâneas), diluindo o impacto potencial de cada uma.
              </p>
            </ResultBlock>

            <ResultBlock title="Pontos de Maior Impacto" icon={Icons.TrendingUp} color="text-emerald-500">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500" />
                  Otimização do Funil de Vendas (Alta Alavancagem)
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500" />
                  Parcerias Estratégicas B2B
                </li>
              </ul>
            </ResultBlock>

            <ResultBlock title="Iniciativas de Baixo Retorno" icon={Icons.AlertTriangle} color="text-yellow-500">
               <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Icons.XCircle className="w-4 h-4 text-yellow-500" />
                  Redesign do Blog (Baixo impacto imediato)
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Icons.XCircle className="w-4 h-4 text-yellow-500" />
                  Novos canais de Social Media (Esforço alto, retorno lento)
                </li>
              </ul>
            </ResultBlock>

            <ResultBlock title="Gargalos Identificados" icon={Icons.Filter}>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A capacidade de engenharia está fragmentada entre manutenção e novas features, atrasando o lançamento crítico da API.
              </p>
            </ResultBlock>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <ResultBlock title="Oportunidades de Escala" icon={Icons.Scale} color="text-blue-500">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Automatizar o onboarding de parceiros pode liberar 20h/semana do time de CS para focar em retenção de contas Enterprise.
              </p>
            </ResultBlock>

            <ResultBlock title="Recomendações de Foco" icon={Icons.Crosshair} color="text-orange-500">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pausar iniciativas de Social Media e Redesign. Concentrar 80% da engenharia na API e 100% do Marketing em Parcerias e Funil.
              </p>
            </ResultBlock>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="card-standard">
                <div className="flex items-center gap-2 mb-2">
                    <Icons.BarChart3 className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-zinc-200 uppercase tracking-wide">Impacto Estimado</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-1">+40%</div>
                <p className="text-xs text-zinc-500">na conversão de leads qualificados em 90 dias.</p>
             </div>

             <div className="card-standard">
                <div className="flex items-center gap-2 mb-2">
                    <Icons.Activity className="w-4 h-4 text-blue-500" />
                    <h3 className="text-zinc-200 uppercase tracking-wide">Leverage Score</h3>
                </div>
                <div className="text-3xl font-bold text-blue-500 mb-1">8.5/10</div>
                <p className="text-xs text-zinc-500">Potencial de alavancagem alto após ajustes.</p>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-zinc-800">
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
          <h2 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Icons.History className="w-4 h-4" />
            Histórico de Análises
          </h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="card-standard overflow-hidden divide-y divide-zinc-800/50">
          <HistoryItem 
            title="Otimização de Canais de Aquisição" 
            date="25 Out, 14:20" 
            score="7.8"
            impact="Médio"
            onOpen={() => navigate('/app/plans')}
          />
          <HistoryItem 
            title="Reestruturação do Time de Produto" 
            date="10 Out, 09:00" 
            score="9.2"
            impact="Alto"
            onOpen={() => navigate('/app/plans')}
          />
          <HistoryItem 
            title="Análise de Expansão LatAm" 
            date="01 Out, 16:45" 
            score="6.5"
            impact="Baixo"
            onOpen={() => navigate('/app/plans')}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center space-y-8 pt-12 border-t border-zinc-900">
        <div className="space-y-2">
          <p className="text-xl font-serif italic text-zinc-400">"Alavancagem correta multiplica resultados sem multiplicar esforço."</p>
        </div>
      </footer>

    </div>
  );
}

function InfoCard({ icon: Icon, title, items }: any) {
  return (
    <div className="card-standard group hover:bg-zinc-900">
      <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center mb-4 border border-zinc-800 group-hover:border-blue-500/30 group-hover:text-blue-500 transition-all text-zinc-400">
        <Icon className="w-5 h-5" />
      </div>
      <h3>{title}</h3>
      <ul className="space-y-2">
        {items.map((item: string, index: number) => (
          <li key={index} className="text-sm text-zinc-500 flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-700 mt-2 shrink-0 group-hover:bg-blue-500/50 transition-colors"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResultBlock({ title, icon: Icon, children, color = "text-zinc-400" }: any) {
  return (
    <div className="card-standard">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className="text-zinc-200 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ActionButton({ icon: Icon, label, variant = 'primary', onClick }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
      variant === 'primary' 
        ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700' 
        : 'bg-transparent text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
    }`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function HistoryItem({ title, date, score, impact, onOpen }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center border border-zinc-800 bg-zinc-950">
           <span className="text-[10px] text-zinc-500 uppercase">Score</span>
           <span className="text-sm font-bold text-blue-500">{score}</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{title}</h4>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{date}</span>
            <span>•</span>
            <span>Impacto {impact}</span>
          </div>
        </div>
      </div>
      <button onClick={onOpen} className="text-xs font-medium text-zinc-500 hover:text-blue-400 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100">
        Ver análise completa
        <Icons.ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
