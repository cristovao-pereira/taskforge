import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Brain, 
  Target, 
  Zap, 
  Layers, 
  Activity,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-xl hover:bg-[#243244] hover:border-slate-600 transition-all duration-300 group cursor-default"
  >
    <div className="w-12 h-12 bg-slate-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-slate-800">
      <Icon className="w-6 h-6 text-blue-400" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>
  </motion.div>
);

const ProcessStep = ({ number, title, isActive }: any) => (
  <div className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-40'} transition-opacity duration-500`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
      isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
    }`}>
      {number}
    </div>
    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>{title}</span>
    {number < 5 && <ChevronRight className="w-4 h-4 text-slate-700" />}
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();
  
  // Parallax efffects
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  // Redirecionamento removido para permitir que usuários logados vejam a Home
  // useEffect(() => {
  //   if (user) {
  //     navigate('/app/dashboard');
  //   }
  // }, [user, navigate]);

  const handleStart = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-orange-500/30 overflow-hidden font-sans">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-500/5 rounded-full blur-[120px]" />
        {/* CSS Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}
        ></div>
      </div>

      {/* Navbar Minimalista */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">TaskForge</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#sistema" className="hover:text-white transition-colors">O Sistema</a>
            <a href="#diferencial" className="hover:text-white transition-colors">Diferencial</a>
            <a href="#memoria" className="hover:text-white transition-colors">Memória</a>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <button 
                onClick={() => navigate('/app/dashboard')} 
                className="text-sm font-medium bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                Ir para o Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Entrar
                </button>
                <button 
                  onClick={handleStart} 
                  className="text-sm font-medium bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                >
                  Começar Agora
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* SEÇÃO 1 — HERO */}
      <section className="relative pt-40 pb-32 px-6 max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            style={{ opacity: opacityHero }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>
              Sistema de Decisão v1.0
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight">
              Decisões estratégicas <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">exigem estrutura.</span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed font-light">
              TaskForge é um sistema estruturado de decisão que organiza seu raciocínio, testa riscos e transforma escolhas críticas em planos claros e executáveis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 mb-8">
              <button 
                onClick={handleStart}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-md transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 group hover:shadow-orange-700/30 transform hover:-translate-y-1"
              >
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-xl text-md transition-all flex items-center justify-center gap-2 group">
                <Activity className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-500 group-hover:text-white" />
                Ver como funciona
              </button>
            </div>
            
            <p className="text-xs text-slate-500 flex items-center gap-2 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Sem cartão de crédito. Estruture sua primeira decisão em menos de 2 minutos.
            </p>
          </motion.div>

          <motion.div 
            style={{ y: y1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-20"></div>
            
            {/* Interface Mockup */}
            <div className="relative bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm transform rotate-1 hover:rotate-0 transition-transform duration-700">
              {/* Fake Browser Header */}
              <div className="h-10 bg-[#1e293b] border-b border-slate-700/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                <div className="ml-4 flex-1 h-5 bg-[#0f172a] rounded text-[10px] text-slate-600 flex items-center px-2 font-mono truncate">
                  app.taskforge.com/agent/decision
                </div>
              </div>

              {/* Steps Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
                 <div className="flex gap-2 text-xs">
                    <ProcessStep number={1} title="Contexto" isActive={true} />
                    <ProcessStep number={2} title="Riscos" isActive={true} />
                    <ProcessStep number={3} title="Impacto" isActive={true} />
                    <ProcessStep number={4} title="Análise" isActive={true} />
                    <ProcessStep number={5} title="Plano" isActive={false} />
                 </div>
              </div>

              {/* Content Body */}
              <div className="p-8 space-y-6 bg-[#0f172a]/95">
                  <div className="flex gap-5">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <Brain className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-white">DecisionForge</span>
                             <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">Analisando</span>
                          </div>
                          <div className="text-sm text-slate-300 leading-relaxed bg-[#1e293b]/50 p-4 rounded-lg border border-slate-800 font-mono">
                             Detectei um <span className="text-orange-400 font-semibold">risco de segunda ordem</span> na sua proposta de expansão: a diluição da cultura técnica atual pode aumentar o churn em 15% se não houver um plano de onboarding robusto.
                          </div>
                      </div>
                  </div>
                  
                  <div className="pl-16 grid grid-cols-2 gap-4">
                    <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Probabilidade de Risco</div>
                        <div className="flex items-center gap-3">
                           <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full w-[75%] bg-orange-500 rounded-full"></div>
                           </div>
                           <span className="text-xs font-mono text-orange-400">High</span>
                        </div>
                    </div>
                    <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800">
                         <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Impacto Financeiro</div>
                         <div className="flex items-center gap-3">
                           <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full w-[45%] bg-blue-500 rounded-full"></div>
                           </div>
                           <span className="text-xs font-mono text-blue-400">Med</span>
                        </div>
                    </div>
                  </div>

                   <div className="pl-16">
                        <button className="text-xs flex items-center gap-2 text-slate-400 hover:text-white transition-colors border border-dashed border-slate-700 rounded px-3 py-1.5 hover:border-slate-500 bg-[#1e293b]/30">
                            <Plus className="w-3 h-3" />
                            Adicionar mitigação ao plano de execução
                        </button>
                   </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -right-12 top-1/3 bg-[#1e293b] p-4 rounded-xl border border-slate-700 shadow-2xl z-20 max-w-[200px]"
            >
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-white">Memória Estratégica</span>
               </div>
               <p className="text-[10px] text-slate-400 leading-tight">
                  "Você rejeitou uma proposta similar em Nov/2024 por falta de margem."
               </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 2 — O PROBLEMA */}
      <section className="py-24 bg-[#0f172a] relative border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/10 via-[#0f172a] to-[#0f172a] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">O problema não é esforço. <br/><span className="text-slate-500">É decidir sem método.</span></h2>
            <p className="text-slate-400 text-lg">
              A maioria das decisões importantes falha não por falta de trabalho — mas por falta de estrutura para processar complexidade.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Zap} 
              title="Decisão por Impulso"
              description="Escolher rápido sem validar premissas ou testar consequências de segunda ordem."
              delay={0.1}
            />
            <FeatureCard 
              icon={Shield} 
              title="Riscos Invisíveis"
              description="Ignorar efeitos colaterais e impactos de longo prazo que só aparecem depois."
              delay={0.2}
            />
            <FeatureCard 
              icon={Target} 
              title="Execução Desalinhada"
              description="Tomar decisões sem transformá-las imediatamente em um plano claro de ação."
              delay={0.3}
            />
            <FeatureCard 
              icon={Brain} 
              title="Pensamento Difuso"
              description="Ideias soltas que ficam na cabeça e nunca se tornam uma estratégia coerente."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — O SISTEMA */}
      <section id="sistema" className="py-24 bg-[#0b1120] border-y border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-20 animate-on-scroll">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 rounded-full border border-indigo-500/20">Arquitetura</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Um sistema. Três camadas estratégicas.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">TaskForge organiza suas decisões em um fluxo lógico que reduz a impulsividade emocional e aumenta a clareza racional.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-800 to-transparent -translate-y-1/2 z-0"></div>

            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700/50 text-center relative z-10 hover:border-indigo-500/50 transition-all duration-300 shadow-xl group"
            >
                <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 group-hover:bg-indigo-500/10 transition-colors">
                    <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">DecisionForge</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Teste suas decisões antes que custem caro. Avalie risco, impacto e coerência estratégica em minutos.</p>
            </motion.div>
            
             <motion.div 
               whileHover={{ y: -10 }}
               className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700/50 text-center relative z-10 hover:border-emerald-500/50 transition-all duration-300 shadow-xl group"
            >
                <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 group-hover:bg-emerald-500/10 transition-colors">
                    <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">ClarityForge</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Organize pensamento difuso em estrutura lógica antes de decidir. Transforme caos em clareza.</p>
            </motion.div>

             <motion.div 
               whileHover={{ y: -10 }}
               className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700/50 text-center relative z-10 hover:border-orange-500/50 transition-all duration-300 shadow-xl group"
            >
                <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/10 group-hover:bg-orange-500/10 transition-colors">
                    <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">LeverageForge</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Transforme decisões validadas em execução priorizada e focada. Do conceito à ação.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 — DIFERENCIAÇÃO */}
      <section id="diferencial" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-8 lg:p-20 border border-slate-700/50 overflow-hidden relative shadow-2xl">
            {/* Background Grain - simulated with SVG noise data uri */}
            <div className="absolute inset-0 opacity-[0.05]"
                 style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                 }}
            ></div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                   <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">Metodologia vs Chat</div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">Não é um chat. <br/>É um processo estruturado.</h2>
                    <p className="text-slate-300 text-lg mb-10 leading-relaxed font-light">
                        Enquanto IAs comuns entregam respostas rápidas e genéricas, TaskForge conduz você por um fluxo estratégico de análise profunda passo a passo.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs mt-0.5 shrink-0">✓</div>
                            <div>
                                <h4 className="text-white font-medium">Análise de riscos de segunda ordem</h4>
                                <p className="text-sm text-slate-400 mt-1">Identificamos o que acontece *depois* do que acontece.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs mt-0.5 shrink-0">✓</div>
                            <div>
                                <h4 className="text-white font-medium">Contextualização com decisões passadas</h4>
                                <p className="text-sm text-slate-400 mt-1">O sistema lembra do que já funcionou (e do que falhou).</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs mt-0.5 shrink-0">✓</div>
                            <div>
                                <h4 className="text-white font-medium">Planos de ação automáticos</h4>
                                <p className="text-sm text-slate-400 mt-1">Nunca saia de uma sessão sem saber o próximo passo.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-[#0f172a] rounded-xl border border-slate-700 p-8 shadow-2xl relative">
                   {/* Decorative dots */}
                   <div className="absolute top-4 right-4 flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                   </div>

                   <div className="mb-6">
                       <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1 block">SESSÃO DE ANÁLISE</span>
                       <h3 className="text-white font-semibold flex items-center gap-2">
                         <Target className="w-4 h-4 text-orange-500" />
                         Expansão Q3 Market Share
                       </h3>
                   </div>
                   
                   <div className="space-y-0 relative">
                       {/* Timeline Line */}
                       <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800"></div>

                       <div className="relative pl-10 pb-8">
                           <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1e293b] border border-blue-500 text-blue-500 flex items-center justify-center text-xs font-bold z-10 shadow-lg shadow-blue-500/20">1</div>
                           <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-700/50 hover:bg-[#202b3d] transition-colors">
                               <p className="text-blue-300 text-xs font-bold mb-1 uppercase">Contexto</p>
                               <p className="text-slate-300 text-sm">A decisão de expandir agora compromete 30% do caixa livre da operação.</p>
                           </div>
                       </div>
                       
                       <div className="relative pl-10 pb-8">
                           <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1e293b] border border-orange-500 text-orange-500 flex items-center justify-center text-xs font-bold z-10 shadow-lg shadow-orange-500/20">2</div>
                           <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-700/50 hover:bg-[#202b3d] transition-colors">
                               <p className="text-orange-300 text-xs font-bold mb-1 uppercase">Risco Crítico</p>
                               <p className="text-slate-300 text-sm">Alta probabilidade de churn (&gt;5%) se o time de suporte não escalar proporcionalmente em 30 dias.</p>
                           </div>
                       </div>

                       <div className="relative pl-10">
                           <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#1e293b] border border-emerald-500 text-emerald-500 flex items-center justify-center text-xs font-bold z-10 shadow-lg shadow-emerald-500/20">3</div>
                           <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-700/50 hover:bg-[#202b3d] transition-colors">
                               <p className="text-emerald-300 text-xs font-bold mb-1 uppercase">Recomendação</p>
                               <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-bold border border-emerald-500/30">APROVAR COM CONDICIONAL</span>
                               </div>
                               <p className="text-slate-300 text-sm">Executar expansão SOMENTE após contratação do líder de suporte (SLA 15 dias). Caso contrário, adiar para Q4.</p>
                           </div>
                       </div>
                   </div>
                </div>
            </div>
        </div>
      </section>

      {/* SEÇÃO 5 — MEMÓRIA ESTRATÉGICA */}
      <section id="memoria" className="py-24 bg-[#0b1120] border-y border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Cada decisão melhora a próxima.</h2>
            <p className="text-slate-400 mb-16 max-w-2xl mx-auto text-lg">TaskForge constrói sua memória estratégica ao longo do tempo, identificando padrões, riscos recorrentes e sua evolução como decisor.</p>
            
            <div className="relative max-w-4xl mx-auto h-[400px] bg-[#1e293b] rounded-2xl border border-slate-700/50 p-8 flex items-end justify-center overflow-hidden shadow-2xl group">
                {/* Evolution Bars */}
                <div className="w-full h-[80%] flex items-end justify-between px-4 lg:px-16 gap-3 z-10">
                    {[35, 42, 40, 55, 62, 58, 75, 82, 78, 88, 92, 96].map((h, i) => (
                        <div className="relative w-full flex flex-col justify-end group h-full" key={i}>
                             <motion.div 
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                                className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500/60 rounded-t-md hover:to-blue-400/80 transition-all relative"
                            > 
                              {i === 11 && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                                   <div className="px-3 py-1 bg-white text-slate-900 text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                                      Alta Precisão
                                   </div>
                                   <div className="w-0.5 h-4 bg-white/20"></div>
                                </div>
                              )}
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 border-t border-slate-700/30 opacity-20" style={{top: '20%'}}></div>
                <div className="absolute inset-0 border-t border-slate-700/30 opacity-20" style={{top: '40%'}}></div>
                <div className="absolute inset-0 border-t border-slate-700/30 opacity-20" style={{top: '60%'}}></div>
                <div className="absolute inset-0 border-t border-slate-700/30 opacity-20" style={{top: '80%'}}></div>
                
                <div className="absolute bottom-8 text-white font-semibold text-xl tracking-tight z-20 flex items-center gap-2 bg-[#1e293b]/90 px-6 py-3 rounded-full border border-slate-700 backdrop-blur shadow-2xl transform group-hover:scale-105 transition-transform">
                   <Activity className="w-5 h-5 text-emerald-500" />
                   O sistema aprende como você decide.
                </div>
            </div>
        </div>
      </section>

      {/* SEÇÃO 6 — PARA QUEM É */}
      <section id="quem" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-3xl font-bold text-white mb-4">Criado para quem decide sozinho.</h2>
            <p className="text-slate-400 text-lg">TaskForge atua como seu conselho consultivo digital.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Fundadores solo', desc: 'Que precisam de um "sócio" digital imparcial para validar ideias e estratégias.' },
                { label: 'Construtores indep.', desc: 'Que buscam clareza mental e priorização em meio ao caos técnico operacional.' },
                { label: 'Profissionais C-Level', desc: 'Que querem documentar, refinar e testar seu processo de decisão antes da execução.' },
                { label: 'Líderes sem board', desc: 'Que precisam de uma segunda opinião estruturada sem o viés da equipe.' }
            ].map((item, i) => (
                <div key={i} className="bg-[#1e293b]/50 p-8 rounded-2xl border border-slate-700/50 text-center hover:bg-[#1e293b] hover:border-blue-500/30 transition-all group duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/5">
                        <span className="font-bold text-lg">{i+1}</span>
                    </div>
                    <h3 className="text-white font-bold mb-3 group-hover:text-orange-400 transition-colors">{item.label}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">{item.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* SEÇÃO FINAL — CTA */}
      <section className="py-32 bg-gradient-to-b from-[#0f172a] to-[#020617] relative overflow-hidden text-center px-6 border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Sua próxima decisão <br/>merece método.</h2>
            
            <div className="flex flex-col items-center gap-6">
              <button 
                  onClick={handleStart}
                  className="px-10 py-5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xl transition-all shadow-xl shadow-orange-900/30 inline-flex items-center gap-3 transform hover:-translate-y-1 hover:shadow-orange-700/40"
              >
                  Estruture sua decisão agora
                  <ArrowRight className="w-6 h-6" />
              </button>
              <p className="text-slate-500 text-sm font-medium">Conta gratuita. Sem cartão. Acesso imediato.</p>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-[#020617] border-t border-slate-800 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
               <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-500 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <Layers className="w-4 h-4 text-white" />
               </div>
               <span className="font-bold text-slate-300 text-lg tracking-tight">TaskForge</span>
            </div>
            
            <div className="flex gap-8">
                <a href="#sistema" className="hover:text-white transition-colors">O Sistema</a>
                <a href="#" className="hover:text-white transition-colors">Metodologia</a>
                <a href="#memoria" className="hover:text-white transition-colors">Memória</a>
            </div>
            
            <div className="flex gap-6 text-xs">
                <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                <span className="text-slate-700">© 2026 TaskForge</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
