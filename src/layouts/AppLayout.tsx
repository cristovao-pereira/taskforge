import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useMetrics } from '../contexts/MetricsContext';
import { AnimatePresence, motion } from 'motion/react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { mode, setMode, getModeLabel, getModeColor } = useStrategicMode();
  const { health } = useMetrics();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Visão Geral';
    if (path.includes('/chat')) return 'Chat IA';
    if (path.includes('/sessions')) return 'Sessões Estratégicas';
    if (path.includes('/plans')) return 'Planos de Execução';
    if (path.includes('/agent/decision')) return 'DecisionForge';
    if (path.includes('/agent/clarity')) return 'ClarityForge';
    if (path.includes('/agent/leverage')) return 'LeverageForge';
    if (path.includes('/dna')) return 'DNA Estratégico';
    if (path.includes('/map')) return 'Mapa de Decisões';
    if (path.includes('/risks')) return 'Alertas de Risco';
    if (path.includes('/billing')) return 'Faturamento';
    if (path.includes('/settings')) return 'Conta';
    return 'Visão Geral';
  };

  const isChat = location.pathname.includes('/chat');

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500' 
      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white border-l-2 border-transparent';
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(to)}`}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span>{label}</span>
    </Link>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 mt-8 mb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest opacity-80">
      {label}
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-orange-500/30">
      {/* Sidebar */}
      <nav className="w-64 border-r border-zinc-800 flex flex-col bg-[#0F0F0F] flex-shrink-0 z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Icons.Layers className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">TaskForge</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <div className="px-4 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest opacity-80">
            Menu Principal
          </div>
          <NavItem to="/app/dashboard" icon={Icons.LayoutDashboard} label="Dashboard" />

          <SectionLabel label="Inteligência" />
          <NavItem to="/app/agent/decision" icon={Icons.GitFork} label="DecisionForge" />
          <NavItem to="/app/agent/clarity" icon={Icons.Sparkles} label="ClarityForge" />
          <NavItem to="/app/agent/leverage" icon={Icons.Target} label="LeverageForge" />

          <SectionLabel label="Execução" />
          <NavItem to="/app/sessions" icon={Icons.Brain} label="Sessões Estratégicas" />
          <NavItem to="/app/plans" icon={Icons.ListTodo} label="Planos de Execução" />
          <NavItem to="/app/risks" icon={Icons.AlertTriangle} label="Alertas de Risco" />

          <SectionLabel label="Análise" />
          <NavItem to="/app/dna" icon={Icons.Fingerprint} label="DNA Estratégico" />
          <NavItem to="/app/documents" icon={Icons.Folder} label="Central de Documentos" />
          <NavItem to="/app/status" icon={Icons.Activity} label="Status do Sistema" />

          <SectionLabel label="Conta" />
          <NavItem to="/app/billing" icon={Icons.CreditCard} label="Faturamento" />
          <NavItem to="/app/settings" icon={Icons.User} label="Minha Conta" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-zinc-400">Espaço de Trabalho / <span className="text-white">{getPageTitle()}</span></h1>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Strategic Mode Selector */}
            <div className="relative group">
              <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${getModeColor()} bg-zinc-900/50 hover:bg-zinc-800`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Modo: {getModeLabel()}
                <Icons.ChevronDown className="w-3 h-3 opacity-50" />
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-right">
                <div className="p-1">
                  <button 
                    onClick={() => setMode('conservador')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'conservador' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
                  >
                    <span className="text-base">🛡️</span> Conservador
                  </button>
                  <button 
                    onClick={() => setMode('equilibrado')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'equilibrado' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
                  >
                    <span className="text-base">⚖️</span> Equilibrado
                  </button>
                  <button 
                    onClick={() => setMode('expansao')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'expansao' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
                  >
                    <span className="text-base">🚀</span> Expansão
                  </button>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-zinc-800"></div>

            <Link to="/app/status" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-full border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className={`w-2 h-2 rounded-full animate-pulse ${health.overallScore >= 75 ? 'bg-emerald-500' : health.overallScore >= 55 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-medium text-zinc-300">Saúde: {health.overallScore}%</span>
            </Link>
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors relative">
              <Icons.Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-zinc-900"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-zinc-500 flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className={`flex-1 min-h-0 ${isChat ? 'overflow-hidden' : 'overflow-y-auto p-8 custom-scrollbar'}`}>
          <div className={`${isChat ? 'h-full w-full' : 'max-w-6xl mx-auto'}`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
