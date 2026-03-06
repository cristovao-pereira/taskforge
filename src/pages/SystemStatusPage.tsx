import React from 'react';
import { Icons } from '../components/Icons';
import { useEvent } from '../contexts/EventContext';
import { useStrategicMode } from '../contexts/StrategicContext';
import { useMetrics } from '../contexts/MetricsContext';

export default function SystemStatusPage() {
    const { getRecentExplanations } = useEvent();
    const { mode, getModeLabel, getModeColor } = useStrategicMode();
    const { health } = useMetrics();
    const recentChanges = getRecentExplanations(20);

    const getHealthColor = (score: number) => {
        if (score === 0) return 'text-zinc-500';
        if (score >= 75) return 'text-emerald-500';
        if (score >= 55) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getHealthBg = (score: number) => {
        if (score >= 75) return 'bg-emerald-500/10';
        if (score >= 55) return 'bg-yellow-500/10';
        return 'bg-red-500/10';
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8 border-b border-zinc-800 pb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Status do Sistema</h1>
                    <p className="text-xl text-zinc-400 font-light">Saúde operacional em tempo real.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Modo Atual</p>
                        <div className={`flex items-center justify-end gap-2 ${getModeColor()}`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                            <span className="font-bold">{getModeLabel()}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* System Health Overview */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {(!health || health.overallScore === 0) ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:col-span-4 flex flex-col items-center justify-center py-12 text-center border-dashed border-2 bg-transparent">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-500">
                            <Icons.Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Sistema em Fase Inicial</h3>
                        <p className="text-zinc-400 max-w-md">Não há dados suficientes para determinar a saúde operacional. Complete mais decisões e sessões para gerar o primeiro relatório.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between md:col-span-1 border-l-4 border-l-emerald-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${getHealthBg(health.overallScore)}`}>
                                    <Icons.Activity className={`w-5 h-5 ${getHealthColor(health.overallScore)}`} />
                                </div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Saúde Geral</p>
                            </div>
                            <div>
                                <p className={`text-4xl font-bold ${getHealthColor(health.overallScore)}`}>{health.overallScore}%</p>
                                <p className="text-xs text-zinc-500 mt-1">Atualizado agora</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-400 font-medium">Impacto dos Riscos</span>
                                    <span className="text-sm font-bold text-white">{health.activeRisksSeverity}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${health.activeRisksSeverity}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-400 font-medium">Estabilidade dos Planos</span>
                                    <span className="text-sm font-bold text-white">{health.executionStability}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${health.executionStability}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-400 font-medium">Alinhamento</span>
                                    <span className="text-sm font-bold text-white">{health.alignment}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health.alignment}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-400 font-medium">Ritmo de Execução</span>
                                    <span className="text-sm font-bold text-white">{health.momentum}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${health.momentum}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* Recent Changes Log (Audit) */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Icons.History className="w-5 h-5 text-zinc-400" />
                    <h2 className="text-lg font-bold text-white">Histórico de Mudanças</h2>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
                    {recentChanges.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">
                            Nenhuma mudança registrada recentemente.
                        </div>
                    ) : (
                        recentChanges.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-zinc-900 transition-colors group">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 group-hover:text-white group-hover:border-zinc-600 transition-colors">
                                            <Icons.FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {log.title}
                                            </h3>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                {new Date(log.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                                            Sistema
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pl-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">O que mudou</p>
                                        <p className="text-sm text-zinc-300">{log.whatChanged}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Por que mudou</p>
                                        <p className="text-sm text-zinc-300">{log.whyChanged}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Recomendação</p>
                                        <p className="text-sm text-emerald-400">{log.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
