# Motion System v1.1 - TaskForge

> **Direção estética**: Levemente sofisticado (estilo Stripe)

Sistema de animações consistente, sofisticado e controlado para TaskForge.

## 🎯 Princípios

- **Sem bounce, elastic ou overshoot** – Movimento controlado e profissional
- **Apenas transform e opacity** – Performance 60fps garantida
- **Duração máxima 0.4s** – Respostas rápidas e fluidas
- **Curva única** – Consistência visual em todo o app

## 📐 Configuração Global

### Curva de Easing

```typescript
export const EASE_STANDARD = [0.16, 1, 0.3, 1];
```

Usar em todas as animações para consistência visual.

### Hierarquia de Durações

```typescript
export const MOTION_DURATION = {
  micro: 0.14,   // Feedback instantâneo (toggle, ripple)
  hover: 0.18,   // Interações rápidas (botões, cards)
  card: 0.24,    // Cards e componentes médios
  modal: 0.3,    // Modais e overlays
  page: 0.36,    // Transições de página
};
```

## 🎨 Componentes

### AnimatedPage

Wrapper para páginas com transições consistentes.

```tsx
import { AnimatedPage } from '@/components/motion';

export default function MyPage() {
  return (
    <AnimatedPage className="max-w-5xl mx-auto">
      {/* conteúdo */}
    </AnimatedPage>
  );
}
```

**Comportamento:**
- Entrada: opacity 0 → 1, translateY 12px → 0
- Saída: opacity 1 → 0, translateY 0 → 6px
- Duração: 0.36s

### MotionButton

Botão com hover e active states.

```tsx
import { MotionButton } from '@/components/motion';

<MotionButton className="btn-primary">
  Confirmar
</MotionButton>
```

**Comportamento:**
- Hover: scale 1.015
- Active: scale 0.985
- Duração: 0.18s

### CardWithHover

Card com elevação sutil no hover.

```tsx
import { CardWithHover } from '@/components/motion';

<CardWithHover className="card-standard shadow-md hover:shadow-lg">
  {/* conteúdo */}
</CardWithHover>
```

**Comportamento:**
- Hover: translateY -2px
- Duração: 0.18s
- Combinar com shadow-md → shadow-lg no CSS

### AnimatedCounter

Número animado com contagem suave.

```tsx
import { AnimatedCounter } from '@/components/motion';

<AnimatedCounter value={85} suffix="%" />
```

**Comportamento:**
- Contagem suave de número anterior até novo valor
- Glow azul sutil durante transição
- Duração: 0.28s

### AnimatedRiskAlert

Alerta com entrada deslizante.

```tsx
import { AnimatedRiskAlert } from '@/components/motion';

<AnimatedRiskAlert isVisible={showAlert}>
  <div>Mensagem de alerta</div>
</AnimatedRiskAlert>
```

**Comportamento:**
- Entrada: translateX -6px → 0, opacity 0 → 1
- Duração: 0.28s

### AnimatedLogo

Logo animado para loading inicial.

```tsx
import { AnimatedLogo } from '@/components/motion';

<AnimatedLogo className="h-12" />
```

**Comportamento:**
1. Linha superior do T desenha (0.14s)
2. Haste desce (0.14s)
3. F aparece (0.1s)
4. Quadrado laranja fade + scale (0.14s)
- Duração total: ~0.42s

## 📦 Utilitários Low-Level

Para casos customizados, use as configurações diretamente:

```tsx
import { motion } from 'motion/react';
import { cardHover, buttonPrimary, modalMotion, staggerContainer, staggerChild } from '@/lib/motion';

// Card com hover
<motion.div {...cardHover}>...</motion.div>

// Botão
<motion.button {...buttonPrimary}>...</motion.button>

// Modal
<motion.div {...modalMotion}>...</motion.div>

// Stagger container
<motion.div variants={staggerContainer} initial="initial" animate="animate">
  <motion.div {...staggerChild}>Item 1</motion.div>
  <motion.div {...staggerChild}>Item 2</motion.div>
</motion.div>
```

## 🎭 Casos de Uso

### Dashboard com Stagger

Cards aparecem sequencialmente com delay de 0.04s:

```tsx
<motion.section 
  variants={staggerContainer}
  initial="initial"
  animate="animate"
>
  <motion.div {...staggerChild}>Card 1</motion.div>
  <motion.div {...staggerChild}>Card 2</motion.div>
  <motion.div {...staggerChild}>Card 3</motion.div>
</motion.section>
```

### Modal com Backdrop

```tsx
import { motion, AnimatePresence } from 'motion/react';
import { modalMotion, modalBackdrop } from '@/lib/motion';

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div {...modalBackdrop} className="fixed inset-0 bg-black/80" />
      <motion.div {...modalMotion} className="modal-content">
        {/* conteúdo */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Transições de Página (com React Router)

```tsx
import { AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AnimatePresence>
  );
}
```

## ⚡ Performance

### Regras Obrigatórias

1. **Apenas transform e opacity** – Nunca animar width, height, padding, margin
2. **will-change com cuidado** – Usar apenas durante animação
3. **AnimatePresence** – Para elementos que entram/saem do DOM
4. **GPU acceleration** – transform e opacity usam compositing GPU

### Checklist de Performance

- ✅ Usar transform/opacity apenas
- ✅ Duração máxima 0.4s
- ✅ Evitar re-renders durante animação
- ✅ Usar layoutId para transições shared element
- ✅ Testar em dispositivos mobile

## 🚫 Não Usar

- ❌ Bounce, elastic, overshoot
- ❌ Animações longas (>0.4s)
- ❌ width/height animado
- ❌ Shake exagerado
- ❌ Multiple easing curves diferentes

## 🎯 Resultados Esperados

Motion deve parecer:
- ✨ Sofisticado
- 🌊 Fluido
- 🎮 Controlado
- 💎 Premium
- ⚡ Rápido (60fps)

---

**Versão:** v1.1  
**Data:** Março 2026  
**Stack:** Framer Motion + React + TypeScript + Tailwind CSS
