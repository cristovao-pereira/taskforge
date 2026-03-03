import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Target, 
  Brain, 
  Layers, 
  Zap, 
  CheckCircle,
  GitBranch,
  Shield,
  BarChart3,
  Search,
  FileText,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Components
const Navbar = () => {
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <img src="/logo.png" alt="TaskForge" className="h-12 w-auto object-contain" />
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
                <div className="text-white border-b-2 border-orange-500 pb-1">Como Funciona</div>
                <button onClick={() => navigate('/precos')} className="hover:text-white transition-colors">Preços</button>
            </div>

            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Entrar
                </button>
                <button 
                onClick={() => navigate('/signup')}
                className="text-sm font-medium bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                >
                Começar
                </button>
            </div>
            </div>
        </nav>
    );
};

const StepCard = ({ number, title, description, icon: Icon, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="relative pl-12 pb-12 last:pb-0"
  >
    {/* Line connector */}
    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-800 last:hidden"></div>
    
    {/* Number bubble */}
    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#1e293b] border border-slate-700 flex items-center justify-center text-slate-400 font-bold z-10 shadow-lg group-hover:border-blue-500 transition-colors">
      {number}
    </div>

    <div className="bg-[#1e293b]/50 p-6 rounded-2xl border border-slate-700/50 hover:bg-[#1e293b] hover:border-slate-600 transition-all duration-300 group">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-700/50 text-blue-400 group-hover:text-blue-300 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">{title}</h3>
        </div>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const AgentCard = ({ title, description, items, icon: Icon, color }: any) => {
    const colorClasses = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        orange: "text-orange-400 bg-orange-500/10 border-orange-500/20"
    };

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700/50 relative overflow-hidden group"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 text-sm mb-6 h-10">{description}</p>
            
            <ul className="space-y-3">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500/50`} />
                        {item}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export default function HowItWorksPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

    useEffect(() => {
        if (user) {
            // Optional: Redirect if desired, but user requested to see pages
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-orange-500/30 overflow-hidden font-sans">
            <Navbar />
            
            {/* Scroll Progress */}
            <motion.div 
                className="fixed top-20 left-0 right-0 h-0.5 bg-blue-500/50 origin-left z-40 transform"
                style={{ scaleX }}
            />

            {/* HERO SECTION */}
            <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium uppercase tracking-widest mb-8">
                            <GitBranch className="w-3 h-3 text-orange-500" />
                            Fluxo Estruturado
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Como o TaskForge <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">funciona</span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-8 max-w-xl font-light leading-relaxed">
                            Um sistema estruturado que transforma decisões complexas em clareza executável. Em vez de respostas rápidas, você passa por um processo lógico de análise estratégica.
                        </p>
                        <button 
                            onClick={() => navigate('/signup')} 
                            className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2 hover:-translate-y-1"
                        >
                            Começar minha primeira decisão
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>

                    {/* Minimalist Flow Visual */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
                        <div className="bg-[#1e293b]/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10">
                            <div className="flex flex-col gap-6">
                                {/* Flow Steps */}
                                {[
                                    { icon: Search, label: "Entrada", sub: "Contexto & Dados" },
                                    { icon: Layers, label: "Estruturação", sub: "Organização Lógica" },
                                    { icon: Brain, label: "Análise", sub: "Teste de Premissas" },
                                    { icon: Target, label: "Plano", sub: "Ação Executável" }
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 relative">
                                        {i < 3 && <div className="absolute left-6 top-12 bottom-[-24px] w-0.5 bg-slate-700/50"></div>}
                                        <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-slate-700 flex items-center justify-center shrink-0 z-10 shadow-lg">
                                            <step.icon className={`w-5 h-5 ${i === 3 ? 'text-emerald-400' : 'text-blue-400'}`} />
                                        </div>
                                        <div className="bg-slate-900/50 flex-1 p-4 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-slate-600 transition-colors">
                                            <div>
                                                <div className="font-bold text-white text-sm">{step.label}</div>
                                                <div className="text-xs text-slate-500">{step.sub}</div>
                                            </div>
                                            {i < 3 ? (
                                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* SECTION 2: THE FLOW */}
             <section className="py-24 bg-[#0b1120]">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">O processo em quatro etapas</h2>
                        <p className="text-slate-400">Do pensamento difuso ao plano concreto.</p>
                    </div>
                    
                    <div className="pl-4 md:pl-0">
                        <StepCard 
                            number="1"
                            icon={FileText}
                            title="Você apresenta a decisão"
                            description="Você descreve o contexto, objetivos e restrições. O sistema organiza a informação bruta em categorias lógicas antes de iniciar qualquer análise, garantindo que nenhum detalhe crítico seja perdido."
                            delay={0.1}
                        />
                        <StepCard 
                            number="2"
                            icon={Shield}
                            title="O sistema testa sua lógica"
                            description="O DecisionForge entra em ação desafiando premissas fundamentais, avaliando riscos de primeira e segunda ordem e simulando impactos que poderiam passar despercebidos numa análise superficial."
                            delay={0.2}
                        />
                        <StepCard 
                            number="3"
                            icon={Layers}
                            title="O pensamento ganha forma"
                            description="O ClarityForge organiza ideias difusas e insights gerados na etapa anterior em uma estrutura lógica coerente. Pontos cegos são iluminados e contradições são resolvidas."
                            delay={0.3}
                        />
                         <StepCard 
                            number="4"
                            icon={Zap}
                            title="A decisão vira plano"
                            description="Por fim, o LeverageForge transforma a escolha estratégica validada em um plano de execução focado, com prioridades claras, responsáveis definidos e indicadores de sucesso."
                            delay={0.4}
                        />
                    </div>
                </div>
             </section>

             {/* SECTION 3: THE AGENTS */}
             <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 rounded-full border border-blue-500/20">Arquitetura</div>
                    <h2 className="text-3xl font-bold text-white mb-4">As três camadas do sistema</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Cada agente especializado assume um papel crítico no processo de estruturação decisória.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <AgentCard 
                        title="DecisionForge"
                        description="Analisa decisões críticas antes que custem caro."
                        icon={Brain}
                        color="blue"
                        items={[
                            "Avaliação de risco",
                            "Impacto estratégico",
                            "Simulação de cenários",
                            "Coerência com objetivos"
                        ]}
                    />
                    <AgentCard 
                        title="ClarityForge"
                        description="Organiza pensamento antes da ação."
                        icon={Layers}
                        color="emerald"
                        items={[
                            "Estruturação de ideias",
                            "Redução de ruído mental",
                            "Consolidação de hipóteses",
                            "Mapeamento de contexto"
                        ]}
                    />
                    <AgentCard 
                        title="LeverageForge"
                        description="Executa o que realmente move o ponteiro."
                        icon={Target}
                        color="orange"
                        items={[
                            "Priorização inteligente",
                            "Foco em alto impacto",
                            "Redução de dispersão",
                            "Planos de curto prazo"
                        ]}
                    />
                </div>
             </section>

             {/* SECTION 4: DIFFERENTIAL */}
             <section className="py-24 bg-[#0b1120] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                         <h2 className="text-3xl font-bold text-white mb-4">Por que não é apenas mais uma IA</h2>
                         <p className="text-slate-400">A diferença entre um chatbot e um sistema especialista.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-[#1e293b]/30 p-8 rounded-2xl border border-dashed border-slate-700">
                             <h3 className="text-slate-500 font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                IA Genérica
                             </h3>
                             <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-slate-500">
                                    <Search className="w-5 h-5 opacity-50" />
                                    Respostas rápidas e superficiais
                                </li>
                                <li className="flex items-center gap-3 text-slate-500">
                                    <Clock className="w-5 h-5 opacity-50" />
                                    Sem memória estratégica de longo prazo
                                </li>
                                <li className="flex items-center gap-3 text-slate-500">
                                    <Layers className="w-5 h-5 opacity-50" />
                                    Texto corrido sem estrutura metodológica
                                </li>
                             </ul>
                        </div>

                        <div className="bg-[#1e293b] p-8 rounded-2xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Layers className="w-32 h-32 text-blue-500" />
                             </div>
                             <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                                TaskForge
                             </h3>
                             <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    Processo guiado passo-a-passo
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <Brain className="w-5 h-5 text-blue-400" />
                                    Memória evolutiva que aprende com você
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <Target className="w-5 h-5 text-orange-400" />
                                    Estrutura lógica validada e acionável
                                </li>
                             </ul>
                        </div>
                    </div>
                </div>
             </section>

             {/* SECTION 5: EVOLUTION */}
             <section className="py-24 px-6 max-w-7xl mx-auto text-center">
                 <h2 className="text-3xl font-bold text-white mb-6">O sistema evolui com você</h2>
                 <p className="text-slate-400 mb-12 max-w-2xl mx-auto">Cada decisão alimenta seu histórico estratégico. O sistema identifica padrões pessoais, riscos recorrentes e melhora a qualidade da sua tomada de decisão ao longo do tempo.</p>
                 
                 <div className="bg-[#1e293b] rounded-3xl border border-slate-700/50 p-12 relative overflow-hidden max-w-4xl mx-auto shadow-2xl">
                     {/* Background Grid */}
                     <div className="absolute inset-0 opacity-[0.03]"
                         style={{
                         backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`
                         }}
                     ></div>

                     <div className="grid grid-cols-3 gap-8 relative z-10">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2">92%</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wide">Assertividade</div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '92%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-emerald-500"
                                ></motion.div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2">-40%</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wide">Risco Médio</div>
                             <div className="h-1.5 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '60%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-blue-500"
                                ></motion.div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2">3x</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wide">Velocidade</div>
                             <div className="h-1.5 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '85%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-orange-500"
                                ></motion.div>
                            </div>
                        </div>
                     </div>
                 </div>
             </section>

             {/* CTA FINAL */}
             <section className="py-32 bg-gradient-to-t from-slate-900 to-[#0b1120] text-center px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-8">Decisões importantes merecem método.</h2>
                    <button 
                         onClick={() => navigate('/signup')} 
                         className="px-10 py-5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xl transition-all shadow-xl shadow-orange-900/30 inline-flex items-center gap-2 mb-6 hover:-translate-y-1"
                    >
                         Estruturar minha decisão agora
                         <ArrowRight className="w-6 h-6" />
                    </button>
                    <p className="text-slate-500 text-sm">Conta gratuita. Sem cartão de crédito. Acesso imediato.</p>
                </div>
             </section>
             
             {/* Simple Footer */}
             <footer className="py-8 bg-[#020617] text-center text-slate-600 text-sm border-t border-slate-800">
                <p>&copy; {new Date().getFullYear()} TaskForge. Todos os direitos reservados.</p>
             </footer>
        </div>
    );
}