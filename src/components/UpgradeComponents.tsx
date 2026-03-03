import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Zap, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { useUpgrade, UpgradeTriggerType } from '../contexts/UpgradeContext';
import { useNavigate } from 'react-router-dom';

// --- Upgrade Banner ---

export const UpgradeBanner: React.FC = () => {
  const { activeTrigger, dismissUpgradePrompt, metrics } = useUpgrade();
  const navigate = useNavigate();

  // Banners only for non-blocking notifications
  const shouldShow = activeTrigger === 'credits_low' || activeTrigger === 'strategic_upsell' || activeTrigger === 'processing_blocked';
  
  if (!shouldShow) return null;

  const contentMap: Record<string, { icon: any, title: string, text: string, btn: string, color: string }> = {
    'credits_low': {
      icon: Zap,
      title: 'Capacidade em alta demanda',
      text: 'Você está utilizando sua capacidade estratégica com frequência. Garanta operação contínua.',
      btn: 'Expandir capacidade',
      color: 'text-orange-400'
    },
    'strategic_upsell': {
      icon: TrendingUp,
      title: 'Maturidade Estratégica',
      text: 'Você está operando em nível estratégico elevado. O Plano Strategic libera simulações avançadas.',
      btn: 'Evoluir para Strategic',
      color: 'text-emerald-400'
    },
    'processing_blocked': {
        icon: Lock,
        title: 'Recurso Exclusivo',
        text: 'Processamento estratégico avançado disponível no plano Builder.',
        btn: 'Ver Planos',
        color: 'text-blue-400'
    }
  };

  const current = contentMap[activeTrigger as string];
  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[#1e293b] border-b border-slate-700/50 shadow-lg relative z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-slate-800/50 ${current.color}`}>
              <current.icon className="w-5 h-5" />
            </div>
            <div className="text-sm">
                <span className="font-semibold text-slate-200 block sm:inline mr-2">{current.title}</span>
                <span className="text-slate-400">{current.text}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
             <button 
               onClick={() => navigate('/precos')}
               className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-md transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
             >
               {current.btn}
               <ArrowRight className="w-3 h-3" />
             </button>
             <button 
               onClick={dismissUpgradePrompt}
               className="p-1 hover:bg-slate-700 rounded-full text-slate-500 hover:text-white transition-colors absolute top-2 right-2 sm:static sm:block"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};


// --- Upgrade Modal ---

export const UpgradeModal: React.FC = () => {
    const { showModal, activeTrigger, dismissUpgradePrompt } = useUpgrade();
    const navigate = useNavigate();
  
    if (!showModal) return null;
  
    const modalContent: Record<string, { title: string, description: string, btn: string }> = {
      'deep_mode_locked': {
        title: "Deep Mode desbloqueia análise profunda",
        description: "Decisões complexas exigem teste avançado de risco e simulação de segunda ordem. O Deep Mode oferece essa segurança.",
        btn: "Desbloquear Deep Mode"
      },
      'processing_blocked': {
        title: "Capacidade de processamento atingida",
        description: "Para continuar gerando análises com esta profundidade, é necessário expandir sua capacidade de processamento.",
        btn: "Expandir Capacidade"
      }
    };
  
    const content = modalContent[activeTrigger as string];
    if (!content) return null; // Fallback if modal triggered without content definition
  
    return (
      <AnimatePresence>
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-xl shadow-2xl relative overflow-hidden"
            >
                 {/* Header Decor */}
                 <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                 
                 <button 
                    onClick={dismissUpgradePrompt}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                 >
                     <X className="w-5 h-5" />
                 </button>
  
                 <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Lock className="w-8 h-8 text-blue-400" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3">{content.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-8">
                          {content.description}
                      </p>
  
                      <div className="space-y-3">
                          <button 
                              onClick={() => { dismissUpgradePrompt(); navigate('/precos'); }}
                              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-orange-900/20 hover:shadow-orange-700/30 flex items-center justify-center gap-2"
                          >
                              {content.btn}
                              <ArrowRight className="w-4 h-4" />
                          </button>
                          
                          <button 
                              onClick={dismissUpgradePrompt}
                              className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
                          >
                              Agora não
                          </button>
                      </div>
                 </div>
            </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };
