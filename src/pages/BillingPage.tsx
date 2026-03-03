import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icons } from '../components/Icons';
import { SyncPlanButton } from '../components/SyncPlanButton';
import { toast } from 'sonner';
import { getSubscriptionStatus, redirectToCheckout } from '../lib/checkout';
import { useAuth } from '../contexts/AuthContext';

// Stripe Product & Price IDs
const STRIPE_PLANS = {
  essencial: {
    productId: 'prod_U4X21x0lWIvsHW',
    priceId: 'price_1T6O7HBNgnXewP8Me1hVETGA',
    priceIdAnnual: null,
    price: 'Gratuito',
    credits: 500
  },
  profissional: {
    productId: 'prod_U4X5DxJ5ZGRfab',
    priceId: 'price_1T6O6QBNgnXewP8Mude8pCy8',
    priceIdAnnual: 'price_1T6ti6BNgnXewP8MHiXe6rWf',
    price: 'R$ 199,90',
    priceAnnual: 'R$ 1.999,00',
    credits: 2000
  },
  estrategico: {
    productId: 'prod_U4X2cEVz8fot8E',
    priceId: 'price_1T6O6XBNgnXewP8M5BxqsMGU',
    priceIdAnnual: 'price_1T6ti6BNgnXewP8MoFcPDbUv',
    price: 'R$ 499,90',
    priceAnnual: 'R$ 4.999,00',
    credits: 5000
  }
};

const STRIPE_PACKS = {
  pack500: {
    productId: 'prod_U4X649HDijgUp9',
    priceId: 'price_1T6O6bBNgnXewP8MulEJ7pza',
    price: 'R$ 49,90',
    credits: 500
  },
  pack1000: {
    productId: 'prod_U4WyTFXH37OzjB',
    priceId: 'price_1T6O5OBNgnXewP8MlJvNPkU6',
    price: 'R$ 89,90',
    credits: 1000
  },
  pack5000: {
    productId: 'prod_U4Wxoaf7DYuZiJ',
    priceId: 'price_1T6O5RBNgnXewP8MSKndCTN0',
    price: 'R$ 399,90',
    credits: 5000
  }
};

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<'essencial' | 'profissional' | 'estrategico' | null>(null);
  const [credits, setCredits] = useState(0);
  const plansSectionRef = useRef<HTMLElement | null>(null);
  const packsSectionRef = useRef<HTMLElement | null>(null);

  const planByPriceId = useMemo(
    () => ({
      [STRIPE_PLANS.essencial.priceId]: 'essencial',
      [STRIPE_PLANS.profissional.priceId]: 'profissional',
      [STRIPE_PLANS.estrategico.priceId]: 'estrategico',
    } as Record<string, 'essencial' | 'profissional' | 'estrategico'>),
    []
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setCurrentPlan(null);
      setCredits(0);
      setIsLoadingSubscription(false);
      return;
    }

    const loadSubscription = async () => {
      try {
        setIsLoadingSubscription(true);
        const status = await getSubscriptionStatus();
        const normalizedPlan = status.subscription?.plan;
        const priceId = status.subscription?.priceId;
        setCredits(status.credits || 0);

        if (normalizedPlan) {
          setCurrentPlan(normalizedPlan);
        } else if (priceId && planByPriceId[priceId]) {
          setCurrentPlan(planByPriceId[priceId]);
        } else {
          setCurrentPlan(null);
        }
      } catch (error) {
        console.error('Erro ao carregar assinatura:', error);
        setCurrentPlan(null);
        setCredits(0);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    loadSubscription();
  }, [authLoading, user, planByPriceId]);

  const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment', planName: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    toast.loading(`Redirecionando para pagamento...`);
    
    try {
      await redirectToCheckout(priceId, mode);
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
      setIsLoading(false);
    }
  };

  const formattedCredits = credits.toLocaleString('pt-BR');

  const scrollToPlans = () => {
    plansSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToPacks = () => {
    packsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700">
      
      {/* Header */}
      <header className="text-left space-y-4 pt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4 shadow-2xl shadow-orange-500/5">
          <Icons.CreditCard className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Faturamento</h1>
        <p className="text-xl text-zinc-400 font-light">Controle sua capacidade estratégica.</p>
        <p className="text-sm text-zinc-500 max-w-lg leading-relaxed">
          Gerencie seus créditos, acompanhe seu consumo e ajuste seu plano conforme sua evolução.
        </p>
      </header>

      {/* Section 1: Account Summary */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl shadow-black/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          
          <div className="space-y-1">
            <div className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Saldo Atual</div>
            <div className="text-4xl font-bold text-white flex items-center gap-2">
              {formattedCredits}
              <Icons.Coins className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-xs text-zinc-500">créditos disponíveis</div>
          </div>

          <div className="space-y-1 border-l border-zinc-800 pl-8 md:block hidden">
            <div className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Consumo (30d)</div>
            <div className="text-2xl font-semibold text-zinc-200 flex items-center gap-2">
              320
              <Icons.TrendingDown className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xs text-zinc-500">créditos utilizados</div>
          </div>

          <div className="space-y-1 border-l border-zinc-800 pl-8 md:block hidden">
            <div className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Plano Atual</div>
            <div className="text-xl font-semibold text-white">
              {currentPlan === 'estrategico' ? 'Estratégico' : currentPlan === 'profissional' ? 'Profissional' : currentPlan === 'essencial' ? 'Essencial' : 'Sem plano ativo'}
            </div>
            <div className="text-xs text-zinc-500">Renova em 12 abr, 2026</div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={scrollToPacks} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              <Icons.Plus className="w-4 h-4" />
              Comprar Créditos
            </button>
            <button onClick={scrollToPlans} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg font-medium transition-all border border-zinc-700 hover:border-zinc-600">
              Alterar Plano
            </button>
            <SyncPlanButton />
          </div>

        </div>
      </section>

      {/* Section 2: Available Plans */}
      <section ref={plansSectionRef} className="space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Icons.Layers className="w-4 h-4" />
            Planos Disponíveis
          </h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
            >
              Anual
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                2 MESES OFF
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlanCard 
            title="Essencial" 
            credits="500" 
            price={STRIPE_PLANS.essencial.price}
            priceId={STRIPE_PLANS.essencial.priceId}
            productId={STRIPE_PLANS.essencial.productId}
            period="/mês"
            current={currentPlan === 'essencial'}
            isLoading={isLoading || isLoadingSubscription}
            onSelect={() => currentPlan === 'essencial' ? toast.info('Este já é seu plano atual.') : handleCheckout(STRIPE_PLANS.essencial.priceId, 'subscription', 'Essencial')}
            features={[
              "Acesso básico aos agentes",
              "Histórico limitado (30 dias)",
              "Suporte por email"
            ]}
          />
          <PlanCard 
            title="Profissional" 
            credits="2.000" 
            price={billingCycle === 'monthly' ? STRIPE_PLANS.profissional.price : STRIPE_PLANS.profissional.priceAnnual}
            priceId={billingCycle === 'monthly' ? STRIPE_PLANS.profissional.priceId : STRIPE_PLANS.profissional.priceIdAnnual}
            productId={STRIPE_PLANS.profissional.productId}
            period={billingCycle === 'monthly' ? '/mês' : '/ano'}
            current={currentPlan === 'profissional'}
            isLoading={isLoading || isLoadingSubscription}
            onSelect={() => currentPlan === 'profissional' ? toast.info('Este já é seu plano atual.') : handleCheckout(billingCycle === 'monthly' ? STRIPE_PLANS.profissional.priceId : STRIPE_PLANS.profissional.priceIdAnnual!, 'subscription', 'Profissional')}
            features={[
              "Acesso completo aos agentes",
              "Histórico ilimitado",
              "DNA Estratégico avançado",
              "Suporte prioritário"
            ]}
          />
          <PlanCard 
            title="Estratégico" 
            credits="5.000" 
            price={billingCycle === 'monthly' ? STRIPE_PLANS.estrategico.price : STRIPE_PLANS.estrategico.priceAnnual}
            priceId={billingCycle === 'monthly' ? STRIPE_PLANS.estrategico.priceId : STRIPE_PLANS.estrategico.priceIdAnnual}
            productId={STRIPE_PLANS.estrategico.productId}
            period={billingCycle === 'monthly' ? '/mês' : '/ano'}
            current={currentPlan === 'estrategico'}
            isLoading={isLoading || isLoadingSubscription}
            onSelect={() => currentPlan === 'estrategico' ? toast.info('Este já é seu plano atual.') : handleCheckout(billingCycle === 'monthly' ? STRIPE_PLANS.estrategico.priceId : STRIPE_PLANS.estrategico.priceIdAnnual!, 'subscription', 'Estratégico')}
            features={[
              "Maior volume de créditos",
              "Prioridade de processamento",
              "Recursos futuros antecipados",
              "Gerente de conta dedicado"
            ]}
          />
        </div>
      </section>

      {/* Section 3: Credit Packs */}
      <section ref={packsSectionRef} className="space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Icons.Package className="w-4 h-4" />
            Pacotes de Créditos Avulsos
          </h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CreditPack 
            amount="500" 
            price={STRIPE_PACKS.pack500.price}
            priceId={STRIPE_PACKS.pack500.priceId}
            productId={STRIPE_PACKS.pack500.productId}
            isLoading={isLoading}
            onBuy={() => handleCheckout(STRIPE_PACKS.pack500.priceId, 'payment', 'Pacote 500')} 
          />
          <CreditPack 
            amount="1.000" 
            price={STRIPE_PACKS.pack1000.price}
            priceId={STRIPE_PACKS.pack1000.priceId}
            productId={STRIPE_PACKS.pack1000.productId}
            popular={true}
            isLoading={isLoading} 
            onBuy={() => handleCheckout(STRIPE_PACKS.pack1000.priceId, 'payment', 'Pacote 1000')} 
          />
          <CreditPack 
            amount="5.000" 
            price={STRIPE_PACKS.pack5000.price}
            priceId={STRIPE_PACKS.pack5000.priceId}
            productId={STRIPE_PACKS.pack5000.productId}
            isLoading={isLoading}
            onBuy={() => handleCheckout(STRIPE_PACKS.pack5000.priceId, 'payment', 'Pacote 5000')} 
          />
        </div>
        
        <p className="text-center text-xs text-zinc-500 italic">
          * Créditos não expiram enquanto o plano estiver ativo.
        </p>
      </section>

      {/* Section 4 & 5: History & Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Icons.History className="w-4 h-4" />
              Histórico de Transações
            </h2>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium text-right">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <TransactionRow 
                  date="12 Mar, 2026" 
                  type="Renovação Plano Profissional" 
                  value="R$ 199,90" 
                  credits="+2.000"
                  onReceipt={() => toast.info('Recibo disponível para download em breve.')}
                />
                <TransactionRow 
                  date="05 Fev, 2026" 
                  type="Compra de Créditos (Avulso)" 
                  value="R$ 49,90" 
                  credits="+500"
                  onReceipt={() => toast.info('Recibo disponível para download em breve.')}
                />
                <TransactionRow 
                  date="12 Fev, 2026" 
                  type="Renovação Plano Profissional" 
                  value="R$ 199,90" 
                  credits="+2.000"
                  onReceipt={() => toast.info('Recibo disponível para download em breve.')}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Consumption by Agent */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Icons.PieChart className="w-4 h-4" />
              Consumo por Agente
            </h2>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            <ConsumptionItem 
              agent="DecisionForge" 
              credits="145" 
              percentage={45} 
              color="bg-purple-500" 
              icon={Icons.GitFork}
            />
            <ConsumptionItem 
              agent="ClarityForge" 
              credits="95" 
              percentage={30} 
              color="bg-blue-500" 
              icon={Icons.Sparkles}
            />
            <ConsumptionItem 
              agent="LeverageForge" 
              credits="80" 
              percentage={25} 
              color="bg-orange-500" 
              icon={Icons.Target}
            />
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center space-y-8 pt-12 border-t border-zinc-900">
        <div className="space-y-2">
          <p className="text-xl font-serif italic text-zinc-400">"Inteligência aplicada com consistência gera vantagem cumulativa."</p>
        </div>
      </footer>

    </div>
  );
}

function PlanCard({ title, credits, price, priceId, productId, features, current, isLoading, onSelect, period = '/mês' }: any) {
  return (
    <div className={`p-6 rounded-2xl border flex flex-col h-full transition-all ${
      current 
        ? 'bg-zinc-900 border-orange-500/50 shadow-lg shadow-orange-500/5 relative overflow-hidden' 
        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
    }`}>
      {current && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
          Atual
        </div>
      )}
      
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <div className="text-3xl font-bold text-zinc-200 mb-1 flex items-baseline gap-1">
        {credits}
        <span className="text-sm font-normal text-zinc-500">créditos/mês</span>
      </div>
      <div className="text-lg font-semibold text-orange-500 mb-4">{price}<span className="text-xs text-zinc-500">{period}</span></div>
      
      <div className="h-px w-full bg-zinc-800 my-6"></div>
      
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
            <Icons.Check className={`w-4 h-4 mt-0.5 ${current ? 'text-orange-500' : 'text-zinc-600'}`} />
            {feature}
          </li>
        ))}
      </ul>
      
      <button 
        onClick={onSelect} 
        data-price-id={priceId}
        data-product-id={productId}
        disabled={current || isLoading}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          current 
            ? 'bg-zinc-800 text-zinc-400 cursor-default' 
            : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
        }`}
      >
        {isLoading ? 'Processando...' : current ? 'Plano Selecionado' : 'Selecionar Plano'}
      </button>
    </div>
  );
}

function CreditPack({ amount, price, priceId, productId, popular, isLoading, onBuy }: any) {
  return (
    <div className={`p-6 rounded-xl border flex flex-col items-center text-center transition-all hover:-translate-y-1 ${
      popular 
        ? 'bg-zinc-900 border-zinc-700 shadow-lg shadow-black/40' 
        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
    }`}>
      {popular && (
        <div className="mb-3 bg-orange-500/10 border border-orange-500/30 text-orange-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
          Mais Popular
        </div>
      )}
      <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4">
        <Icons.Coins className="w-6 h-6 text-zinc-400" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{amount}</div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Créditos</div>
      <div className="text-xl font-semibold text-zinc-300 mb-6">{price}</div>
      
      <button 
        onClick={onBuy}
        data-price-id={priceId}
        data-product-id={productId}
        disabled={isLoading}
        className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processando...' : 'Comprar'}
      </button>
    </div>
  );
}

function TransactionRow({ date, type, value, credits, onReceipt }: any) {
  return (
    <tr className="hover:bg-zinc-900/50 transition-colors">
      <td className="px-6 py-4 text-zinc-300">{date}</td>
      <td className="px-6 py-4">
        <div className="text-zinc-200 font-medium">{type}</div>
        <div className="text-xs text-emerald-500">{credits} créditos</div>
      </td>
      <td className="px-6 py-4 text-zinc-400">{value}</td>
      <td className="px-6 py-4 text-right">
        <button onClick={onReceipt} className="text-zinc-500 hover:text-white transition-colors">
          <Icons.Receipt className="w-4 h-4 ml-auto" />
        </button>
      </td>
    </tr>
  );
}

function ConsumptionItem({ agent, credits, percentage, color, icon: Icon }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-300">{agent}</span>
        </div>
        <div className="text-xs text-zinc-500">{credits} créditos ({percentage}%)</div>
      </div>
      <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
