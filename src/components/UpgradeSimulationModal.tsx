import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradeSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeSimulationModal({ isOpen, onClose }: UpgradeSimulationModalProps) {
  const features = [
    'Recalcula Strategic Health e prioridades',
    'Simula resolução de riscos e conclusão de planos',
    'Mostra impacto previsto com explicação',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 bg-gradient-to-br from-[#0f172a] to-[#1a1f35] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800/50 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg mt-1">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Simulação Estratégica</h2>
                  <p className="text-xs text-slate-400 mt-1">Recurso do plano Estratégico</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed">
                Teste cenários antes de agir. Veja como decisões, planos e riscos impactam sua saúde
                estratégica — sem salvar alterações.
              </p>

              {/* Features */}
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="p-1 bg-emerald-500/20 rounded mt-0.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-sm text-slate-300">{feature}</p>
                  </motion.div>
                ))}
              </div>

              {/* Pricing Note */}
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Disponível no plano</div>
                <div className="text-lg font-bold text-white">Estratégico</div>
                <div className="text-xs text-slate-500 mt-2">Acesso ilimitado a simulações</div>
              </div>
            </div>

            {/* Footer - CTAs */}
            <div className="px-8 py-6 border-t border-slate-800/50 space-y-3 bg-slate-900/30">
              <Link
                to="/app/pricing"
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-lg transition-all text-center block"
              >
                Evoluir para Estratégico
              </Link>
              <button
                onClick={onClose}
                className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium rounded-lg transition-colors"
              >
                Ver detalhes do plano
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
