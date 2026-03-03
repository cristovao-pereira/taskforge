# Motion System - Checklist de Teste

## ✅ Performance Audit

### 1. Verificar uso de transform/opacity apenas

```bash
# Buscar animações que não usam transform/opacity
grep -rn "width:" src/ | grep -i "animate"
grep -rn "height:" src/ | grep -i "animate"
```

### 2. Verificar durações máximas (0.42s)

```bash
# Verificar MOTION_DURATION no código
grep -rn "duration:" src/ 
```

### 3. Teste de Performance (Chrome DevTools)

**Como testar:**

1. Abrir Chrome DevTools (F12)
2. Aba **Performance**
3. Clicar em **Record** (círculo vermelho)
4. Navegar pela aplicação:
   - Página inicial → Login → Dashboard
   - Abrir/fechar modais
   - Hover em cards
   - Scroll em listas com stagger
5. Clicar em **Stop**
6. Analisar:
   - **Frame rate:** Deve estar em 60fps (verde)
   - **CPU usage:** Animações não devem causar picos
   - **Layout shifts:** Nenhum (animações só com transform/opacity)

### 4. Performance Monitor (Chrome)

**Como ativar:**

1. DevTools → Menu (3 pontos) → More tools → **Performance monitor**
2. Observar durante navegação:
   - **CPU usage:** <50% durante animações
   - **Layouts / sec:** 0 (animações não causam reflow)
   - **Style recalcs / sec:** <5

---

## ♿ Teste prefers-reduced-motion

### Método 1: OS Settings

**Windows 11:**
1. Settings → Accessibility → Visual effects
2. Desligar **Animation effects**
3. Testar aplicação (animações devem ser instantâneas)

**macOS:**
1. System Settings → Accessibility → Display
2. Ativar **Reduce motion**
3. Testar aplicação

### Método 2: Chrome DevTools (Recomendado)

**Como emular:**

1. Abrir Chrome DevTools (F12)
2. Command Palette: `Ctrl+Shift+P` (Windows) ou `Cmd+Shift+P` (macOS)
3. Digitar: **"Emulate CSS prefers-reduced-motion"**
4. Selecionar: **"Emulate CSS prefers-reduced-motion: reduce"**

**Como testar:**

5. Console do DevTools:
   ```js
   window.matchMedia('(prefers-reduced-motion: reduce)').matches
   // ↳ Deve retornar `true`
   ```

6. Navegar pela aplicação:
   - Entrada de páginas (AnimatedPage)
   - Hover em botões (MotionButton)
   - Modais/Drawers
   - Cards com hover
   - Stagger em listas

**Comportamento esperado:**
- Animações ainda ocorrem, mas são **instantâneas** (0.01s)
- Sem visual "quebrado" ou content shift
- Funcionalidade idêntica (apenas mais rápido)

### Método 3: Teste Programático

**Criar componente de teste:**

```tsx
// src/components/MotionTest.tsx
import { motion } from 'motion/react';
import { safeTransition, prefersReducedMotion } from '@/lib/motion';

export function MotionTest() {
  const isReduced = prefersReducedMotion();
  
  return (
    <div className="p-8 space-y-4">
      <div className="bg-blue-100 p-4 rounded">
        <strong>Prefers Reduced Motion:</strong> 
        {isReduced ? ' ✅ ATIVADO' : ' ❌ DESATIVADO'}
      </div>
      
      <motion.div
        className="bg-green-500 p-8 rounded text-white"
        animate={{ x: 100 }}
        transition={safeTransition(0.5)}
      >
        Teste de animação (deve ser instantânea se ativado)
      </motion.div>
    </div>
  );
}
```

**Usar em uma página:**

```tsx
import { MotionTest } from '@/components/MotionTest';

function TestPage() {
  return <MotionTest />;
}
```

---

## 📋 Checklist Final

### Performance

- [ ] Todas animações usam apenas `transform` e `opacity`
- [ ] Nenhuma duração > 0.42s
- [ ] Frame rate consistente em 60fps (DevTools Performance)
- [ ] CPU usage <50% durante animações (Performance Monitor)
- [ ] Zero layout shifts (Layouts/sec = 0)
- [ ] Testado em dispositivo mobile (se possível)

### Acessibilidade

- [ ] `safeTransition()` usado em todos transitions customizados
- [ ] `prefersReducedMotion()` detecta corretamente (DevTools Console)
- [ ] Animações instantâneas com `prefers-reduced-motion: reduce` ativado
- [ ] Páginas não "quebram" visualmente com reduced motion
- [ ] Todos componentes (AnimatedPage, MotionButton, Modals) testados
- [ ] Stagger funciona corretamente (apenas mais rápido)

### Regression Testing

- [ ] Componentes legados ainda funcionam (backwards compatibility)
- [ ] Import de `motion/react` funciona (não `framer-motion`)
- [ ] Nenhum erro TypeScript após refatoração
- [ ] Dev server executa sem warnings

---

## 🐛 Problemas Comuns

### Animação não respeita prefers-reduced-motion

**Causa:** Transition sem `safeTransition()`

**Fix:**
```tsx
// ❌ Errado
<motion.div animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />

// ✅ Correto
import { safeTransition } from '@/lib/motion';
<motion.div animate={{ opacity: 1 }} transition={safeTransition(0.3)} />
```

### Frame drops durante animação

**Causa:** Animando propriedades não-compositing (width, height, etc.)

**Fix:**
```tsx
// ❌ Errado
animate={{ width: 200 }}

// ✅ Correto
animate={{ scaleX: 2, transformOrigin: 'left' }}
```

### Layout shift em animação

**Causa:** Elemento não tem tamanho fixo ou `position: absolute` faltando

**Fix:**
```tsx
// Modais/Drawers devem ter position fixed/absolute
<motion.div className="fixed inset-0" {...modalProps}>
```

---

**Última atualização:** Março 2026  
**Versão do Motion System:** v1.1
