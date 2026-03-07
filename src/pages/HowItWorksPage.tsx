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
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-color)' }}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="TaskForge" className="h-12 w-auto object-contain" />
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Home</button>
                    <div className="pb-1 border-b-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-color)' }}>Como Funciona</div>
                    <button onClick={() => navigate('/precos')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Preços</button>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/login')} className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                        Entrar
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-sm font-medium text-white hover:opacity-90 px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                        style={{ backgroundColor: 'var(--accent-color)' }}
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
        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 last:hidden" style={{ backgroundColor: 'var(--border-color)' }}></div>

        {/* Number bubble */}
        <div className="absolute left-0 top-0 w-10 h-10 rounded-full border flex items-center justify-center font-bold z-10 shadow-lg transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            {number}
        </div>

        <div className="p-6 rounded-2xl border transition-all duration-300 group"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg border transition-colors"
                    style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--accent-color)' }}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            </div>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>
    </motion.div>
);



const AgentCard = ({ title, description, items, icon: Icon, color }: any) => {
    const colorStyles = {
        blue: { color: 'var(--status-info)', bg: 'var(--status-info-bg)', border: 'var(--status-info-bg)' },
        emerald: { color: 'var(--status-success)', bg: 'var(--status-success-bg)', border: 'var(--status-success-bg)' },
        orange: { color: 'var(--status-warning)', bg: 'var(--status-warning-bg)', border: 'var(--status-warning-bg)' }
    };
    const style = colorStyles[color as keyof typeof colorStyles];

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl border relative overflow-hidden group"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 border"
                style={{ color: style.color, backgroundColor: style.bg, borderColor: style.border }}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <p className="text-sm mb-6 h-10" style={{ color: 'var(--text-secondary)' }}>{description}</p>

            <ul className="space-y-3">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color, opacity: 0.5 }} />
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
        <div className="min-h-screen selection:bg-[var(--accent-color)]/30 overflow-hidden font-sans transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Navbar />

            {/* Scroll Progress */}
            <motion.div
                className="fixed top-20 left-0 right-0 h-0.5 origin-left z-40 transform"
                style={{ scaleX, backgroundColor: 'var(--accent-color)' }}
            />

            {/* HERO SECTION */}
            <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-widest mb-8"
                            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                            <GitBranch className="w-3 h-3" style={{ color: 'var(--accent-color)' }} />
                            Fluxo Estruturado
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
                            Como o TaskForge <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[var(--status-info)]">funciona</span>
                        </h1>
                        <p className="text-xl mb-8 max-w-xl font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Um sistema estruturado que transforma decisões complexas em clareza executável. Em vez de respostas rápidas, você passa por um processo lógico de análise estratégica.
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:opacity-90 flex items-center gap-2 hover:-translate-y-1"
                            style={{ backgroundColor: 'var(--accent-color)', boxShadow: '0 10px 15px -3px var(--accent-color-alpha)' }}
                        >
                            Começar minha primeira decisão
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>

                    {/* Minimalist Flow Visual */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[var(--accent-color)]/10 to-[var(--status-priority)]/10 rounded-3xl blur-2xl"></div>
                        <div className="backdrop-blur-sm border rounded-2xl p-8 shadow-2xl relative z-10"
                            style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-color)' }}>
                            <div className="flex flex-col gap-6">
                                {/* Flow Steps */}
                                {[
                                    { icon: Search, label: "Entrada", sub: "Contexto & Dados" },
                                    { icon: Layers, label: "Estruturação", sub: "Organização Lógica" },
                                    { icon: Brain, label: "Análise", sub: "Teste de Premissas" },
                                    { icon: Target, label: "Plano", sub: "Ação Executável" }
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 relative">
                                        {i < 3 && <div className="absolute left-6 top-12 bottom-[-24px] w-0.5" style={{ backgroundColor: 'var(--border-color)' }}></div>}
                                        <div className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 z-10 shadow-lg"
                                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                                            <step.icon className={`w-5 h-5 ${i === 3 ? 'text-[var(--status-success)]' : 'text-[var(--accent-color)]'}`} />
                                        </div>
                                        <div className="flex-1 p-4 rounded-xl border flex justify-between items-center group transition-colors"
                                            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                                            <div>
                                                <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{step.label}</div>
                                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{step.sub}</div>
                                            </div>
                                            {i < 3 ? (
                                                <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-colors" style={{ color: 'var(--text-secondary)' }} />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
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
            <section className="py-24" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>O processo em quatro etapas</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Do pensamento difuso ao plano concreto.</p>
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
                    <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full border"
                        style={{ color: 'var(--accent-color)', backgroundColor: 'var(--status-info-bg)', borderColor: 'var(--accent-color)' }}>Arquitetura</div>
                    <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>As três camadas do sistema</h2>
                    <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Cada agente especializado assume um papel crítico no processo de estruturação decisória.</p>
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
            <section className="py-24 border-y" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Por que não é apenas mais uma IA</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>A diferença entre um chatbot e um sistema especialista.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="p-8 rounded-2xl border border-dashed"
                            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                            <h3 className="font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-secondary)' }}></span>
                                IA Genérica
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                                    <Search className="w-5 h-5 opacity-50" />
                                    Respostas rápidas e superficiais
                                </li>
                                <li className="flex items-center gap-3" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                                    <Clock className="w-5 h-5 opacity-50" />
                                    Sem memória estratégica de longo prazo
                                </li>
                                <li className="flex items-center gap-3" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                                    <Layers className="w-5 h-5 opacity-50" />
                                    Texto corrido sem estrutura metodológica
                                </li>
                            </ul>
                        </div>

                        <div className="p-8 rounded-2xl border shadow-2xl relative overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--accent-color)', borderWidth: '1px' }}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Layers className="w-32 h-32" style={{ color: 'var(--accent-color)' }} />
                            </div>
                            <h3 className="font-bold mb-6 uppercase tracking-wider text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <span className="w-2 h-2 rounded-full shadow-[0_0_10px_var(--accent-color)]" style={{ backgroundColor: 'var(--accent-color)' }}></span>
                                TaskForge
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--status-success)' }} />
                                    Processo guiado passo-a-passo
                                </li>
                                <li className="flex items-center gap-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                                    <Brain className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
                                    Memória evolutiva que aprende com você
                                </li>
                                <li className="flex items-center gap-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                                    <Target className="w-5 h-5" style={{ color: 'var(--status-warning)' }} />
                                    Estrutura lógica validada e acionável
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: EVOLUTION */}
            <section className="py-24 px-6 max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>O sistema evolui com você</h2>
                <p className="mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Cada decisão alimenta seu histórico estratégico. O sistema identifica padrões pessoais, riscos recorrentes e melhora a qualidade da sua tomada de decisão ao longo do tempo.</p>

                <div className="rounded-3xl border p-12 relative overflow-hidden max-w-4xl mx-auto shadow-2xl"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`
                        }}
                    ></div>

                    <div className="grid grid-cols-3 gap-8 relative z-10">
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>92%</div>
                            <div className="text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Assertividade</div>
                            <div className="h-1.5 w-full rounded-full mt-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '92%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{ backgroundColor: 'var(--status-success)' }}
                                    className="h-full"
                                ></motion.div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>-40%</div>
                            <div className="text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Risco Médio</div>
                            <div className="h-1.5 w-full rounded-full mt-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '60%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{ backgroundColor: 'var(--accent-color)' }}
                                    className="h-full"
                                ></motion.div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>3x</div>
                            <div className="text-sm uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Velocidade</div>
                            <div className="h-1.5 w-full rounded-full mt-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '85%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{ backgroundColor: 'var(--status-warning)' }}
                                    className="h-full"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-32 text-center px-6 border-t" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Decisões importantes merecem método.</h2>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-10 py-5 text-white font-bold rounded-xl text-xl transition-all shadow-xl inline-flex items-center gap-2 mb-6 hover:-translate-y-1 hover:opacity-90"
                        style={{ backgroundColor: 'var(--accent-color)', boxShadow: '0 10px 15px -3px var(--accent-color-alpha)' }}
                    >
                        Estruturar minha decisão agora
                        <ArrowRight className="w-6 h-6" />
                    </button>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Conta gratuita. Sem cartão de crédito. Acesso imediato.</p>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-8 text-center text-sm border-t" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                <p>&copy; {new Date().getFullYear()} TaskForge. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}