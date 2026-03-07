import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './Icons';
import { toast } from 'sonner';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { objective: string; mode: 'conservador' | 'equilibrado' | 'expansao' }) => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [project, setProject] = useState('');
  const [objective, setObjective] = useState('');
  const [challenge, setChallenge] = useState('');
  const [mode, setMode] = useState<'conservador' | 'equilibrado' | 'expansao'>('equilibrado');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!project.trim() || !objective.trim() || !challenge.trim()) {
        toast.error('Preencha os campos para continuarmos');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const combinedObjective = `Projeto/Empresa: ${project}\nObjetivo: ${objective}\nMaior desafio: ${challenge}`;
      await onComplete({ objective: combinedObjective, mode });
      // Só reseta depois que o onboarding for salvo com sucesso
      setStep(1);
      setProject('');
      setObjective('');
      setChallenge('');
      setMode('equilibrado');
    } catch (error) {
      toast.error('Erro ao completar onboarding');
      console.error('Erro no handleComplete:', error);
      // Não reseta o state se houver erro
    } finally {
      setIsLoading(false);
    }
  };

  const modes = [
    {
      value: 'conservador' as const,
      icon: '🛡️',
      label: 'Conservador',
      description: 'Minimizar riscos, crescimento gradual',
      color: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
    },
    {
      value: 'equilibrado' as const,
      icon: '⚖️',
      label: 'Equilibrado',
      description: 'Balancear risco e oportunidade',
      color: 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
    },
    {
      value: 'expansao' as const,
      icon: '🚀',
      label: 'Expansão',
      description: 'Crescimento agressivo, buscando oportunidades',
      color: 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="text-4xl mb-3">
                {step === 1 ? '🎯' : step === 2 ? '⚡' : '🚀'}
              </div>
              <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {step === 1 ? 'Seu Objetivo' : step === 2 ? 'Escolha seu Modo' : 'Bem-vindo ao TaskForge!'}
              </h2>
              <p className="text-sm opacity-70" style={{ color: 'var(--text-secondary)' }}>
                {step === 1
                  ? 'Vamos entender melhor o seu contexto atual.'
                  : step === 2
                    ? 'Como você prefere abordar decisões estratégicas no dia a dia?'
                    : 'Pronto para iniciar sua jornada estratégica!'}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-blue-500' : 'opacity-20'
                    }`}
                  style={{ backgroundColor: s <= step ? undefined : 'var(--text-secondary)' }}
                  layoutId={`step-${s}`}
                />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 mb-8"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Qual o nome do seu projeto ou empresa?</label>
                    <input
                      autoFocus
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      placeholder="Ex: Startup Tech, Nova Filial, etc."
                      className="w-full px-4 py-3 rounded-lg border focus:border-blue-500 focus:outline-none transition-colors"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Qual é seu principal objetivo estratégico hoje?</label>
                    <input
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="Ex: Dobrar a receita, Lançar novo produto..."
                      className="w-full px-4 py-3 rounded-lg border focus:border-blue-500 focus:outline-none transition-colors"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium opacity-80" style={{ color: 'var(--text-primary)' }}>Qual o maior obstáculo ou desafio atual?</label>
                    <textarea
                      value={challenge}
                      onChange={(e) => setChallenge(e.target.value)}
                      placeholder="Ex: Equipe engessada, gargalos na operação..."
                      className="w-full px-4 py-3 rounded-lg border focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      rows={3}
                    />
                  </div>
                  <p className="text-xs mt-2 opacity-50" style={{ color: 'var(--text-secondary)' }}>
                    📝 Seja específico. Estas respostas guiarão as análises dos agentes do TaskForge.
                  </p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3 mb-8"
                >
                  {modes.map((m) => (
                    <motion.button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={`w-full p-4 border-2 rounded-lg transition-all text-left ${mode === m.value
                        ? `${m.color.split(' ')[0]} ${m.color.split(' ')[1]}`
                        : `${m.color.split(' ')[0]} border-transparent hover:bg-[var(--nav-hover)]`
                        }`}
                      style={{ borderColor: mode === m.value ? undefined : 'var(--border-color)' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{m.icon}</span>
                        <div className="flex-1">
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
                          <p className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>{m.description}</p>
                        </div>
                        {mode === m.value && (
                          <Icons.Check className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 mb-8"
                >
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Icons.Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-200 mb-1">Contexto fornecido:</p>
                        <p className="text-sm text-blue-300 line-clamp-2">Projeto: {project} | Objetivo: {objective} | Desafio: {challenge}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Icons.Target className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-200 mb-1">Modo selecionado:</p>
                        <p className="text-sm text-emerald-300">
                          {modes.find((m) => m.value === mode)?.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs opacity-50 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <Icons.HelpCircle className="w-4 h-4" />
                    Vamos guiá-lo na sua primeira decisão estratégica!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors border border-transparent hover:bg-[var(--nav-hover)]"
                  disabled={isLoading}
                >
                  Anterior
                </button>
              )}
              {step < 3 ? (
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Próximo
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleComplete}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <Icons.Zap className="w-4 h-4" />
                      Começar!
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
