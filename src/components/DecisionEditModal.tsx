import React, { useState } from 'react';
import { Icons } from './Icons';

interface DecisionEditModalProps {
    suggestion: {
        id: string;
        title: string;
        description: string;
        impactScore: number;
        riskScore: number;
        confidenceScore: number;
    };
    onClose: () => void;
    onSave: (data: any) => void;
}

export function DecisionEditModal({ suggestion, onClose, onSave }: DecisionEditModalProps) {
    const [formData, setFormData] = useState({
        title: suggestion.title,
        description: suggestion.description,
        impactScore: suggestion.impactScore,
        riskScore: suggestion.riskScore || 0,
        notes: ''
    });

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white">Revisar Decisão Sugerida</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white"><Icons.X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Título</label>
                        <input 
                            type="text" 
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Contexto Estratégico</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white h-24 resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Impacto ({formData.impactScore})</label>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={formData.impactScore}
                                onChange={e => setFormData({...formData, impactScore: parseInt(e.target.value)})}
                                className="w-full accent-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Risco ({formData.riskScore})</label>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={formData.riskScore}
                                onChange={e => setFormData({...formData, riskScore: parseInt(e.target.value)})}
                                className="w-full accent-orange-500"
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Confiança do Sistema</span>
                        <span className="text-sm font-bold text-emerald-500">{suggestion.confidenceScore}%</span>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                    <button onClick={onClose} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors">
                        Cancelar
                    </button>
                    <button onClick={() => onSave(formData)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors">
                        Salvar e Criar Decisão
                    </button>
                </div>
            </div>
        </div>
    );
}
