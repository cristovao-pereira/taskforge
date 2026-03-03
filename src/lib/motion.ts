/**
 * Motion System v1.1 - TaskForge
 * Biblioteca interna de animações
 * 
 * Stack: Tailwind CSS v4 + Framer Motion (motion/react)
 * Direção: Levemente sofisticado (estilo Stripe)
 * 
 * Princípios:
 * - Sem bounce, elastic ou overshoot
 * - Apenas transform e opacity (performance 60fps)
 * - Duração máxima 0.42s
 * - Movimento controlado e premium
 */

import type { Transition, Variants, Easing } from 'framer-motion';

// ================================================== 
// 1. TOKENS - Easing & Durations
// ================================================== 

/**
 * Curva de easing oficial (Stripe-like)
 * Usar em todas as animações para consistência visual
 */
export const EASE_STANDARD: Easing = [0.16, 1, 0.3, 1];

/**
 * Hierarquia de durações
 */
export const MOTION_DURATION = {
  /** Feedback instantâneo (toggle, ripple) */
  micro: 0.14,
  /** Interações rápidas (hover, tap) */
  hover: 0.18,
  /** Cards e componentes médios */
  card: 0.24,
  /** Modais e overlays */
  modal: 0.3,
  /** Transições de página */
  page: 0.36,
  /** Animações complexas (logo, sequences) */
  complex: 0.42,
} as const;

// ================================================== 
// 2. HELPERS - Transition Builders
// ================================================== 

/**
 * Cria transition padrão com easing e duração
 */
export const transition = (
  duration: number = MOTION_DURATION.card,
  ease: Easing = EASE_STANDARD
): Transition => ({
  duration,
  ease,
});

/**
 * Spring sem bounce (controlado)
 * Para interações que precisam de física sutil
 */
export const spring = (
  stiffness: number = 300,
  damping: number = 30
): Transition => ({
  type: 'spring',
  stiffness,
  damping,
  mass: 1,
});

/**
 * Transition reduzida para prefers-reduced-motion
 */
export const reducedTransition = (): Transition => ({
  duration: 0.01,
  ease: 'linear',
});

/**
 * Detecta preferência do usuário por movimento reduzido
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Retorna transition apropriada baseado em prefers-reduced-motion
 */
export const safeTransition = (
  duration: number = MOTION_DURATION.card,
  ease: Easing = EASE_STANDARD
): Transition => {
  return prefersReducedMotion() ? reducedTransition() : transition(duration, ease);
};

// ================================================== 
// 3. VARIANTS REUTILIZÁVEIS
// ================================================== 

/**
 * Page Transition - Entrada/saída de páginas
 */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

export const pageTransition = safeTransition(MOTION_DURATION.page);

/**
 * Card Variants - Cards com hover
 */
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -2 },
};

/**
 * Modal Variants - Modais e dialogs
 */
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export const modalTransition = safeTransition(MOTION_DURATION.modal);

/**
 * Modal Backdrop - Fundo escuro de modais
 */
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Drawer Variants - Slide-in panels (lateral)
 */
export const drawerVariants = {
  left: {
    initial: { x: -320, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -320, opacity: 0 },
  },
  right: {
    initial: { x: 320, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 320, opacity: 0 },
  },
  top: {
    initial: { y: -200, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -200, opacity: 0 },
  },
  bottom: {
    initial: { y: 200, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 200, opacity: 0 },
  },
};

/**
 * Fade Variants - Apenas opacity
 */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Slide Variants - Deslizamento simples
 */
export const slideVariants = {
  up: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  down: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
  left: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  right: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
};

/**
 * Stagger Container - Para listas animadas
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

/**
 * Stagger Child - Item de lista
 */
export const staggerChildVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

// ================================================== 
// 4. PRESETS PARA INTERAÇÕES
// ================================================== 

/**
 * Button Tap - Hover + Active states
 */
export const buttonTap = {
  whileHover: {
    scale: 1.015,
    transition: safeTransition(MOTION_DURATION.hover),
  },
  whileTap: {
    scale: 0.985,
    transition: safeTransition(MOTION_DURATION.micro),
  },
};

/**
 * Card Hover - Elevação sutil
 */
export const cardHover = {
  whileHover: {
    y: -2,
    transition: safeTransition(MOTION_DURATION.hover),
  },
};

/**
 * Card Hover com Scale - Alternativa
 */
export const cardHoverScale = {
  whileHover: {
    scale: 1.01,
    transition: safeTransition(MOTION_DURATION.hover),
  },
};

/**
 * Risk Item Enter - Para alertas e notificações
 */
export const riskItemEnter: Variants = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -6 },
};

export const riskTransition = safeTransition(0.28);

/**
 * Health Update - Para métricas do dashboard
 */
export const healthUpdateVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

/**
 * Icon Pulse - Ícone com atenção sutil
 */
export const iconPulse = {
  animate: {
    scale: [1, 1.08, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
      ease: EASE_STANDARD,
    },
  },
};

// ================================================== 
// 5. LOGO ANIMATION
// ================================================== 

/**
 * Logo Sequence - Animação do T + F + quadrado
 */
export const logoSequence = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },
  topBar: {
    initial: { scaleX: 0, transformOrigin: 'left' },
    animate: { scaleX: 1 },
    transition: transition(0.14),
  },
  stem: {
    initial: { scaleY: 0, transformOrigin: 'top' },
    animate: { scaleY: 1 },
    transition: transition(0.14),
  },
  fLetter: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: transition(0.1),
  },
  square: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: transition(0.14),
  },
};

// ================================================== 
// 6. UTILITY & CONFIG
// ================================================== 

/**
 * AnimatePresence config padrão
 */
export const animatePresenceConfig = {
  mode: 'wait' as const,
  initial: true,
};

/**
 * AnimatePresence para listas (sem wait)
 */
export const animatePresenceList = {
  initial: false,
};

/**
 * Adiciona will-change apenas durante animação
 * Performance optimization
 */
export const withWillChange = (element: HTMLElement, duration: number = 400) => {
  element.style.willChange = 'transform, opacity';
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, duration);
};

/**
 * Viewport options para animações on-scroll
 */
export const viewportOnce = {
  once: true,
  margin: '0px 0px -80px 0px',
};

export const viewport = {
  margin: '0px 0px -80px 0px',
};

// ================================================== 
// 7. WRAPPERS OPCIONAIS (Props helpers)
// ================================================== 

/**
 * Props para Page wrapper
 */
export const pageProps = {
  variants: pageVariants,
  initial: 'initial' as const,
  animate: 'animate' as const,
  exit: 'exit' as const,
  transition: pageTransition,
};

/**
 * Props para Modal wrapper
 */
export const modalProps = {
  variants: modalVariants,
  initial: 'initial' as const,
  animate: 'animate' as const,
  exit: 'exit' as const,
  transition: modalTransition,
};

/**
 * Props para Card wrapper
 */
export const cardProps = {
  variants: cardVariants,
  initial: 'initial' as const,
  animate: 'animate' as const,
  ...cardHover,
};

/**
 * Props para Fade wrapper
 */
export const fadeProps = {
  variants: fadeVariants,
  initial: 'initial' as const,
  animate: 'animate' as const,
  exit: 'exit' as const,
  transition: safeTransition(MOTION_DURATION.card),
};

/**
 * Props para Stagger Container
 */
export const staggerContainerProps = {
  variants: staggerContainerVariants,
  initial: 'initial' as const,
  animate: 'animate' as const,
  exit: 'exit' as const,
};

/**
 * Props para Stagger Child
 */
export const staggerChildProps = {
  variants: staggerChildVariants,
  transition: safeTransition(0.32),
};

// ================================================== 
// 8. PRESETS ESPECÍFICOS DO TASKFORGE
// ================================================== 

/**
 * Decision Card - Animação para cards de decisão
 */
export const decisionCardVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96 },
};

/**
 * Risk Alert - Alertas de risco com slide
 */
export const riskAlertVariants: Variants = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -6 },
};

/**
 * Strategic DNA Badge - Badge animado
 */
export const dnaBadgeVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.05 },
};

/**
 * Notification Bell - Sino de notificações
 */
export const notificationBellAnimation = {
  ring: {
    rotate: [0, 12, -12, 8, -8, 4, -4, 0],
    transition: {
      duration: 0.5,
      ease: EASE_STANDARD,
    },
  },
};

/**
 * Counter Animation - Números animados (DNA scores)
 */
export const counterSpring = spring(200, 25);

// ================================================== 
// 9. EXPORTS CONSOLIDADOS
// ================================================== 

// Tokens
export { EASE_STANDARD as ease, MOTION_DURATION as duration };

// Transitions padrão
export const transitions = {
  micro: safeTransition(MOTION_DURATION.micro),
  hover: safeTransition(MOTION_DURATION.hover),
  card: safeTransition(MOTION_DURATION.card),
  modal: safeTransition(MOTION_DURATION.modal),
  page: safeTransition(MOTION_DURATION.page),
  complex: safeTransition(MOTION_DURATION.complex),
};

// Variants consolidados
export const variants = {
  page: pageVariants,
  card: cardVariants,
  modal: modalVariants,
  modalBackdrop: modalBackdropVariants,
  drawer: drawerVariants,
  fade: fadeVariants,
  slide: slideVariants,
  staggerContainer: staggerContainerVariants,
  staggerChild: staggerChildVariants,
  riskItem: riskItemEnter,
  healthUpdate: healthUpdateVariants,
  decisionCard: decisionCardVariants,
  riskAlert: riskAlertVariants,
  dnaBadge: dnaBadgeVariants,
};

// Presets de interação
export const presets = {
  buttonTap,
  cardHover,
  cardHoverScale,
  iconPulse,
  notificationBell: notificationBellAnimation,
};

// ================================================== 
// 10. LEGACY EXPORTS (Compatibilidade)
// ================================================== 

/**
 * @deprecated Use buttonTap
 */
export const buttonPrimary = buttonTap;

/**
 * @deprecated Use modalVariants
 */
export const modalMotion = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: {
    duration: MOTION_DURATION.modal,
    ease: EASE_STANDARD,
  },
};

/**
 * @deprecated Use modalBackdropVariants
 */
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.2,
    ease: EASE_STANDARD,
  },
};

/**
 * @deprecated Use staggerContainerVariants
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

/**
 * @deprecated Use staggerChildVariants
 */
export const staggerChild = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.32,
    ease: EASE_STANDARD,
  },
};

/**
 * @deprecated Use healthUpdateVariants
 */
export const healthUpdate = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.28,
    ease: EASE_STANDARD,
  },
};

/**
 * @deprecated Use riskAlertVariants
 */
export const riskAlert = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -6 },
  transition: {
    duration: 0.28,
    ease: EASE_STANDARD,
  },
};
