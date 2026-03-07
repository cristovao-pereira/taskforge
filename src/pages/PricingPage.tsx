import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Check,
    Zap,
    Shield,
    Brain,
    Target,
    Layers,
    HelpCircle,
    ArrowRight,
    TrendingDown,
    LineChart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { redirectToCheckout } from '../lib/checkout';

// Stripe Price IDs - Monthly & Annual
const PRICING_CONFIG = {
    free: { priceIdMonthly: null, priceIdAnnual: null, credits: 0 },
    builder: {
        priceIdMonthly: 'price_1T6O6QBNgnXewP8Mude8pCy8',
        priceIdAnnual: 'price_1T6ti6BNgnXewP8MHiXe6rWf',
        credits: 120
    },
    strategic: {
        priceIdMonthly: 'price_1T6O6XBNgnXewP8M5BxqsMGU',
        priceIdAnnual: 'price_1T6ti6BNgnXewP8MoFcPDbUv',
        credits: 300
    }
};

// Navbar Component
const Navbar = () => {
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-color)' }}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="TaskForge" className="h-12 w-auto object-contain" />
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity">Home</button>
                    <button onClick={() => navigate('/como-funciona')} className="hover:opacity-80 transition-opacity">Como Funciona</button>
                    <div className="border-b-2 pb-1 cursor-default transition-colors" style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-color)' }}>Preços</div>
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

const PricingCard = ({
    title,
    priceMonthly,
    priceAnnual,
    billingPeriod,
    description,
    features,
    buttonText,
    isPopular = false,
    delay = 0,
    priceIdMonthly,
    priceIdAnnual,
    onCheckout,
}: any) => {
    const navigate = useNavigate();
    const isAnnual = billingPeriod === 'annual';
    const currentPrice = isAnnual ? Math.round(priceAnnual / 12) : priceMonthly;
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (priceIdMonthly === null && priceIdAnnual === null) {
            // Free plan
            navigate('/signup');
            return;
        }

        const priceId = isAnnual ? priceIdAnnual : priceIdMonthly;
        if (onCheckout) {
            setIsLoading(true);
            await onCheckout(priceId);
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            viewport={{ once: true }}
            className={`relative p-8 rounded-2xl border flex flex-col h-full transition-all duration-300 ${isPopular
                    ? 'scale-105 z-10 shadow-2xl'
                    : 'hover:border-[var(--border-hover)]'
                }`}
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: isPopular ? 'var(--accent-color)' : 'var(--border-color)',
                boxShadow: isPopular ? '0 20px 25px -5px var(--accent-color-alpha)' : 'none'
            }}
        >
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg" style={{ backgroundColor: 'var(--accent-color)' }}>
                    Mais Escolhido
                </div>
            )}

            <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-2 ${isPopular ? 'text-white' : 'text-slate-300'}`}>{title}</h3>

                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>R$</span>
                    <span className={`font-bold transition-colors ${priceMonthly === 0 ? 'text-4xl' : 'text-5xl'}`} style={{ color: 'var(--text-primary)' }}>
                        {currentPrice}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/mês</span>
                </div>

                {isAnnual && priceMonthly > 0 && (
                    <div className="text-xs font-medium mb-4 inline-block px-2 py-0.5 rounded border" style={{ color: 'var(--accent-color)', backgroundColor: 'var(--accent-color-alpha)', borderColor: 'var(--accent-color-alpha-more)' }}>
                        Cobrado R$ {priceAnnual}/ano (20% off)
                    </div>
                )}
                {!isAnnual && priceMonthly > 0 && (
                    <div className="h-6 mb-4"></div>
                )}
                {priceMonthly === 0 && (
                    <div className="h-6 mb-4"></div>
                )}

                <p className="text-slate-400 text-sm leading-relaxed min-h-[40px]">{description}</p>
            </div>

            <div className="flex-1 mb-8">
                <ul className="space-y-4">
                    {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: isPopular ? 'var(--accent-color)' : 'var(--text-tertiary)' }} />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                onClick={handleClick}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isPopular
                        ? 'text-white hover:brightness-110 hover:-translate-y-0.5'
                        : `text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-hover)]`
                    }`}
                style={isPopular ? { backgroundColor: 'var(--accent-color)', boxShadow: '0 10px 15px -3px var(--accent-color-alpha)' } : {}}
            >
                {isLoading ? 'Processando...' : buttonText}
                {isPopular && !isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
        </motion.div>
    );
};

const FeatureRow = ({ label, generic, taskforge }: any) => (
    <div className="grid grid-cols-3 py-4 border-b last:border-0 items-center" style={{ borderColor: 'var(--border-color)' }}>
        <div className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
        <div className="text-sm text-center flex justify-center opacity-60" style={{ color: 'var(--text-tertiary)' }}>
            {generic ? <Check className="w-4 h-4" /> : <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}></div>}
        </div>
        <div className="text-sm font-bold text-center flex justify-center" style={{ color: 'var(--accent-color)' }}>
            {taskforge ? <Check className="w-5 h-5 rounded-full" style={{ filter: 'drop-shadow(0 0 5px var(--accent-color))' }} /> : <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}></div>}
        </div>
    </div>
);

const FaqItem = ({ question, answer }: any) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className={`font-medium transition-colors ${isOpen ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{question}</span>
                <HelpCircle className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--accent-color)]' : 'text-[var(--text-tertiary)]'}`} />
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                className="overflow-hidden"
            >
                <p className="text-sm pb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {answer}
                </p>
            </motion.div>
        </div>
    );
};

export default function PricingPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleCheckout = async (priceId: string) => {
        if (authLoading) {
            toast.info('Aguarde, validando sua sessão...');
            return;
        }

        if (!user) {
            toast.info('Faça login para continuar com a assinatura.');
            navigate('/login');
            return;
        }

        setIsCheckoutLoading(true);
        try {
            if (!priceId) {
                toast.error('Preço inválido');
                return;
            }
            toast.loading('Redirecionando para pagamento...');
            await redirectToCheckout(priceId, 'subscription');
        } catch (error) {
            console.error('Erro no checkout:', error);
            toast.error('Erro ao iniciar pagamento. Tente novamente.');
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    return (
        <div className="min-h-screen selection:bg-[var(--accent-color-alpha-more)] font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <Navbar />

            {/* HERO SECTION */}
            <section className="pt-40 pb-16 px-6 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-widest mb-8" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                        <TrendingDown className="w-3 h-3 text-[var(--status-success)]" />
                        Redução de Risco
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
                        Quanto vale decidir com <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]/80">método?</span>
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto font-light mb-12" style={{ color: 'var(--text-secondary)' }}>
                        Escolha o plano ideal para estruturar decisões estratégicas com clareza, profundidade e execução.
                    </p>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-center gap-4 mb-12 select-none">
                        <span className={`text-sm font-medium cursor-pointer transition-colors ${billingPeriod === 'monthly' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} onClick={() => setBillingPeriod('monthly')}>Mensal</span>
                        <div
                            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                            className="w-14 h-7 rounded-full relative p-1 transition-colors cursor-pointer"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                            <motion.div
                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                animate={{ x: billingPeriod === 'annual' ? 28 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </div>
                        <span className={`text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors ${billingPeriod === 'annual' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} onClick={() => setBillingPeriod('annual')}>
                            Anual
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide" style={{ color: 'var(--status-success)', backgroundColor: 'var(--status-success-bg)', borderColor: 'var(--status-success-bg)' }}>
                                -20%
                            </span>
                        </span>
                    </div>
                </motion.div>
            </section>

            {/* PRICING CARDS */}
            <section className="pb-32 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6 items-start max-w-6xl mx-auto">
                    <PricingCard
                        title="Free"
                        priceMonthly={0}
                        priceAnnual={0}
                        billingPeriod={billingPeriod}
                        priceIdMonthly={null}
                        priceIdAnnual={null}
                        onCheckout={null}
                        description="Para experimentar o sistema e estruturar suas primeiras decisões."
                        buttonText="Começar gratuitamente"
                        features={[
                            "10 créditos por mês",
                            "3 sessões no DecisionForge",
                            "1 Execution Plan ativo",
                            "Dashboard estratégico básico",
                            "Central de Documentos (básica)",
                            "Sem Deep Mode"
                        ]}
                    />

                    <PricingCard
                        title="Builder"
                        priceMonthly={89}
                        priceAnnual={854}
                        billingPeriod={billingPeriod}
                        priceIdMonthly={PRICING_CONFIG.builder.priceIdMonthly}
                        priceIdAnnual={PRICING_CONFIG.builder.priceIdAnnual}
                        onCheckout={handleCheckout}
                        description="Para quem decide com frequência e executa com foco."
                        features={[
                            "120 créditos por mês",
                            "Deep Mode habilitado",
                            "Execution Plans ilimitados",
                            "Risk Alerts inteligentes",
                            "Análise automática de documentos",
                            "Histórico completo de decisões",
                            "Memória estratégica evolutiva"
                        ]}
                        buttonText="Expandir capacidade"
                        isPopular={true}
                        delay={0.1}
                    />

                    <PricingCard
                        title="Strategic"
                        priceMonthly={179}
                        priceAnnual={1718}
                        billingPeriod={billingPeriod}
                        priceIdMonthly={PRICING_CONFIG.strategic.priceIdMonthly}
                        priceIdAnnual={PRICING_CONFIG.strategic.priceIdAnnual}
                        onCheckout={handleCheckout}
                        description="Para decisões críticas e profundidade estratégica contínua."
                        features={[
                            "300 créditos por mês",
                            "Deep Mode ilimitado",
                            "Simulação estratégica",
                            "Relatório mensal automático de DNA",
                            "Insights prioritários",
                            "Exportação completa de histórico",
                            "Processamento prioritário"
                        ]}
                        buttonText="Evoluir para Strategic"
                        delay={0.2}
                    />
                </div>
            </section>

            {/* CREDITS EXPLANATION - Moved up */}
            <section className="py-24 px-6 max-w-4xl mx-auto text-center border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Você não paga por mensagens</h2>
                    <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>Você paga por <span style={{ color: 'var(--accent-color)' }} className="font-medium">decisões estruturadas</span>.</p>
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                    {[
                        { label: "Sessão Padrão", cost: 1, icon: Brain },
                        { label: "Deep Mode", cost: 3, icon: Layers },
                        { label: "Processar Doc", cost: 2, icon: Zap },
                        { label: "Execution Plan", cost: 2, icon: Target },
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-xl border flex flex-col items-center gap-3 transition-colors" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                            <item.icon className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
                            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                            <div className="px-3 py-1 text-xs font-bold rounded-full border" style={{ color: 'var(--accent-color)', backgroundColor: 'var(--accent-color-alpha)', borderColor: 'var(--accent-color-alpha-more)' }}>
                                {item.cost} crédito{item.cost > 1 && 's'}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-sm mt-8" style={{ color: 'var(--text-tertiary)' }}>Os créditos renovam mensalmente conforme seu plano ativo.</p>
            </section>

            {/* COMPARISON TABLE */}
            <section className="py-24 border-y" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>A diferença estrutural</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Por que TaskForge entrega resultado superior.</p>
                    </div>

                    <div className="rounded-2xl border p-8 shadow-2xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        <div className="grid grid-cols-3 mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-tertiary)' }}>Capacidade</div>
                            <div className="text-xs uppercase tracking-wider font-bold text-center" style={{ color: 'var(--text-tertiary)' }}>Ferramentas Genéricas</div>
                            <div className="text-xs uppercase tracking-wider font-bold text-center" style={{ color: 'var(--accent-color)' }}>TaskForge</div>
                        </div>

                        <FeatureRow label="Respostas rápidas (Chat)" generic={true} taskforge={true} />
                        <FeatureRow label="Estrutura lógica validada" generic={false} taskforge={true} />
                        <FeatureRow label="Memória estratégica contínua" generic={false} taskforge={true} />
                        <FeatureRow label="Análise de risco de 2ª ordem" generic={false} taskforge={true} />
                        <FeatureRow label="Execução por prioridade" generic={false} taskforge={true} />
                        <FeatureRow label="Evolução decisória medida" generic={false} taskforge={true} />
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 px-6 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-12 text-center" style={{ color: 'var(--text-primary)' }}>Perguntas Frequentes</h2>
                <div className="space-y-4">
                    <FaqItem
                        question="Posso cancelar a qualquer momento?"
                        answer="Sim. Não há fidelidade ou contratos de retenção. Você tem total liberdade sobre sua assinatura."
                    />
                    <FaqItem
                        question="Posso mudar de plano depois?"
                        answer="Sim. Você pode fazer upgrade ou downgrade a qualquer momento através do seu painel de configurações. O ajuste de valor é calculado automaticamente."
                    />
                    <FaqItem
                        question="O que acontece se meus créditos acabarem?"
                        answer="Seus créditos renovam automaticamente no início de cada ciclo mensal. Se precisar de mais capacidade antes da renovação, você pode fazer um upgrade de plano imediato."
                    />
                    <FaqItem
                        question="Os créditos acumulam?"
                        answer="Não. Os créditos são renovados mensalmente de acordo com o plano ativo para garantir a previsibilidade e disponibilidade do sistema."
                    />
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-32 text-center px-6 border-t relative overflow-hidden" style={{ background: 'linear-gradient(to top, var(--bg-tertiary), var(--bg-primary))', borderColor: 'var(--border-color)' }}>
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[var(--accent-color)]/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Sua próxima decisão merece método.</h2>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-10 py-5 text-white font-bold rounded-xl text-xl transition-all shadow-xl inline-flex items-center gap-2 mb-6 hover:-translate-y-1 hover:brightness-110"
                        style={{ backgroundColor: 'var(--accent-color)', boxShadow: '0 20px 25px -5px var(--accent-color-alpha)' }}
                    >
                        Começar gratuitamente
                        <ArrowRight className="w-6 h-6" />
                    </button>
                    <p className="text-sm flex items-center justify-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                        <Shield className="w-4 h-4 text-[var(--status-success)]" />
                        Sem cartão de crédito. Estruture sua primeira decisão hoje.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-sm border-t" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                <p>&copy; {new Date().getFullYear()} TaskForge. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}