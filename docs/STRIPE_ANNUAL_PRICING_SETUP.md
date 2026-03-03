# Configuração de Preços Anuais no Stripe

## 📋 Status da Implementação

✅ **Frontend (PricingPage.tsx):**
- Toggle Mensal/Anual funcional
- Exibe corretamente os preços calculados
- Botão "Checkout" envia o priceId correto baseado no período escolhido

✅ **Backend (server.ts):**
- Webhook atualizado para reconhecer preços anuais
- Créditos mapeados para ambos os períodos

❌ **Faltando:**
- 2 Price IDs anuais no Stripe Dashboard

---

## 🔧 Próximos Passos no Stripe Dashboard

### 1️⃣ Criar Preço Anual para Builder

1. Acesse: **Stripe Dashboard → Products**
2. Procure por **"Builder"** (prod_U4X5DxJ5ZGRfab)
3. Clique em **"Add another price"**
4. Configure:
   - **Billing period:** Yearly
   - **Amount:** 854 BRL
   - **Currency:** BRL
   - **Save**

5. 📌 **Copie o Price ID** (será `price_1T...`)
   
   **Exemplo:** `price_1TAnnualBuilder` → será o ID real

### 2️⃣ Criar Preço Anual para Strategic

1. Procure por **"Strategic"** (prod_U4X2cEVz8fot8E)
2. Clique em **"Add another price"**
3. Configure:
   - **Billing period:** Yearly
   - **Amount:** 1718 BRL
   - **Currency:** BRL
   - **Save**

4. 📌 **Copie o Price ID** (será `price_1T...`)
   
   **Exemplo:** `price_1TAnnualStrategic` → será o ID real

---

## 🔄 Após Criar os Preços

### Atualizar Código com IDs Reais

**Arquivo:** `src/pages/PricingPage.tsx` (linha ~20)

```typescript
const PRICING_CONFIG = {
  builder: {
    priceIdMonthly: 'price_1T6O6QBNgnXewP8Mude8pCy8',
    priceIdAnnual: 'price_XXXXX_DO_STRIPE',  // ← Substituir com ID real
    credits: 120
  },
  strategic: {
    priceIdMonthly: 'price_1T6O6XBNgnXewP8M5BxqsMGU',
    priceIdAnnual: 'price_YYYYY_DO_STRIPE',  // ← Substituir com ID real
    credits: 300
  }
};
```

**Arquivo:** `src/pages/BillingPage.tsx` (linha ~10)

```typescript
const STRIPE_PLANS = {
  profissional: {
    priceIdAnnual: 'price_XXXXX_DO_STRIPE',  // ← Substituir
    // ... outros campos
  },
  estrategico: {
    priceIdAnnual: 'price_YYYYY_DO_STRIPE',  // ← Substituir
    // ... outros campos
  }
};
```

---

## 🧪 Teste da Funcionalidade

### Teste Manual no PricingPage

1. **Acesse:** `/pricing`
2. **Clique no toggle** Anual
3. **Preços devem mudar:**
   - Builder: R$ 89 → R$ 71/mês (854÷12)
   - Strategic: R$ 179 → R$ 143/mês (1718÷12)
4. **Label deve aparecer:** "Cobrado R$ 854/ano (20% off)"
5. **Clique em "Expandir capacidade" ou "Evoluir para Strategic"**
6. **Deve redirecionar para Stripe Checkout com o priceId anual correto**

### Teste do Webhook

Após pagamento bem-sucedido com preço anual:

1. **Usuário deve receber créditos:**
   - Builder: 2000 créditos
   - Strategic: 5000 créditos

2. **Verificar em BillingPage:**
   - Créditos aparecem no saldo da conta
   - Plano ativo reflete a assinatura anual

---

## 💾 Mapa de Preços (Referência)

| Plano | Preço Mensal | Preço Anual | Créditos | Desconto |
|-------|------------|-----------|---------|----------|
| Builder | R$ 89 | R$ 854 | 120/mês | 20% |
| Strategic | R$ 179 | R$ 1.718 | 300/mês | 20% |

---

## ⚙️ Implementação Técnica

### O que está configurado:

1. **PricingPage.tsx:**
   - `handleCheckout()` function que chama `redirectToCheckout(priceId, 'subscription')`
   - PricingCard aceita `priceIdMonthly` e `priceIdAnnual`
   - Toggle seleciona corretamente qual priceId enviar

2. **Webhook (server.ts):**
   - Mapeia preço annual → créditos mensais
   - Stripe cobra anualmente, TaskForge credita mensalmente
   - Renovação automática no mesmo dia

3. **Billing Status:**
   - `getSubscriptionStatus()` retorna priceId
   - BillingPage identifica se é mensal ou anual

---

## 🐛 Solução de Problemas

### Erro: "PreçoInválido"

**Possível causa:** priceId não configurado ou espaço/caractere inválido

**Solução:**
```bash
# Verificar IDs no Stripe Dashboard
# Copiar exatamente sem espaços
# Atualizar nos arquivos
```

### Checkout não funciona

1. Verificar `STRIPE_SECRET_KEY` no `.env`
2. Verificar se webhook está ativo
3. Ver logs no Stripe Dashboard → Events

### Créditos não aparecem

1. Webhook pode não ter processado
2. Verificar Logs em Stripe Dashboard
3. Testar webhook: `curl -X POST http://localhost:3001/api/webhooks/stripe`

---

**Última atualização:** 3 de março de 2026  
**Versão:** 1.0
