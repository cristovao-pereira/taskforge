# Premium Gating - Simulação Estratégica

## Overview

**Feature**: Simulação Estratégica é exclusiva do plano **Strategic**
**Versão**: MVP
**Status**: ✅ Pronto para testes

---

## Architecture

### Database
- **User.plan**: Campo novo em Prisma schema
  - Valores: `free` | `builder` | `strategic` (default: `free`)
  - Tipo: String com default

### Backend
- **Endpoint**: `POST /api/simulate`
- **Validação**: Verifica `user.plan === 'strategic'` antes de executar
- **Resposta 403** se plano ≠ Strategic:
  ```json
  {
    "error": "PLAN_REQUIRED",
    "requiredPlan": "strategic",
    "userPlan": "free",
    "message": "Simulação Estratégica está disponível apenas no plano Strategic."
  }
  ```

### Frontend
- **Dashboard**: Botão flutuante com gating visual
  - **Strategic**: Azul (⚡), clicável, abre SimulationDrawer
  - **Free/Builder**: Cinza com lock (🔒), clicável, abre UpgradeSimulationModal
- **UpgradeSimulationModal**: Modal elegante com copy de upsell
  - CTA primária: "Evoluir para Strategic" → `/app/pricing`
  - CTA secundária: "Ver detalhes do plano"
- **SimulationDrawer**: Tag "Recurso do plano Strategic" no header

---

## Fluxo por Tipo de Usuário

### Usuário Free/Builder
1. Clica botão (⚡) no Dashboard
2. Vê icon lock (🔒) com tooltip "Disponível no plano Strategic"
3. Modal de upsell abre com:
   - Headline: "Simulação Estratégica"
   - Copy explicativa
   - 3 bullets de features
   - Botão "Evoluir para Strategic" (orange)

### Usuário Strategic
1. Clica botão (⚡) no Dashboard
2. Drawer abre normalmente
3. Vê tag "Recurso do plano Strategic" no header
4. Usa feature normalmente

---

## Testes

### Test 1: Botão Lock (Free)
**Setup**: User com plan='free'
1. Ir para Dashboard
2. Ver botão com lock (cinza)
3. Clicar botão → UpgradeSimulationModal abre

### Test 2: Botão Normal (Strategic)
**Setup**: User com plan='strategic'
1. Ir para Dashboard
2. Ver botão azul (claro)
3. Clicar botão → SimulationDrawer abre

### Test 3: Backend Validation
**Setup**: User com plan='free'
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"hypotheticalMode": "equilibrado", "actions": []}'
```
**Esperado**: 403 com erro PLAN_REQUIRED

### Test 4: Backend Success (Strategic)
**Setup**: User com plan='strategic'
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"hypotheticalMode": "equilibrado", "actions": [{"type": "resolve_risk", "id": "r1"}]}'
```
**Esperado**: 200 com SimulationResult

### Test 5: Modal CTAs
1. Abrir UpgradeSimulationModal (Free user)
2. Clicar "Evoluir para Strategic" → navega para `/app/pricing`
3. Clicar "Ver detalhes do plano" → fecha modal (placeholder)

### Test 6: Tag no Drawer
1. Logar como Strategic
2. Abrir SimulationDrawer
3. Ver "Recurso do plano Strategic" em azul no header

---

## Copy Refinado (pt-BR)

✅ **Fazer**: "Disponível no plano Strategic"
❌ **Evitar**: "Você não tem permissão"

✅ **Fazer**: "Evoluir para Strategic"
❌ **Evitar**: "Fazer upgrade"

✅ **Fazer**: Apresentar como capacidade/evolução
❌ **Evitar**: Apresentar como bloqueio/restrição

---

## Implementação Checklist

- [x] Adicionar campo `plan` ao schema Prisma User
- [x] Validação no backend `/api/simulate` (403 PLAN_REQUIRED)
- [x] Endpoint `/api/user/profile` retorna plano
- [x] Tipo User no frontend inclui `plan`
- [x] AppContext carrega plano do backend
- [x] Dashboard botão com gating visual (lock/normal)
- [x] Novo componente UpgradeSimulationModal
- [x] SimulationDrawer com tag Strategic
- [x] Copy elegante (pt-BR)
- [x] Sem TypeScript errors

---

## Próximos Passos (Out of Scope MVP)

- [ ] Analytics: Track simulate_denied_plan, simulate_opened_upsell
- [ ] Onboarding: Mostrar qual é o plano do usuário na signup
- [ ] Billing: Integrar com sistema de pagamento para upgrade
- [ ] A/B Testing: Variações de copy/CTA

---

## Files Modified/Created

### Created
- `src/components/UpgradeSimulationModal.tsx` (170 lines)

### Modified
- `prisma/schema.prisma` - Adicionado campo `plan` ao User
- `server.ts` - Validação no `/api/simulate` + retorno de plan em `/api/user/profile`
- `src/types/index.ts` - Adicionado `plan?` ao User interface
- `src/contexts/AppContext.tsx` - Carrega plan do backend
- `src/pages/DashboardPage.tsx` - Gating visual + modal integration
- `src/components/SimulationDrawer.tsx` - Tag Strategic no header
