import { motion, HTMLMotionProps } from 'motion/react';
import { cardHover } from '../lib/motion';

/**
 * CardWithHover Component
 * 
 * Card wrapper com hover effect padrão do Motion System v1.1
 * 
 * Hover behavior:
 * - translateY: -2px
 * - Deve ser combinado com shadow-md → shadow-lg no CSS
 * - Duração: 0.18s
 * 
 * Uso:
 * ```tsx
 * <CardWithHover className="card-standard shadow-md hover:shadow-lg">
 *   Conteúdo...
 * </CardWithHover>
 * ```
 */
type CardWithHoverProps = HTMLMotionProps<'div'>;

export function CardWithHover({ 
  children, 
  className = '', 
  ...props 
}: CardWithHoverProps) {
  return (
    <motion.div
      {...cardHover}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
