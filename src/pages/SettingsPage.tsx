import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { deleteUserAccount } from '../lib/api';

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, icon: Icon }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((opt: any) => opt.value === value);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-zinc-950/50 border ${isOpen ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' : 'border-zinc-800'} rounded-xl p-4 text-left text-white flex items-center justify-between transition-all outline-none`}
            >
                <span className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
                    {selectedOption?.label}
                </span>
                <Icons.ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 w-full mt-2 bg-[#1e293b] border border-zinc-700 rounded-xl shadow-xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {options.map((option: any) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`p-3 px-4 cursor-pointer flex items-center justify-between transition-colors ${value === option.value
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                {option.icon && <option.icon className="w-4 h-4 opacity-70" />}
                                {option.label}
                            </span>
                            {value === option.value && <Icons.Check className="w-4 h-4" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function SettingsPage() {
    const navigate = useNavigate();
    const { setMode } = useStrategicMode();
    const { getIdToken, logout, deleteAccount } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Deletion State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);

    // Account status (credits, plan, deletion schedule)
    const [accountStatus, setAccountStatus] = useState<{
        credits: number;
        plan: string;
        isScheduledForDeletion: boolean;
        scheduledDeletionDate: string | null;
        subscription: { status: string; currentPeriodEnd?: string; cancelAtPeriodEnd?: boolean } | null;
    } | null>(null);

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        company: '',
        role: '',
        objective: '',
        strategicMode: 'equilibrado',
        deepMode: true,
        alertSensitivity: 'normal',
        notifications: {
            emailCritical: true,
            weeklyReport: true,
            sessionReminder: false,
            pendingSuggestions: true
        }
    });

    // Credits State
    const [credits, setCredits] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getIdToken();
                if (!token) {
                    console.error('No auth token available');
                    setLoading(false);
                    return;
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                };

                const [profileRes, creditsRes] = await Promise.all([
                    fetch('/api/user/profile', { headers }),
                    fetch('/api/user/credits', { headers })
                ]);

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    // Map backend profile to UI format
                    setProfile({
                        name: profileData.name || '',
                        email: profileData.email || '',
                        company: 'Company', // Not in backend yet
                        role: 'User', // Not in backend yet
                        objective: profileData.objective || '',
                        strategicMode: profileData.strategicMode || 'equilibrado',
                        deepMode: true,
                        alertSensitivity: 'normal',
                        notifications: {
                            emailCritical: true,
                            weeklyReport: true,
                            sessionReminder: false,
                            pendingSuggestions: true
                        }
                    });
                }

                if (creditsRes.ok) {
                    const creditsData = await creditsRes.json();
                    setCredits(creditsData);
                }

                // Fetch account status
                const statusRes = await fetch('/api/user/account-status', { headers });
                if (statusRes.ok) {
                    setAccountStatus(await statusRes.json());
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [getIdToken]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getIdToken();
            if (!token) {
                toast.error('Não autenticado');
                return;
            }

            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profile.name,
                    objective: profile.objective,
                    strategicMode: profile.strategicMode,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }

            // Update context if mode changed
            setMode(profile.strategicMode as any);

            toast.success('⚙️ Configurações salvas!');
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    const toggleNotification = (key: string) => {
        setProfile(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key as keyof typeof prev.notifications]
            }
        }));
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'EXCLUIR') {
            toast.error('Digite EXCLUIR para confirmar.');
            return;
        }

        setIsDeleting(true);
        try {
            const token = await getIdToken();
            if (!token) throw new Error('Not authenticated');

            // Soft delete: marks account for deletion in 30 days, cancels Stripe at period end
            const res = await fetch('/api/user/account', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to schedule account deletion');

            const data = await res.json();

            // Sign out from Firebase
            await logout();

            toast.success('Conta agendada para exclusão. Você tem 30 dias para reativar.', { duration: 6000 });
            navigate('/login');
        } catch (error: any) {
            console.error('Error scheduling account deletion:', error);
            toast.error('Erro ao agendar exclusão. Tente novamente.');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setDeleteConfirmText('');
        }
    };

    const handleReactivateAccount = async () => {
        setIsReactivating(true);
        try {
            const token = await getIdToken();
            if (!token) throw new Error('Not authenticated');

            const res = await fetch('/api/user/reactivate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to reactivate account');

            setAccountStatus(prev => prev ? { ...prev, isScheduledForDeletion: false, scheduledDeletionDate: null } : null);
            toast.success('Conta reativada com sucesso! Bem-vindo de volta.');
        } catch (error) {
            console.error('Error reactivating account:', error);
            toast.error('Erro ao reativar conta. Tente novamente.');
        } finally {
            setIsReactivating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Icons.Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-700 space-y-12">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Minha Conta</h1>
                    <p className="text-lg text-zinc-400 font-light">Gerencie seu perfil estratégico e preferências do sistema.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${profile.deepMode ? 'bg-emerald-500' : 'bg-zinc-500'}`}></div>
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        {profile.deepMode ? 'Deep Mode Ativo' : 'Deep Mode Inativo'}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Profile & Strategy */}
                <div className="lg:col-span-2 space-y-8">

                    {/* SEÇÃO 1: PERFIL */}
                    <section className="bg-[#1e293b] border border-zinc-800 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-black/20 group hover:border-zinc-700 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                                    <Icons.User className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide">Perfil Profissional</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email Corporativo</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full bg-zinc-950/30 border border-zinc-800/50 rounded-xl p-4 text-zinc-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Empresa</label>
                                    <input
                                        type="text"
                                        value={profile.company}
                                        onChange={e => setProfile({ ...profile, company: e.target.value })}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Cargo</label>
                                    <input
                                        type="text"
                                        value={profile.role}
                                        onChange={e => setProfile({ ...profile, role: e.target.value })}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Objetivo Estratégico Principal</label>
                                    <textarea
                                        value={profile.objective}
                                        onChange={e => setProfile({ ...profile, objective: e.target.value })}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-white h-32 resize-none placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all leading-relaxed"
                                        placeholder="Ex: Dobrar o faturamento em 12 meses..."
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 2: PREFERÊNCIAS ESTRATÉGICAS */}
                    <section className="bg-[#1e293b] border border-zinc-800 rounded-3xl p-8 shadow-xl shadow-black/20 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                                <Icons.Settings className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Preferências do Sistema</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Modo Estratégico Padrão</label>
                                <CustomDropdown
                                    value={profile.strategicMode}
                                    onChange={(val: string) => setProfile({ ...profile, strategicMode: val })}
                                    options={[
                                        { value: 'conservador', label: 'Conservador', icon: Icons.Shield },
                                        { value: 'equilibrado', label: 'Equilibrado', icon: Icons.Scale },
                                        { value: 'expansao', label: 'Expansão', icon: Icons.TrendingUp }
                                    ]}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Sensibilidade de Alertas</label>
                                <CustomDropdown
                                    value={profile.alertSensitivity}
                                    onChange={(val: string) => setProfile({ ...profile, alertSensitivity: val })}
                                    options={[
                                        { value: 'normal', label: 'Normal', icon: Icons.Bell },
                                        { value: 'alta', label: 'Alta (Qualquer desvio)', icon: Icons.AlertTriangle }
                                    ]}
                                />
                            </div>

                            <div className="col-span-full mt-4 p-5 bg-zinc-950/30 border border-zinc-800/50 rounded-2xl flex items-center justify-between group hover:bg-zinc-950/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${profile.deepMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                        <Icons.Brain className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Deep Mode</h3>
                                        <p className="text-xs text-zinc-500">Análise profunda e correlacionada de todos os eventos.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setProfile({ ...profile, deepMode: !profile.deepMode })}
                                    className={`w-14 h-7 rounded-full transition-all duration-300 relative ${profile.deepMode ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${profile.deepMode ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Notifications, Credits, Security */}
                <div className="space-y-8">

                    {/* SEÇÃO 4: CRÉDITOS (Widget Style) */}
                    <section className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-zinc-800 rounded-3xl p-6 shadow-xl shadow-black/20">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Saldo de Créditos</h2>
                            <button onClick={() => navigate('/app/billing')} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                Gerenciar <Icons.ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="text-center mb-8">
                            <div className="text-5xl font-bold text-white mb-2 tracking-tight">{credits?.balance || 0}</div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
                                <Icons.TrendingUp className="w-3 h-3" /> +500 este mês
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest px-1">Consumo por Agente</p>
                            {credits?.usageByAgent.map((agent: any) => (
                                <div key={agent.name} className="group">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-zinc-300 font-medium">{agent.name}</span>
                                        <span className="text-zinc-500 group-hover:text-white transition-colors">{agent.value}%</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${agent.value}%`, backgroundColor: agent.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-zinc-800/50">
                            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3 px-1">Últimas Transações</p>
                            <div className="space-y-3">
                                {credits?.history.slice(0, 3).map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.amount > 0 ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                                            {item.desc}
                                        </div>
                                        <span className={`font-medium ${item.amount > 0 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                            {item.amount > 0 ? '+' : ''}{item.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 3: NOTIFICAÇÕES */}
                    <section className="bg-[#1e293b] border border-zinc-800 rounded-3xl p-6 shadow-xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                                <Icons.Bell className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Notificações</h2>
                        </div>

                        <div className="space-y-1">
                            {[
                                { key: 'emailCritical', label: 'Alertas Críticos por Email' },
                                { key: 'weeklyReport', label: 'Relatório Semanal de DNA' },
                                { key: 'sessionReminder', label: 'Lembrete de Sessões' },
                                { key: 'pendingSuggestions', label: 'Novas Sugestões' }
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-3 hover:bg-zinc-800/30 rounded-xl transition-colors cursor-pointer" onClick={() => toggleNotification(item.key)}>
                                    <span className="text-sm text-zinc-300">{item.label}</span>
                                    <div className={`w-9 h-5 rounded-full transition-colors relative ${profile.notifications[item.key as keyof typeof profile.notifications] ? 'bg-purple-500' : 'bg-zinc-700'}`}>
                                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${profile.notifications[item.key as keyof typeof profile.notifications] ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SEÇÃO 5: SEGURANÇA */}
                    <section className="bg-[#1e293b] border border-zinc-800 rounded-3xl p-6 shadow-xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                <Icons.Shield className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Segurança</h2>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => toast.info('Use o fluxo de recuperação de senha na tela de login.')}
                                className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Icons.Key className="w-4 h-4" /> Alterar Senha
                            </button>
                            <button
                                onClick={async () => {
                                    await logout();
                                    navigate('/login');
                                }}
                                className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-xl text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Icons.LogOut className="w-4 h-4" /> Sair de todos os dispositivos
                            </button>
                        </div>
                    </section>

                    {/* SEÇÃO 6: ZONA DE PERIGO */}
                    <section className="bg-[#1e293b] border border-red-500/20 rounded-3xl p-6 shadow-xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                                <Icons.AlertTriangle className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-red-400 uppercase tracking-wide">Zona de Perigo</h2>
                        </div>

                        {/* Reactivation Banner */}
                        {accountStatus?.isScheduledForDeletion && (
                            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                                <div className="flex items-start gap-3">
                                    <Icons.AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-amber-300 mb-1">Conta agendada para exclusão</p>
                                        <p className="text-xs text-amber-400/80 mb-3">
                                            Seus dados serão excluídos em {accountStatus.scheduledDeletionDate
                                                ? new Date(accountStatus.scheduledDeletionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                                                : '30 dias'}. Você pode reativar sua conta antes disso.
                                        </p>
                                        <button
                                            onClick={handleReactivateAccount}
                                            disabled={isReactivating}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isReactivating ? <><Icons.Loader2 className="w-3 h-3 animate-spin" /> Reativando...</> : <><Icons.RefreshCw className="w-3 h-3" /> Reativar Conta</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="text-sm text-zinc-400 mb-4">
                                Ao solicitar exclusão, sua conta entra em período de graça de <strong className="text-zinc-300">30 dias</strong>. Você pode reativar até lá. Após esse prazo, todos os seus dados serão excluídos permanentemente.
                            </p>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                disabled={accountStatus?.isScheduledForDeletion}
                                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-red-500 text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Icons.Trash2 className="w-4 h-4" /> {accountStatus?.isScheduledForDeletion ? 'Exclusão já agendada' : 'Agendar Exclusão da Conta'}
                            </button>
                        </div>
                    </section>

                </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-900/30 flex items-center gap-3 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/20"
                >
                    {saving ? (
                        <>
                            <Icons.Loader2 className="w-5 h-5 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Icons.Save className="w-5 h-5" />
                            Salvar Alterações
                        </>
                    )}
                </button>
            </div>

            {/* DELETE ACCOUNT MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1e293b] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-red-900/20 relative">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none rounded-3xl"></div>

                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <Icons.AlertTriangle className="w-8 h-8" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Agendar exclusão?</h2>
                            <p className="text-zinc-400 mb-4 text-sm">
                                Sua conta entrará em período de graça de <strong className="text-white">30 dias</strong>. Você poderá reativar até lá. Após isso, todos os dados serão excluídos permanentemente.
                            </p>

                            {/* Summary of what will be affected */}
                            {accountStatus && (
                                <div className="mb-6 p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-left space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Plano atual</span>
                                        <span className="text-white font-medium capitalize">{accountStatus.plan}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Créditos disponíveis</span>
                                        <span className="text-white font-medium">{accountStatus.credits.toLocaleString()}</span>
                                    </div>
                                    {accountStatus.subscription?.currentPeriodEnd && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Assinatura até</span>
                                            <span className="text-amber-400 font-medium">
                                                {new Date(accountStatus.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    )}
                                    {accountStatus.credits > 0 && (
                                        <p className="text-xs text-amber-400/80 pt-1 border-t border-zinc-800 mt-2">
                                            ⚠️ Os {accountStatus.credits.toLocaleString()} créditos serão perdidos após os 30 dias.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mb-8 text-left">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                    Digite <span className="text-red-400">EXCLUIR</span> para confirmar
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="EXCLUIR"
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 outline-none transition-all text-center uppercase font-bold tracking-widest"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmText('');
                                    }}
                                    disabled={isDeleting}
                                    className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteConfirmText !== 'EXCLUIR'}
                                    className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                                >
                                    {isDeleting ? (
                                        <><Icons.Loader2 className="w-5 h-5 animate-spin" /> Agendando...</>
                                    ) : (
                                        <><Icons.Trash2 className="w-5 h-5" /> Agendar Exclusão</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
