import { motion } from 'motion/react';
import { logoSequence } from '../lib/motion';

/**
 * AnimatedLogo Component
 * 
 * Logo animado do TaskForge para loading inicial.
 * Sequência:
 * 1. Linha superior do T desenha
 * 2. Haste desce
 * 3. F aparece
 * 4. Quadrado laranja fade + scale
 * 
 * Duração total: ~0.42s
 */
export function AnimatedLogo({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`relative inline-flex items-center gap-2 ${className}`}
      variants={logoSequence.container}
      initial="initial"
      animate="animate"
    >
      {/* T Letter */}
      <div className="relative w-8 h-10">
        {/* Top bar */}
        <motion.div
          variants={logoSequence.topBar}
          className="absolute top-0 left-0 w-full h-1.5 bg-white rounded-full"
        />
        {/* Stem */}
        <motion.div
          variants={logoSequence.stem}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-full bg-white rounded-full"
        />
      </div>

      {/* F Letter */}
      <motion.div
        variants={logoSequence.fLetter}
        className="text-2xl font-bold text-white tracking-tight"
      >
        F
      </motion.div>

      {/* Orange Square */}
      <motion.div
        variants={logoSequence.square}
        className="w-2 h-2 bg-orange-500 rounded-sm"
      />
    </motion.div>
  );
}
