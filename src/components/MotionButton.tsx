import { motion, HTMLMotionProps } from 'motion/react';
import { buttonPrimary } from '../lib/motion';
import { forwardRef } from 'react';

/**
 * MotionButton Component
 * 
 * Botão com animações do Motion System v1.1
 * 
 * Hover: scale 1.015
 * Active: scale 0.985
 * Duração: 0.18s
 * 
 * Uso:
 * ```tsx
 * <MotionButton className="btn-primary">
 *   Click me
 * </MotionButton>
 * ```
 */
type MotionButtonProps = HTMLMotionProps<'button'>;

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...buttonPrimary}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

MotionButton.displayName = 'MotionButton';
