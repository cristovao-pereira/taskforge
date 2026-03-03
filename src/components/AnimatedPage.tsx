import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { pageProps } from '../lib/motion';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * AnimatedPage Component
 * 
 * Wrapper para páginas com transições consistentes.
 * Direção: Levemente sofisticado (estilo Stripe)
 * 
 * Uso:
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <AnimatedPage>
 *       ...conteúdo
 *     </AnimatedPage>
 *   );
 * }
 * ```
 */
export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div {...pageProps} className={className}>
      {children}
    </motion.div>
  );
}
