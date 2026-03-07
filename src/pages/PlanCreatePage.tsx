import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function PlanCreatePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const suggestionId = searchParams.get('fromSuggestion');

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        objective: '',
        phases: '',
        tasks: '',
        timeline: ''
    });

    useEffect(() => {
        if (suggestionId) {
            setLoading(true);
            api.get(`/api/suggestions/plan/${suggestionId}`)
                .then(data => {
                    setFormData({
                        title: data.title,
                        objective: data.objective || '',
                        phases: data.phasesJson || '',
                        tasks: data.tasksJson || '',
                        timeline: data.timelineEstimate || ''
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch suggestion", err);
                    setLoading(false);
                });
        }
    }, [suggestionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/api/plans', {
                ...formData,
                suggestionId // Pass ID to link back and update status
            });

            toast.success('✅ Plano criado!');
            navigate('/app/plans');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao conectar com o servidor ou criar plano.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto section-spacing pb-20 animate-in fade-in duration-500">
            <div className="mb-8">
                <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-4">
                    <Icons.ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <h1>Criar Plano de Execução</h1>
                {suggestionId && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium">
                        <Icons.Sparkles className="w-3 h-3" />
                        Plano sugerido a partir de documento
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="card-standard space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Título do Plano</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Objetivo Estratégico</label>
                    <textarea
                        value={formData.objective}
                        onChange={e => setFormData({ ...formData, objective: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Fases (JSON ou Texto)</label>
                        <textarea
                            value={formData.phases}
                            onChange={e => setFormData({ ...formData, phases: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white h-40 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                        <p className="text-xs text-zinc-600">Estrutura sugerida das fases do projeto.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Tarefas Iniciais (JSON ou Texto)</label>
                        <textarea
                            value={formData.tasks}
                            onChange={e => setFormData({ ...formData, tasks: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white h-40 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                        <p className="text-xs text-zinc-600">Lista preliminar de tarefas para execução.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-secondary px-6"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-6"
                    >
                        {loading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Check className="w-4 h-4" />}
                        {suggestionId ? 'Confirmar e Criar Plano' : 'Criar Plano'}
                    </button>
                </div>
            </form>
        </div>
    );
}
