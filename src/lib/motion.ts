/**
 * Motion System v1.1
 * Direção: Levemente sofisticado (estilo Stripe)
 * 
 * Regras:
 * - Sem bounce, elastic ou overshoot
 * - Apenas transform e opacity para performance
 * - Máximo 0.4s de duração
 * - 60fps garantido
 */

// ================================================== 
// CURVA GLOBAL OFICIAL
// ================================================== 
export const EASE_STANDARD = [0.16, 1, 0.3, 1] as const;

// ================================================== 
// HIERARQUIA DE DURAÇÕES
// ================================================== 
export const MOTION_DURATION = {
  micro: 0.14,
  hover: 0.18,
  card: 0.24,
  modal: 0.3,
  page: 0.36,
} as const;

// ================================================== 
// PAGE TRANSITIONS
// ================================================== 
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
  transition: {
    duration: MOTION_DURATION.page,
    ease: EASE_STANDARD,
  },
};

// ================================================== 
// CARD HOVER
// ================================================== 
export const cardHover = {
  whileHover: {
    y: -2,
    transition: {
      duration: MOTION_DURATION.hover,
      ease: EASE_STANDARD,
    },
  },
};

// ================================================== 
// BUTTON PRIMARY
// ================================================== 
export const buttonPrimary = {
  whileHover: {
    scale: 1.015,
    transition: {
      duration: MOTION_DURATION.hover,
      ease: EASE_STANDARD,
    },
  },
  whileTap: {
    scale: 0.985,
    transition: {
      duration: MOTION_DURATION.hover,
      ease: EASE_STANDARD,
    },
  },
};

// ================================================== 
// MODAL MOTION
// ================================================== 
export const modalMotion = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: {
    duration: MOTION_DURATION.modal,
    ease: EASE_STANDARD,
  },
};

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.2,
    ease: EASE_STANDARD,
  },
};

// ================================================== 
// DASHBOARD STAGGER
// ================================================== 
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const staggerChild = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.32,
    ease: EASE_STANDARD,
  },
};

// ================================================== 
// STRATEGIC HEALTH UPDATE
// ================================================== 
export const healthUpdate = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.28,
    ease: EASE_STANDARD,
  },
};

// ================================================== 
// RISK ALERT
// ================================================== 
export const riskAlert = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -6 },
  transition: {
    duration: 0.28,
    ease: EASE_STANDARD,
  },
};

// ================================================== 
// LOGO ANIMATION
// ================================================== 
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
    transition: {
      duration: 0.14,
      ease: EASE_STANDARD,
    },
  },
  stem: {
    initial: { scaleY: 0, transformOrigin: 'top' },
    animate: { scaleY: 1 },
    transition: {
      duration: 0.14,
      ease: EASE_STANDARD,
    },
  },
  fLetter: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.1,
      ease: EASE_STANDARD,
    },
  },
  square: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      duration: 0.14,
      ease: EASE_STANDARD,
    },
  },
};

// ================================================== 
// UTILITY FUNCTIONS
// ================================================== 

/**
 * AnimatePresence config padrão
 */
export const animatePresenceConfig = {
  mode: 'wait' as const,
  initial: true,
};

/**
 * Adiciona will-change apenas durante animação
 */
export const withWillChange = (element: HTMLElement) => {
  element.style.willChange = 'transform, opacity';
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, 400);
};
