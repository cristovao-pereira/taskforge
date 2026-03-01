import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Icons } from '../components/Icons';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: React.ReactNode;
  timestamp: string;
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('Clarificando contexto');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      timestamp: 'Agora',
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-orange-500 font-medium tracking-wide text-sm uppercase">
            <Icons.GitFork className="w-4 h-4" />
            <span>Sessão DecisionForge Iniciada</span>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Inicialização de Contexto Estratégico</h3>
            <p className="leading-relaxed text-zinc-300">
              Estou pronto para estressar sua decisão. Para garantir uma análise rigorosa e identificar potenciais pontos cegos, preciso estabelecer a premissa estratégica central.
            </p>
            <div className="bg-zinc-900/30 border-l-2 border-orange-500/50 pl-4 py-1">
              <p className="text-zinc-400 italic">
                "A qualidade da decisão é limitada pela clareza da definição do problema."
              </p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Icons.Target className="w-4 h-4 text-orange-500" />
              Entradas Necessárias
            </h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex gap-3">
                <span className="text-zinc-600 font-mono">01</span>
                <span>Qual é a decisão específica que você está enfrentando?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-zinc-600 font-mono">02</span>
                <span>Qual é o seu resultado principal esperado?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-zinc-600 font-mono">03</span>
                <span>Qual é o custo imediato da inação?</span>
              </li>
            </ul>
          </div>
        </div>
      )
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: 'Agora mesmo'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsAnalyzing(true);
    setSessionStatus('Avaliando suposições');

    // Simulate analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setSessionStatus('Formulando desafio estratégico');
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        timestamp: 'Agora mesmo',
        content: (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Análise de Premissa</h3>
              <p className="leading-relaxed text-zinc-300">
                Você está propondo um pivô para vendas enterprise para aumentar o LTV, aceitando um ciclo de vendas mais longo.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-emerald-400 text-sm font-medium">
                  <Icons.Check className="w-4 h-4" />
                  <span>Lógica Validada</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Contratos Enterprise tipicamente geram LTV 10x-50x maior, justificando o aumento do CAC.
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-orange-400 text-sm font-medium">
                  <Icons.AlertTriangle className="w-4 h-4" />
                  <span>Sinal de Risco Detectado</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  A lacuna de fluxo de caixa durante o ciclo de vendas de 6-9 meses pode esgotar o runway antes do primeiro fechamento.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Desafio Estratégico</h4>
              <p className="leading-relaxed text-zinc-300">
                Você tem runway operacional para sobreviver 9 meses sem crescimento de receita enquanto a equipe de vendas se estrutura?
              </p>
            </div>
          </div>
        )
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 3000);
  };

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-200 font-sans">
      
      {/* Main Session Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Session Header */}
        <header className="h-20 px-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-orange-500 shadow-lg shadow-orange-500/5">
                <Icons.GitFork className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-tight">DecisionForge</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
                  <span className="text-xs font-medium text-orange-500 uppercase tracking-wider">Sessão Estratégica Profunda Ativa</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex h-8 w-px bg-zinc-800 mx-2"></div>
            
            <div className="hidden md:block">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Status Atual</div>
              <div className="text-sm text-zinc-300 font-medium flex items-center gap-2">
                {isAnalyzing && <Icons.Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
                {sessionStatus}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Créditos</div>
              <div className="text-sm font-mono text-zinc-300">840 / 1000</div>
            </div>
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
              <Icons.MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Progress Indicator */}
        <div className="h-1 w-full bg-zinc-900">
          <div className="h-full bg-orange-500/50 w-1/3 shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl w-full ${msg.role === 'user' ? 'bg-zinc-900 border border-zinc-800 p-6 rounded-2xl' : ''}`}>
                {msg.role === 'user' ? (
                  <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {msg.content}
                  </div>
                )}
                <div className={`mt-3 text-xs text-zinc-600 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          
          {isAnalyzing && (
            <div className="flex justify-start max-w-3xl w-full">
              <div className="flex items-center gap-3 text-orange-500 text-sm font-medium animate-pulse">
                <Icons.Brain className="w-5 h-5" />
                <span>Analisando estrategicamente...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 md:px-12 md:pb-12 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden focus-within:ring-1 focus-within:ring-orange-500/30 focus-within:border-orange-500/50 transition-all">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full bg-transparent border-none focus:ring-0 text-zinc-200 placeholder-zinc-600 resize-none py-6 px-6 min-h-[120px] text-base leading-relaxed" 
                  placeholder="Descreva a decisão que você está prestes a tomar e o raciocínio por trás dela..." 
                ></textarea>
                <div className="bg-zinc-900/50 px-4 py-3 flex justify-between items-center border-t border-zinc-800/50">
                  <div className="flex gap-2">
                    <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                      <Icons.Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                      <Icons.Mic className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isAnalyzing}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center gap-2"
                  >
                    <span>Continuar Sessão Estratégica</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-600">
              TaskForge Deep Mode v2.1 • Contexto Estratégico Ativo
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Session Summary */}
      <aside className="w-80 border-l border-zinc-800 bg-[#0F0F0F] hidden xl:flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Resumo da Sessão</h2>
          <p className="text-xs text-zinc-600">Extração estratégica em tempo real</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div>
            <div className="flex items-center gap-2 mb-3 text-zinc-300 font-medium text-sm">
              <Icons.Target className="w-4 h-4 text-orange-500" />
              Decisão Analisada
            </div>
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pivô para Modelo de Vendas Enterprise (B2B)
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-zinc-300 font-medium text-sm">
              <Icons.AlertTriangle className="w-4 h-4 text-yellow-500" />
              Sinais de Risco
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                  Esgotamento de runway antes do primeiro fechamento
                </p>
              </div>
              <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                  Subestimação da duração do ciclo de vendas
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-zinc-300 font-medium text-sm">
              <Icons.Key className="w-4 h-4 text-purple-500" />
              Premissas Chave
            </div>
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <ul className="list-disc list-inside space-y-2 text-xs text-zinc-400">
                <li>LTV aumentará em 10x</li>
                <li>Produto está pronto para enterprise</li>
                <li>Fundador consegue fechar os primeiros 5 negócios</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-zinc-300 font-medium text-sm">
              <Icons.Activity className="w-4 h-4 text-blue-500" />
              Alerta de Padrão
            </div>
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
              <p className="text-xs text-blue-400 leading-relaxed">
                Você tende a ser otimista sobre ciclos de vendas. Aplicaremos um buffer de 2x às suas estimativas.
              </p>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
}
