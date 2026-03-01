import { motion, AnimatePresence } from 'motion/react';
import { riskAlert } from '../lib/motion';
import { ReactNode } from 'react';

interface AnimatedRiskAlertProps {
  children: ReactNode;
  isVisible?: boolean;
  className?: string;
}

/**
 * AnimatedRiskAlert Component
 * 
 * Card de alerta com entrada slideX + fade.
 * Implementa RISK ALERT do Motion System v1.1
 * 
 * Comportamento:
 * - Entrada: slideX -6px → 0, opacity 0 → 1
 * - Duração: 0.28s
 * - Sem shake exagerado
 * 
 * Uso:
 * ```tsx
 * <AnimatedRiskAlert isVisible={show}>
 *   <div>Conteúdo do alerta</div>
 * </AnimatedRiskAlert>
 * ```
 */
export function AnimatedRiskAlert({ 
  children, 
  isVisible = true,
  className = '' 
}: AnimatedRiskAlertProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={riskAlert.initial}
          animate={riskAlert.animate}
          exit={riskAlert.exit}
          transition={riskAlert.transition}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
