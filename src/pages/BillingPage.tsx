import React from 'react';
import { Icons } from '../components/Icons';

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700">
      
      {/* Header */}
      <header className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4 shadow-2xl shadow-orange-500/5">
          <Icons.CreditCard className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Faturamento</h1>
        <p className="text-xl text-zinc-400 font-light">Controle sua capacidade estratégica.</p>
        <p className="text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Gerencie seus créditos, acompanhe seu consumo e ajuste seu plano conforme sua evolução.
        </p>
      </header>

      {/* Section 1: Account Summary */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl shadow-black/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          
          <div className="space-y-1">
            <div className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Saldo Atual</div>
            <div className="text-4xl font-bold text-white flex items-center gap-2">
              1.240
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
            <div className="text-xl font-semibold text-white">Profissional</div>
            <div className="text-xs text-zinc-500">Renova em 12 abr, 2026</div>
          </div>

          <div className="flex flex-col gap-3">
            <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
              <Icons.Plus className="w-4 h-4" />
              Comprar Créditos
            </button>
            <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg font-medium transition-all border border-zinc-700 hover:border-zinc-600">
              Alterar Plano
            </button>
          </div>

        </div>
      </section>

      {/* Section 2: Available Plans */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Icons.Layers className="w-4 h-4" />
            Planos Disponíveis
          </h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlanCard 
            title="Essencial" 
            credits="500" 
            features={[
              "Acesso básico aos agentes",
              "Histórico limitado (30 dias)",
              "Suporte por email"
            ]}
          />
          <PlanCard 
            title="Profissional" 
            credits="2.000" 
            current={true}
            features={[
              "Acesso completo aos agentes",
              "Histórico ilimitado",
              "Strategic DNA avançado",
              "Suporte prioritário"
            ]}
          />
          <PlanCard 
            title="Estratégico" 
            credits="5.000" 
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
      <section className="space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Icons.Package className="w-4 h-4" />
            Pacotes de Créditos Avulsos
          </h2>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CreditPack amount="500" price="R$ 49,90" />
          <CreditPack amount="1.000" price="R$ 89,90" popular={true} />
          <CreditPack amount="5.000" price="R$ 399,90" />
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
                />
                <TransactionRow 
                  date="05 Fev, 2026" 
                  type="Compra de Créditos (Avulso)" 
                  value="R$ 49,90" 
                  credits="+500"
                />
                <TransactionRow 
                  date="12 Fev, 2026" 
                  type="Renovação Plano Profissional" 
                  value="R$ 199,90" 
                  credits="+2.000"
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

function PlanCard({ title, credits, features, current }: any) {
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
      
      <div className="h-px w-full bg-zinc-800 my-6"></div>
      
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
            <Icons.Check className={`w-4 h-4 mt-0.5 ${current ? 'text-orange-500' : 'text-zinc-600'}`} />
            {feature}
          </li>
        ))}
      </ul>
      
      <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
        current 
          ? 'bg-zinc-800 text-zinc-400 cursor-default' 
          : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
      }`}>
        {current ? 'Plano Selecionado' : 'Selecionar Plano'}
      </button>
    </div>
  );
}

function CreditPack({ amount, price, popular }: any) {
  return (
    <div className={`p-6 rounded-xl border flex flex-col items-center text-center transition-all hover:-translate-y-1 ${
      popular 
        ? 'bg-zinc-900 border-zinc-700 shadow-lg shadow-black/40' 
        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4">
        <Icons.Coins className="w-6 h-6 text-zinc-400" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{amount}</div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Créditos</div>
      <div className="text-xl font-semibold text-zinc-300 mb-6">{price}</div>
      
      <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-zinc-700">
        Comprar
      </button>
    </div>
  );
}

function TransactionRow({ date, type, value, credits }: any) {
  return (
    <tr className="hover:bg-zinc-900/50 transition-colors">
      <td className="px-6 py-4 text-zinc-300">{date}</td>
      <td className="px-6 py-4">
        <div className="text-zinc-200 font-medium">{type}</div>
        <div className="text-xs text-emerald-500">{credits} créditos</div>
      </td>
      <td className="px-6 py-4 text-zinc-400">{value}</td>
      <td className="px-6 py-4 text-right">
        <button className="text-zinc-500 hover:text-white transition-colors">
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
