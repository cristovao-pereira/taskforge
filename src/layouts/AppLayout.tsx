import { ReactNode } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { UpgradeBanner, UpgradeModal } from '../components/UpgradeComponents';
import { NotificationBell } from '../components/NotificationBell';
import { UserMenu } from '../components/UserMenu';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useMetrics } from '../contexts/MetricsContext';
import { AnimatePresence, motion } from 'motion/react';

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const { deepMode } = usePreferences();
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
      ? 'bg-[var(--accent-color-alpha)] text-[var(--accent-color)] border-l-2 border-[var(--accent-color)] shadow-[inset_1px_0_0_0_var(--accent-color-alpha)]'
      : 'opacity-60 hover:opacity-100 hover:bg-[var(--nav-hover)] border-l-2 border-transparent';
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(to)}`}
      style={{ color: location.pathname === to ? undefined : 'var(--text-primary)' }}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span>{label}</span>
    </Link>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-4 mt-8 mb-3 text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--text-secondary)' }}>
      {label}
    </div>
  );

  return (
    <div className="flex h-screen font-sans overflow-hidden selection:bg-orange-500/30" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <nav className="w-64 border-r flex flex-col flex-shrink-0 z-20" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="TaskForge"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <SectionLabel label="Menu Principal" />
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
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Topbar */}
        <header className="h-16 border-b flex items-center justify-between px-8 backdrop-blur-sm sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', opacity: 0.9 }}>
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium opacity-60">Espaço de Trabalho / <span style={{ color: 'var(--text-primary)' }}>{getPageTitle()}</span></h1>
            {deepMode && (
              <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[var(--accent-color-alpha)] text-[var(--accent-color)] border border-[var(--accent-color)]/20 flex items-center gap-1">
                <Icons.Zap className="w-3 h-3" />
                Deep Mode On
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">

            {/* Strategic Mode Selector */}
            <div className="relative group">
              <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${getModeColor()} hover:bg-[var(--nav-hover)]`} style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Modo: {getModeLabel()}
                <Icons.ChevronDown className="w-3 h-3 opacity-50" />
              </button>

              <div className="absolute top-full right-0 mt-2 w-48 border rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-right" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <div className="p-1">
                  <button
                    onClick={() => setMode('conservador')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'conservador' ? 'bg-[var(--accent-color-alpha)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}
                  >
                    <span className="text-base">🛡️</span> Conservador
                  </button>
                  <button
                    onClick={() => setMode('equilibrado')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'equilibrado' ? 'bg-[var(--accent-color-alpha)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}
                  >
                    <span className="text-base">⚖️</span> Equilibrado
                  </button>
                  <button
                    onClick={() => setMode('expansao')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mode === 'expansao' ? 'bg-[var(--accent-color-alpha)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)]'}`}
                  >
                    <span className="text-base">🚀</span> Expansão
                  </button>
                </div>
              </div>
            </div>

            <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-color)' }}></div>

            <Link to="/app/status" className="flex items-center gap-2 px-3 py-1.5 rounded-full border hover:bg-[var(--nav-hover)] transition-colors" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${health.overallScore >= 75 ? 'bg-emerald-500' : health.overallScore >= 55 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Saúde: {health.overallScore}%</span>
            </Link>
            <NotificationBell />
            <UserMenu />
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className={`flex-1 min-h-0 ${isChat ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
          {!isChat && <UpgradeBanner />}
          {!isChat && !user && (
            <div className="max-w-6xl mx-auto px-8 pt-6">
              <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-2">Modo Visitante</p>
                    <h2 className="text-lg md:text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Você está navegando sem autenticação.</h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Entre na sua conta para sincronizar dados, histórico e métricas estratégicas.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to="/login" className="px-4 py-2 rounded-lg border hover:bg-[var(--nav-hover)] transition-colors text-sm font-medium" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                      Entrar
                    </Link>
                    <Link to="/signup" className="px-4 py-2 rounded-lg text-white transition-all transform hover:-translate-y-0.5 font-semibold text-sm shadow-lg shadow-[var(--accent-color)]/20" style={{ backgroundColor: 'var(--accent-color)' }}>
                      Criar conta
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={`${isChat ? 'h-full w-full' : 'max-w-6xl mx-auto p-8'}`}>
            <Outlet />
          </div>
        </div>
      </main>
      <UpgradeModal />
    </div>
  );
}
