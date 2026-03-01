import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useEvent } from '../contexts/EventContext';
import { DecisionEditModal } from '../components/DecisionEditModal';

// Types
interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  insights?: {
      summary?: string;
      decisionsJson?: string;
      risksJson?: string;
      opportunitiesJson?: string;
      suggestedPlanJson?: string;
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { emitEvent, socket } = useEvent();

  // Fetch Documents & Score
  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => setDocuments(data));
      
    fetch('/api/documents/score')
      .then(res => res.json())
      .then(data => setScore(data.score));
  }, []);

  // Listen for Real-time Updates
  useEffect(() => {
      if (!socket) return;

      socket.on('document:uploaded', (newDoc: Document) => {
          setDocuments(prev => [newDoc, ...prev]);
      });

      socket.on('document:processed', (updatedDoc: Document) => {
          setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
          // Refresh score
          fetch('/api/documents/score').then(res => res.json()).then(data => setScore(data.score));
      });

      socket.on('document:insights_extracted', (data: any) => {
          // Optional: Show toast notification
          console.log('Insights ready for:', data.title);
      });

      return () => {
          socket.off('document:uploaded');
          socket.off('document:processed');
          socket.off('document:insights_extracted');
      };
  }, [socket]);

  const handleAddDocumentClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData
        });
        
        if (res.ok) {
            // Optimistic update handled by socket, but we can also do it here if needed
            // const newDoc = await res.json();
            // setDocuments([newDoc, ...documents]);
            emitEvent('document.uploaded', 'document', 'temp-id', { title: file.name });
        } else {
            alert('Erro ao fazer upload do arquivo.');
        }
    } catch (error) {
        console.error('Upload failed:', error);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (doc: Document) => {
    // Re-trigger analysis if needed, or just open panel if already processed
    if (doc.status === 'processed' || doc.status === 'risk_detected' || doc.status === 'insights_ready') {
        setSelectedDoc(doc);
        return;
    }

    setIsAnalyzing(true);
    // Trigger re-analysis
    await fetch(`/api/documents/${doc.id}/analyze`, { method: 'POST' });
    // UI update will come via socket
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-7xl mx-auto section-spacing pb-20 animate-in fade-in duration-700">
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
        />

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8 border-b border-zinc-800 pb-8 mb-12">
            <div className="space-y-2">
                <h1>Central de Documentos</h1>
                <p className="text-xl text-zinc-400 font-light">Memória estratégica estruturada.</p>
                <p className="text-sm text-zinc-500">Armazene, analise e conecte documentos ao seu sistema de decisões e execução.</p>
            </div>
            
            <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Document Intelligence Score</p>
                    <div className="text-3xl font-bold text-emerald-500">{score}<span className="text-zinc-600 text-lg font-normal">/100</span></div>
                </div>
                <button 
                    onClick={handleAddDocumentClick}
                    className="btn-primary px-6"
                >
                    <Icons.Plus className="w-5 h-5" />
                    Adicionar Documento
                </button>
            </div>
        </header>

        {/* Section 1: Recent Documents */}
        <section className="space-y-6 mb-16">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Icons.FileText className="w-5 h-5 text-zinc-400" />
                    Documentos Recentes
                </h2>
                {/* Filters Mock */}
                <div className="flex gap-2">
                    {['Todos', 'PDF', 'Processando', 'Riscos'].map(f => (
                        <button key={f} className="px-3 py-1 rounded-full text-xs font-medium border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {documents.map(doc => (
                    <DocumentCard 
                        key={doc.id} 
                        doc={doc} 
                        onAnalyze={() => handleAnalyze(doc)} 
                        onOpen={() => setSelectedDoc(doc)}
                    />
                ))}
                {documents.length === 0 && (
                    <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                        Nenhum documento recente. Adicione um para começar.
                    </div>
                )}
            </div>
        </section>

        {/* Section 2: Analysis Panel (Conditional) */}
        {selectedDoc && (
            <AnalysisPanel 
                doc={selectedDoc} 
                onClose={() => setSelectedDoc(null)} 
                isAnalyzing={isAnalyzing}
            />
        )}

        {/* Section 3: Linked Documents (Mocked List for now) */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                 <h2 className="text-zinc-500 uppercase tracking-widest">Documentos Vinculados</h2>
                 <div className="h-px flex-1 bg-zinc-800"></div>
            </div>
            
            <div className="card-standard divide-y divide-zinc-800">
                 {documents.filter(d => d.status === 'linked' || d.status === 'risk_detected').map(doc => (
                     <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                                <Icons.FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">{doc.title}</h4>
                                <p className="text-xs text-zinc-500">Vinculado a <span className="text-orange-400">Risco Crítico</span></p>
                            </div>
                        </div>
                        <button className="text-xs text-zinc-400 hover:text-white">Ver Detalhes</button>
                     </div>
                 ))}
                 {documents.filter(d => d.status === 'linked' || d.status === 'risk_detected').length === 0 && (
                     <div className="p-6 text-center text-zinc-500 text-sm">
                         Nenhum documento vinculado encontrado.
                     </div>
                 )}
            </div>
        </section>
    </div>
  );
}

function DocumentCard({ doc, onAnalyze, onOpen }: any) {
    const getStatusColor = (s: string) => {
        if (s === 'processing') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        if (s === 'processed' || s === 'insights_ready') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (s === 'risk_detected') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        return 'text-zinc-500 bg-zinc-800 border-zinc-700';
    };

    const getStatusLabel = (s: string) => {
        if (s === 'processing') return 'Processando';
        if (s === 'processed' || s === 'insights_ready') return 'Insights Extraídos';
        if (s === 'risk_detected') return 'Risco Detectado';
        return 'Rascunho';
    };

    return (
        <div className="card-standard group flex flex-col justify-between h-48">
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
                        <Icons.File className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${getStatusColor(doc.status)}`}>
                        {doc.type}
                    </span>
                </div>
                <div>
                    <h3 className="truncate" title={doc.title}>{doc.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
                 <span className={`text-xs font-medium ${doc.status === 'risk_detected' ? 'text-orange-500' : 'text-zinc-500'}`}>
                    {getStatusLabel(doc.status)}
                 </span>
                 <div className="flex gap-1">
                    {doc.status === 'processing' ? (
                        <Icons.Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                    ) : (
                        <>
                            <button onClick={onOpen} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white" title="Abrir">
                                <Icons.Eye className="w-4 h-4" />
                            </button>
                            {(doc.status === 'processed' || doc.status === 'insights_ready' || doc.status === 'risk_detected') ? (
                                <button onClick={onOpen} className="p-1.5 hover:bg-zinc-800 rounded text-emerald-400 hover:text-emerald-300" title="Ver Insights">
                                    <Icons.Sparkles className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={onAnalyze} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-emerald-400" title="Analisar">
                                    <Icons.Sparkles className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                 </div>
            </div>
        </div>
    )
}

function AnalysisPanel({ doc, onClose, isAnalyzing }: any) {
    if (isAnalyzing) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-4">
                    <Icons.Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-white font-medium">Extraindo inteligência estratégica...</p>
                </div>
            </div>
        )
    }

    // Handle both old (flat) and new (nested insights) structure for compatibility
    const insights = doc.insights || {};
    const summary = insights.summary || doc.summary;
    const decisions = insights.decisionsJson ? JSON.parse(insights.decisionsJson) : (doc.decisions ? JSON.parse(doc.decisions) : []);
    const risks = insights.risksJson ? JSON.parse(insights.risksJson) : (doc.risks ? JSON.parse(doc.risks) : []);
    
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState<any>(null);
    const [editingDecision, setEditingDecision] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/documents/${doc.id}/suggestions`)
            .then(res => res.json())
            .then(data => setSuggestions(data));
    }, [doc.id]);

    const handleAcceptDecision = async (id: string, data?: any) => {
        await fetch(`/api/suggestions/decision/${id}/accept`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data || {})
        });
        setSuggestions((prev: any) => ({
            ...prev,
            decisionSuggestions: prev.decisionSuggestions.map((s: any) => s.id === id ? { ...s, status: 'accepted' } : s)
        }));
        setEditingDecision(null);
    };

    const handleDismissDecision = async (id: string) => {
        await fetch(`/api/suggestions/decision/${id}/dismiss`, { method: 'POST' });
        setSuggestions((prev: any) => ({
            ...prev,
            decisionSuggestions: prev.decisionSuggestions.map((s: any) => s.id === id ? { ...s, status: 'dismissed' } : s)
        }));
    };

    const handleEditPlan = (id: string) => {
        navigate(`/app/plans/create?fromSuggestion=${id}`);
    };

    const handleDismissPlan = async (id: string) => {
        await fetch(`/api/suggestions/plan/${id}/dismiss`, { method: 'POST' });
        setSuggestions((prev: any) => ({
            ...prev,
            planSuggestions: prev.planSuggestions.map((s: any) => s.id === id ? { ...s, status: 'dismissed' } : s)
        }));
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-in slide-in-from-right duration-300">
                <div className="w-full max-w-2xl bg-zinc-950 h-full border-l border-zinc-800 p-8 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{doc.title}</h2>
                            <p className="text-zinc-400">Painel de Inteligência</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 hover:text-white">
                            <Icons.X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Summary */}
                        <section className="space-y-3">
                            <h3 className="text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                <Icons.AlignLeft className="w-4 h-4" /> Resumo Estruturado
                            </h3>
                            <p className="text-zinc-300 leading-relaxed card-standard border-zinc-800">
                                {summary || "Nenhuma análise disponível. O documento está sendo processado."}
                            </p>
                        </section>

                        {/* System Suggestions */}
                        {suggestions && (suggestions.decisionSuggestions?.length > 0 || suggestions.planSuggestions?.length > 0) && (
                            <section className="space-y-4 bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <Icons.Sparkles className="w-4 h-4" /> Sugestões do Sistema
                                </h3>
                                
                                {/* Decision Suggestions */}
                                {suggestions.decisionSuggestions?.filter((s: any) => s.status === 'pending').map((s: any) => (
                                    <div key={s.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-bold text-emerald-500 uppercase mb-1 block">Nova Decisão Detectada</span>
                                                <h4 className="text-white font-medium">{s.title}</h4>
                                                <p className="text-sm text-zinc-400 mt-1">{s.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">{s.confidenceScore}% Confiança</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => setEditingDecision(s)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded transition-colors">
                                                Revisar e Confirmar
                                            </button>
                                            <button onClick={() => handleDismissDecision(s.id)} className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-bold py-2 rounded transition-colors">
                                                Descartar
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Plan Suggestions */}
                                {suggestions.planSuggestions?.filter((s: any) => s.status === 'pending').map((s: any) => (
                                    <div key={s.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-bold text-blue-500 uppercase mb-1 block">Plano de Execução Sugerido</span>
                                                <h4 className="text-white font-medium">{s.title}</h4>
                                                <p className="text-sm text-zinc-400 mt-1">{s.objective}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => handleEditPlan(s.id)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition-colors">
                                                Editar e Criar Plano
                                            </button>
                                            <button onClick={() => handleDismissPlan(s.id)} className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-bold py-2 rounded transition-colors">
                                                Descartar
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {suggestions.decisionSuggestions?.every((s: any) => s.status !== 'pending') && suggestions.planSuggestions?.every((s: any) => s.status !== 'pending') && (
                                    <p className="text-sm text-zinc-500 italic text-center py-2">Todas as sugestões foram processadas.</p>
                                )}
                            </section>
                        )}

                        {/* Decisions */}
                        {decisions.length > 0 && (
                            <section className="space-y-3">
                                <h3 className="text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Icons.GitCommit className="w-4 h-4" /> Decisões Detectadas
                                </h3>
                                <div className="space-y-2">
                                    {decisions.map((d: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                                            <span className="text-white font-medium">{d.title}</span>
                                            <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400">{d.confidence}% Confiança</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-secondary w-full py-2">
                                    <Icons.Plus className="w-4 h-4" /> Gerar no DecisionForge
                                </button>
                            </section>
                        )}

                        {/* Risks */}
                        {risks.length > 0 && (
                            <section className="space-y-3">
                                <h3 className="text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                    <Icons.AlertTriangle className="w-4 h-4" /> Riscos Identificados
                                </h3>
                                <div className="space-y-2">
                                    {risks.map((r: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                                            <span className="text-orange-200 font-medium">{r.title}</span>
                                            <span className="text-xs px-2 py-1 bg-orange-500/10 rounded text-orange-400 uppercase font-bold">{r.severity}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-2 text-sm text-orange-400 hover:text-orange-300 border border-orange-500/20 hover:border-orange-500/40 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Icons.ShieldAlert className="w-4 h-4" /> Enviar para LeverageForge
                                </button>
                            </section>
                        )}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-zinc-800">
                            <button className="btn-secondary p-4 flex flex-col items-center gap-2 group">
                                <Icons.Layout className="w-6 h-6 text-zinc-500 group-hover:text-blue-500" />
                                <span className="text-sm font-medium text-zinc-400 group-hover:text-white">Organizar com ClarityForge</span>
                            </button>
                            <button className="btn-secondary p-4 flex flex-col items-center gap-2 group">
                                <Icons.Target className="w-6 h-6 text-zinc-500 group-hover:text-blue-500" />
                                <span className="text-sm font-medium text-zinc-400 group-hover:text-white">Gerar Execution Plan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decision Edit Modal */}
            {editingDecision && (
                <DecisionEditModal 
                    suggestion={editingDecision} 
                    onClose={() => setEditingDecision(null)} 
                    onSave={(data: any) => handleAcceptDecision(editingDecision.id, data)}
                />
            )}
        </>
    )
}
