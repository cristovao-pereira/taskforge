# Motion System v1.1 - TaskForge

> **Direção estética**: Levemente sofisticado (estilo Stripe)

Sistema de animações consistente, sofisticado e controlado para TaskForge.

**Stack:** Tailwind CSS v4 + Framer Motion (motion/react)

## 🎯 Princípios

- **Sem bounce, elastic ou overshoot** – Movimento controlado e profissional
- **Apenas transform e opacity** – Performance 60fps garantida
- **Duração máxima 0.42s** – Respostas rápidas e fluidas
- **Curva única** – Consistência visual em todo o app
- **Acessibilidade** – Suporte completo a `prefers-reduced-motion`

## 📐 Configuração Global

### Curva de Easing

```typescript
export const EASE_STANDARD = [0.16, 1, 0.3, 1];
```

Usar em todas as animações para consistência visual.

### Hierarquia de Durações

```typescript
export const MOTION_DURATION = {
  micro: 0.14,    // Feedback instantâneo (toggle, ripple)
  hover: 0.18,    // Interações rápidas (botões, cards)
  card: 0.24,     // Cards e componentes médios
  modal: 0.3,     // Modais e overlays
  page: 0.36,     // Transições de página
  complex: 0.42,  // Animações complexas (logo, sequences)
};
```

## 🔧 Helpers & Builders

### transition()

Cria transitions padronizadas:

```typescript
import { transition } from '@/lib/motion';

const myTransition = transition(0.3); // duration 0.3s com EASE_STANDARD
```

### spring()

Spring controlado sem bounce:

```typescript
import { spring } from '@/lib/motion';

const springTransition = spring(200, 25); // stiffness, damping
```

### safeTransition()

Auto-ajusta para `prefers-reduced-motion`:

```typescript
import { safeTransition } from '@/lib/motion';

const accessibleTransition = safeTransition(0.3);
// ↳ Retorna 0.01s linear se user preferir movimento reduzido
```

## 📦 Variants Reutilizáveis

### Page Variants

```tsx
import { motion } from 'motion/react';
import { pageProps } from '@/lib/motion';

<motion.div {...pageProps}>
  <h1>Página completa com animação</h1>
</motion.div>
```

**Ou use diretamente:**

```tsx
import { variants, transitions } from '@/lib/motion';

<motion.div
  variants={variants.page}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={transitions.page}
>
  ...
</motion.div>
```

### Card Variants

Cards com animação de entrada:

```tsx
import { cardProps } from '@/lib/motion';

<motion.div {...cardProps} className="card">
  Conteúdo
</motion.div>
```

### Modal Variants

Modais com scale sutil:

```tsx
import { modalProps, variants } from '@/lib/motion';

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div 
        variants={variants.modalBackdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 bg-black/80"
      />
      <motion.div {...modalProps} className="modal">
        Conteúdo do modal
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Drawer Variants

Painéis laterais (4 direções):

```tsx
import { variants, transitions } from '@/lib/motion';

// Drawer da esquerda
<motion.aside
  variants={variants.drawer.left}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={transitions.modal}
>
  Sidebar
</motion.aside>

// Drawer da direita
<motion.aside variants={variants.drawer.right} {...}>
  Settings panel
</motion.aside>

// Drawer de cima/baixo: drawer.top / drawer.bottom
```

### Fade & Slide Variants

**Fade simples:**

```tsx
import { fadeProps } from '@/lib/motion';

<motion.div {...fadeProps}>
  Apenas fade in/out
</motion.div>
```

**Slide (4 direções):**

```tsx
import { variants } from '@/lib/motion';

// Slide up
<motion.div variants={variants.slide.up} initial="initial" animate="animate">
  Desliza de baixo pra cima
</motion.div>

// Outras direções: slide.down, slide.left, slide.right
```

### Stagger (Listas)

Lista com animação sequencial:

```tsx
import { variants } from '@/lib/motion';

<motion.ul 
  variants={variants.staggerContainer}
  initial="initial"
  animate="animate"
>
  {items.map(item => (
    <motion.li 
      key={item.id}
      variants={variants.staggerChild}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

**Delay:** 0.04s entre children  
**Exit:** Stagger reverso (último sai primeiro)

## 🎮 Presets de Interação

### Button Tap

Hover + active states:

```tsx
import { motion } from 'motion/react';
import { presets } from '@/lib/motion';

<motion.button {...presets.buttonTap} className="btn-primary">
  Confirmar
</motion.button>
```

**Comportamento:**
- Hover: scale 1.015
- Tap: scale 0.985

### Card Hover

Elevação sutil no hover:

```tsx
import { presets } from '@/lib/motion';

<motion.div {...presets.cardHover} className="card">
  Conteúdo
</motion.div>
```

**Comportamento:**
- Hover: translateY -2px
- Combinar com `shadow-md hover:shadow-lg`

### Card Hover Scale

Alternativa com scale:

```tsx
<motion.div {...presets.cardHoverScale}>
  Scale sutil no hover
</motion.div>
```

### Icon Pulse

Pulsação infinita para chamar atenção:

```tsx
<motion.div {...presets.iconPulse}>
  🔔
</motion.div>
```

**Comportamento:**
- Scale: 1 → 1.08 → 1
- Loop: Infinito com 2s delay

### Notification Bell

Animação de "sino tocando":

```tsx
<motion.div 
  animate={presets.notificationBell.ring}
>
  🔔
</motion.div>
```

## 🎯 Presets Específicos TaskForge

### Decision Card

```tsx
import { variants } from '@/lib/motion';

<motion.div variants={variants.decisionCard}>
  Card de decisão
</motion.div>
```

### Risk Alert

```tsx
<motion.div variants={variants.riskAlert}>
  ⚠️ Alerta de risco
</motion.div>
```

### DNA Badge

```tsx
<motion.div variants={variants.dnaBadge} whileHover="hover">
  Strategic DNA Badge
</motion.div>
```

## 🎨 Componentes Existentes

Os componentes em [src/components](../src/components) podem usar a nova API:

### AnimatedPage

```tsx
import { AnimatedPage } from '@/components/AnimatedPage';

export default function MyPage() {
  return (
    <AnimatedPage className="max-w-5xl mx-auto">
      {/* conteúdo */}
    </AnimatedPage>
  );
}
```

### MotionButton

```tsx
import { MotionButton } from '@/components/MotionButton';

<MotionButton className="btn-primary">
  Confirmar
</MotionButton>
```

### CardWithHover

```tsx
import { CardWithHover } from '@/components/CardWithHover';

<CardWithHover className="shadow-md hover:shadow-lg">
  Conteúdo
</CardWithHover>
```

### AnimatedCounter, AnimatedRiskAlert, AnimatedLogo

```tsx
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { AnimatedRiskAlert } from '@/components/AnimatedRiskAlert';
import { AnimatedLogo } from '@/components/AnimatedLogo';

<AnimatedCounter value={85} suffix="%" />
<AnimatedRiskAlert isVisible={showAlert}>Alerta</AnimatedRiskAlert>
<AnimatedLogo className="h-12" />
```

**Nota:** Esses componentes usam a API legada. Refatore para usar `variants`, `transitions`, `presets` da nova API.

## 🎭 Casos de Uso

### Dashboard com Stagger

```tsx
import { motion } from 'motion/react';
import { variants } from '@/lib/motion';

<motion.section 
  variants={variants.staggerContainer}
  initial="initial"
  animate="animate"
  className="grid grid-cols-3 gap-4"
>
  {cards.map(card => (
    <motion.div 
      key={card.id}
      variants={variants.staggerChild}
      className="card"
    >
      {card.content}
    </motion.div>
  ))}
</motion.section>
```

### Modal com Backdrop

```tsx
import { motion, AnimatePresence } from 'motion/react';
import { variants, modalProps } from '@/lib/motion';

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div 
        variants={variants.modalBackdrop}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 bg-black/80" 
      />
      <motion.div {...modalProps} className="modal-content">
        {/* conteúdo */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Transições de Página (React Router)

```tsx
import { AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { pageProps } from '@/lib/motion';

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

function DashboardPage() {
  return (
    <motion.div {...pageProps}>
      {/* conteúdo */}
    </motion.div>
  );
}
```

### Notificações Toast

```tsx
import { AnimatePresence } from 'motion/react';
import { slideProps } from '@/lib/motion';

<AnimatePresence>
  {notifications.map(notif => (
    <motion.div 
      key={notif.id}
      {...slideProps('up')}
      className="toast"
    >
      {notif.message}
    </motion.div>
  ))}
</AnimatePresence>
```

## ♿ Acessibilidade

### prefers-reduced-motion

**Suporte automático com `safeTransition()`:**

```tsx
import { safeTransition } from '@/lib/motion';

<motion.div
  animate={{ opacity: 1 }}
  transition={safeTransition(0.3)} // ← Auto-ajusta
>
  Conteúdo
</motion.div>
```

**Comportamento:**
- User **sem** preferência: transition normal (0.3s)
- User **com** `prefers-reduced-motion`: transition 0.01s linear

### Teste Manual

1. **Windows:** Settings → Accessibility → Visual effects → Animation effects (OFF)
2. **macOS:** System Settings → Accessibility → Display → Reduce motion (ON)
3. **Chrome DevTools:** Command Palette → "Emulate CSS prefers-reduced-motion"

### Verificação

```tsx
import { prefersReducedMotion } from '@/lib/motion';

if (prefersReducedMotion()) {
  console.log('User prefere movimento reduzido');
}
```

## 🔄 Migração da API Legacy

### Antes (API antiga)

```tsx
import { cardHover, buttonPrimary, modalMotion } from '@/lib/motion';

<motion.div {...cardHover}>Card</motion.div>
<motion.button {...buttonPrimary}>Botão</motion.button>
<motion.div {...modalMotion}>Modal</motion.div>
```

### Depois (API nova)

```tsx
import { presets, cardProps, modalProps } from '@/lib/motion';

<motion.div {...presets.cardHover}>Card</motion.div>
<motion.button {...presets.buttonTap}>Botão</motion.button>
<motion.div {...modalProps}>Modal</motion.div>
```

**Exports legados ainda funcionam**, mas prefira a nova API para projetos novos.

## ⚡ Performance

### Regras Obrigatórias

1. **Apenas transform e opacity** – Nunca animar width, height, padding, margin
2. **will-change com cuidado** – Usar apenas durante animação
3. **AnimatePresence** – Para elementos que entram/saem do DOM
4. **GPU acceleration** – transform e opacity usam compositing GPU
5. **safeTransition()** – Respeitar prefers-reduced-motion

### Checklist de Performance

- ✅ Usar transform/opacity apenas
- ✅ Duração máxima 0.42s (complex)
- ✅ Evitar re-renders durante animação
- ✅ Usar layoutId para transições shared element
- ✅ Testar em dispositivos mobile
- ✅ Verificar 60fps com DevTools Performance Monitor
- ✅ Ativar `prefers-reduced-motion` e testar

## 🚫 Não Usar

- ❌ Bounce, elastic, overshoot
- ❌ Animações longas (>0.42s)
- ❌ width/height animado
- ❌ Shake exagerado
- ❌ Multiple easing curves diferentes
- ❌ Animações ignorando prefers-reduced-motion

## 🎯 Resultados Esperados

Motion deve parecer:
- ✨ Sofisticado (Stripe-like)
- 🌊 Fluido
- 🎮 Controlado
- 💎 Premium
- ⚡ Rápido (60fps)
- ♿ Acessível (prefers-reduced-motion)

---

**Versão:** v1.1  
**Data:** Março 2026  
**Stack:** Tailwind CSS v4 + Framer Motion (motion/react) + React 19 + TypeScript 5
