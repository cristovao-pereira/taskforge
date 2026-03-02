import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icons } from '@/components/Icons';
import { AnimatedPage } from '@/components/AnimatedPage';
import { useStrategicMode } from '@/contexts/StrategicContext';

export default function ClarityForgePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode, getModeLabel, getModeColor } = useStrategicMode();
  const [activeMode, setActiveMode] = useState<'simple' | 'strategic' | 'executive'>('strategic');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'simple' || modeParam === 'strategic' || modeParam === 'executive') {
      setActiveMode(modeParam);
    }
  }, [searchParams]);

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
     <AnimatedPage className="max-w-5xl mx-auto section-spacing pb-20">
      
      {/* Header */}
      <header className="space-y-6 pt-8 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-blue-500/10">
                  <Icons.Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                ClarityForge
              </h1>
              <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 ${getModeColor()}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Modo: {getModeLabel()}
              </div>
            </div>
            
            <p className="text-2xl text-zinc-300 font-light max-w-2xl">
              "Organize informação dispersa em estrutura estratégica."
            </p>
            <p className="text-base text-zinc-500 max-w-lg leading-relaxed">
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
          <div className="flex items-center gap-1 p-2 border-b border-zinc-800/50 mb-2">
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
            className="w-full h-48 bg-transparent text-zinc-300 p-4 focus:outline-none resize-none placeholder:text-zinc-600 font-mono text-sm"
            placeholder="Notas da call com time comercial, dúvidas sobre pricing, ideias sobre expansão..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          
          <div className="flex items-center justify-between p-4 border-t border-zinc-800/50 bg-zinc-900/30 rounded-b-xl">
            <button
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-2 transition-colors"
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
            <div className="h-px flex-1 bg-zinc-800"></div>
            <h2 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Icons.CheckCircle className="w-4 h-4 text-blue-500" />
              Resultado Estruturado
            </h2>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResultBlock title="Resumo Estruturado" icon={Icons.AlignLeft}>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A discussão focou na necessidade de expansão para o mercado Enterprise, identificando gargalos atuais no processo de vendas e na estrutura de suporte. O consenso é que o produto está pronto, mas a operação não.
              </p>
            </ResultBlock>

            <ResultBlock title="Principais Temas" icon={Icons.Hash}>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Escalabilidade do Suporte
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Ciclo de Vendas Longo
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Necessidade de Certificações de Segurança
                </li>
              </ul>
            </ResultBlock>

            <ResultBlock title="Decisões Detectadas" icon={Icons.GitCommit}>
              <ul className="space-y-3">
                <li className="text-sm text-zinc-300 border-l-2 border-emerald-500 pl-3">
                  Aprovação para contratar Head de Sales Enterprise.
                </li>
                <li className="text-sm text-zinc-300 border-l-2 border-emerald-500 pl-3">
                  Início imediato do processo de certificação SOC2.
                </li>
              </ul>
            </ResultBlock>

            <ResultBlock title="Ações Identificadas" icon={Icons.CheckSquare}>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-zinc-400">
                  <Icons.Square className="w-4 h-4 mt-0.5 text-zinc-600" />
                  <span>Mapear requisitos de segurança (CTO)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-400">
                  <Icons.Square className="w-4 h-4 mt-0.5 text-zinc-600" />
                  <span>Revisar pricing para Enterprise (CFO)</span>
                </li>
              </ul>
            </ResultBlock>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <ResultBlock title="Pontos Ambíguos" icon={Icons.HelpCircle} color="text-yellow-500">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Não ficou claro quem será o responsável final pela aprovação do budget de marketing para Q3.
              </p>
            </ResultBlock>

            <ResultBlock title="Recomendações de Organização" icon={Icons.Layout} color="text-blue-500">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Sugerido criar um canal dedicado para "Enterprise Transition" e mover a discussão de pricing para uma sessão específica do DecisionForge.
              </p>
            </ResultBlock>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-zinc-800">
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
          <h2 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Icons.History className="w-4 h-4" />
            Histórico de Estruturações
          </h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="card-standard overflow-hidden divide-y divide-zinc-800/50">
          <HistoryItem 
            onOpen={() => handleOpenHistory(historyItems[0].seedText)}
            title="Planejamento Q3 Marketing" 
            type="Reunião" 
            date="Hoje, 10:30" 
          />
          <HistoryItem 
            onOpen={() => handleOpenHistory(historyItems[1].seedText)}
            title="Ideias para Nova Feature de IA" 
            type="Brainstorm" 
            date="Ontem, 16:45" 
          />
          <HistoryItem 
            onOpen={() => handleOpenHistory(historyItems[2].seedText)}
            title="Análise de Concorrentes - Relatório Anual" 
            type="Documento" 
            date="24 Out, 09:15" 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center space-y-8 pt-12 border-t border-zinc-900">
        <div className="space-y-2">
          <p className="text-xl font-serif italic text-zinc-400">"Clareza é a base da execução disciplinada."</p>
        </div>
      </footer>

    </AnimatedPage>
  );
}

function UsageCard({ icon: Icon, title, items }: any) {
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

function ModeButton({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        active 
          ? 'bg-zinc-800 text-white shadow-sm' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
      }`}
    >
      {label}
    </button>
  );
}

function ResultBlock({ title, icon: Icon, children, color = "text-blue-500" }: any) {
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

function HistoryItem({ title, type, date, onOpen }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-800 ${
          type === 'Brainstorm' ? 'bg-yellow-500/10 text-yellow-500' :
          type === 'Reunião' ? 'bg-blue-500/10 text-blue-500' :
          'bg-purple-500/10 text-purple-500'
        }`}>
          {type === 'Brainstorm' && <Icons.Lightbulb className="w-4 h-4" />}
          {type === 'Reunião' && <Icons.Users className="w-4 h-4" />}
          {type === 'Documento' && <Icons.FileText className="w-4 h-4" />}
        </div>
        <div>
          <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{title}</h4>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{type}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
      <button
        onClick={onOpen}
        className="text-xs font-medium text-zinc-500 hover:text-purple-400 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
      >
        Ver estrutura completa
        <Icons.ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
