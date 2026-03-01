import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

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
                            className={`p-3 px-4 cursor-pointer flex items-center justify-between transition-colors ${
                                value === option.value 
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
    const { setMode } = useStrategicMode();
    const { getIdToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
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
                                        onChange={e => setProfile({...profile, name: e.target.value})}
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
                                        onChange={e => setProfile({...profile, company: e.target.value})}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Cargo</label>
                                    <input 
                                        type="text" 
                                        value={profile.role}
                                        onChange={e => setProfile({...profile, role: e.target.value})}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Objetivo Estratégico Principal</label>
                                    <textarea 
                                        value={profile.objective}
                                        onChange={e => setProfile({...profile, objective: e.target.value})}
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
                                    onChange={(val: string) => setProfile({...profile, strategicMode: val})}
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
                                    onChange={(val: string) => setProfile({...profile, alertSensitivity: val})}
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
                                    onClick={() => setProfile({...profile, deepMode: !profile.deepMode})}
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
                            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
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
                            <button className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <Icons.Key className="w-4 h-4" /> Alterar Senha
                            </button>
                            <button className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-xl text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <Icons.LogOut className="w-4 h-4" /> Sair de todos os dispositivos
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

        </div>
    );
}
