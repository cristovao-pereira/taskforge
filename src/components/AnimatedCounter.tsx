import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { EASE_STANDARD } from '../lib/motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  decimals?: number;
}

/**
 * AnimatedCounter Component
 * 
 * Anima números com contagem suave quando o valor muda.
 * Implementa Strategic Health Update do Motion System v1.1
 * 
 * Uso:
 * ```tsx
 * <AnimatedCounter value={85} suffix="%" />
 * ```
 */
export function AnimatedCounter({ 
  value, 
  duration = 0.28, 
  className = '', 
  suffix = '',
  decimals = 0
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prevValue.current === value) return;
    
    setIsAnimating(true);
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();
    const duration_ms = duration * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration_ms, 1);
      
      // Apply easing function (approximation of cubic-bezier)
      const easeProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const current = start + (end - start) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
        prevValue.current = end;
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toString();

  return (
    <motion.span
      className={className}
      animate={isAnimating ? {
        textShadow: [
          '0 0 0px rgba(59, 130, 246, 0)',
          '0 0 8px rgba(59, 130, 246, 0.4)',
          '0 0 0px rgba(59, 130, 246, 0)',
        ]
      } : {}}
      transition={{
        duration: duration,
        ease: EASE_STANDARD,
        times: [0, 0.5, 1]
      }}
    >
      {formatted}{suffix}
    </motion.span>
  );
}
