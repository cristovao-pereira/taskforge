import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-orange-500/30 relative overflow-x-hidden">
      <AnimatedBackground color="#f97316" className="opacity-40" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Icons.Layers className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">TaskForge</span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-zinc-400">
              <a href="#system" className="hover:text-orange-400 transition-colors">O Sistema</a>
              <a href="#method" className="hover:text-orange-400 transition-colors">Metodologia</a>
              <a href="#memory" className="hover:text-orange-400 transition-colors">Memória</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30">
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32">
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Sistema Operacional v2.0
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
            Pense com clareza. Decida melhor.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Execute o que importa.</span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            TaskForge é um workspace estratégico com IA projetado para construtores solo que buscam clareza, melhores decisões e execução focada.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1">
              Começar Grátis
            </Link>
            <a href="#system" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-zinc-300 bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all hover:-translate-y-1">
              Explorar o Sistema
            </a>
          </div>
        </div>
      </section>

      {/* 2. The Problem Section */}
      <section className="py-24 bg-zinc-950 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              A maioria não falha por falta de esforço.<br />
              <span className="text-zinc-500">Falham por pensamento confuso.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <Icons.Zap className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Decisões por Impulso</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Agir na primeira ideia sem testar a lógica ou considerar as consequências de segunda ordem.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Icons.AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cegueira Estratégica</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Falta de um contraponto estratégico para desafiar suposições e identificar pontos cegos.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                <Icons.ListTodo className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ocupado, Não Produtivo</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Execução sem priorização real, levando ao esgotamento em tarefas que não movem o ponteiro.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Icons.Brain className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Névoa Mental</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Pensamentos confusos e ideias desestruturadas que resultam em retrabalho constante e hesitação.</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl font-medium text-orange-400">Você não precisa de mais ferramentas. Você precisa pensar melhor.</p>
          </div>
        </div>
      </section>

      {/* 3. The System Section */}
      <section id="system" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-4">O Sistema Estratégico</h2>
            <p className="text-zinc-400">Um workspace unificado para sua mente estratégica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* DecisionForge */}
            <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-black/50">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-8 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors border border-zinc-700 group-hover:border-orange-500/20">
                <Icons.GitFork className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">DecisionForge</h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Teste suas decisões antes que elas custem caro. Identifique riscos, valide a lógica e escolha com confiança.
              </p>
              <div className="flex items-center text-sm text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                Explorar Módulo <Icons.ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            {/* ClarityForge */}
            <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-black/50">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-8 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors border border-zinc-700 group-hover:border-orange-500/20">
                <Icons.Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">ClarityForge</h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Extraia clareza de pensamentos confusos. Estruture ideias soltas em estratégias coerentes.
              </p>
              <div className="flex items-center text-sm text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                Explorar Módulo <Icons.ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            {/* LeverageForge */}
            <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-black/50">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-8 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors border border-zinc-700 group-hover:border-orange-500/20">
                <Icons.Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">LeverageForge</h3>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Execute o que realmente move o ponteiro. Elimine o ruído e foque em atividades de alta alavancagem.
              </p>
              <div className="flex items-center text-sm text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                Explorar Módulo <Icons.ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Deep Strategic Mode */}
      <section id="method" className="py-24 bg-zinc-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Não apenas respostas.<br />
                <span className="text-orange-500">Sessões estratégicas estruturadas.</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                A maioria das IAs apenas dá uma resposta rápida. TaskForge guia você por um processo de raciocínio em várias etapas, fazendo as perguntas certas antes de ajudar a concluir.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-orange-500/10 p-2 rounded-lg h-fit">
                    <Icons.Activity className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Análise Rápida</h4>
                    <p className="text-zinc-500 text-sm">Para quando você precisa de insight tático rápido.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-orange-500/10 p-2 rounded-lg h-fit">
                    <Icons.Layers className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Sessões Estratégicas Profundas</h4>
                    <p className="text-zinc-500 text-sm">Frameworks guiados para resolução de problemas complexos.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-orange-500/10 p-2 rounded-lg h-fit">
                    <Icons.Brain className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Contexto Adaptativo</h4>
                    <p className="text-zinc-500 text-sm">O sistema aprende seu contexto e adapta o questionamento.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-t-2xl"></div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700">
                      <Icons.User className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl rounded-tl-none border border-zinc-800 text-zinc-300 text-sm">
                      Estou pensando em pivotar para vendas enterprise, mas estou preocupado com os ciclos de vendas longos.
                    </div>
                  </div>
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                      <Icons.Layers className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-orange-500/10 p-4 rounded-2xl rounded-tr-none border border-orange-500/20 text-zinc-200 text-sm">
                      <p className="mb-3">Essa é uma mudança estratégica significativa. Antes de analisarmos o risco, vamos validar a premissa.</p>
                      <p className="mb-3"><strong>Sessão DecisionForge Iniciada:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-zinc-400">
                        <li>Qual sinal específico está impulsionando esse pivô?</li>
                        <li>Você tem runway para suportar um ciclo de vendas de 6-9 meses?</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Strategic Memory */}
      <section id="memory" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-zinc-700 shadow-xl">
            <Icons.Fingerprint className="w-8 h-8 text-orange-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Seu pensamento evolui.</h2>
          <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
            TaskForge detecta padrões nas suas decisões, identifica seus pontos cegos e destaca riscos recorrentes. Ele constrói um perfil estratégico abrangente de você ao longo do tempo.
          </p>
          
          <div className="inline-block relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur opacity-25"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 px-8 py-4 rounded-lg">
              <p className="text-lg font-medium text-white">"TaskForge não apenas responde. Ele aprende como você decide."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Positioning */}
      <section className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Item 1 */}
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 transform -skew-x-6 hover:skew-x-0 transition-transform duration-500">
                <Icons.Compass className="w-10 h-10 text-white transform skew-x-6 hover:skew-x-0 transition-transform duration-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Para fundadores sem conselho.</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Substitua o isolamento pela clareza. Tenha um parceiro estratégico disponível 24/7 para desafiar suas premissas e validar sua visão, sem o custo de um board tradicional.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-2xl transform -skew-x-6 hover:skew-x-0 transition-transform duration-500 group">
                <Icons.Brain className="w-10 h-10 text-zinc-400 group-hover:text-white transition-colors transform skew-x-6 hover:skew-x-0 transition-transform duration-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Para construtores que pensam sozinhos.</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Estruture seu caos mental. Transforme intuição em planos executáveis. O sistema organiza seus pensamentos dispersos em uma arquitetura de decisão coerente.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-2xl transform -skew-x-6 hover:skew-x-0 transition-transform duration-500 group">
                <Icons.Scale className="w-10 h-10 text-zinc-400 group-hover:text-white transition-colors transform skew-x-6 hover:skew-x-0 transition-transform duration-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Para decisões que realmente importam.</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Evite erros caros. Analise riscos de segunda ordem e impactos de longo prazo antes de comprometer recursos críticos em direções irreversíveis.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-600/5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">Construa com clareza.</h2>
          <div className="flex flex-col items-center gap-6">
            <Link to="/login" className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1">
              Comece seu Workspace Estratégico
            </Link>
            <p className="text-zinc-500 text-sm font-medium">Conta gratuita. Sem cartão de crédito.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center">
              <Icons.Layers className="text-zinc-400 w-3 h-3" />
            </div>
            <span className="font-bold text-zinc-300">TaskForge</span>
          </div>
          <div className="text-zinc-500 text-sm">
            © 2024 TaskForge. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
