# Integração Stripe - TaskForge

## Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Obtenha suas chaves em:
- Secret Key: https://dashboard.stripe.com/test/apikeys
- Webhook Secret: https://dashboard.stripe.com/test/webhooks

### 2. Configurar Webhook no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em "Add endpoint"
3. URL do endpoint: `https://seu-dominio.com/api/webhooks/stripe`
   - Para desenvolvimento local: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) ou [ngrok](https://ngrok.com/)
4. Eventos para escutar:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copie o "Signing secret" e adicione ao `.env` como `STRIPE_WEBHOOK_SECRET`

### 3. Testando com Stripe CLI (Desenvolvimento Local)

```bash
# Instalar Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: Ver https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks para localhost
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Copie o webhook signing secret que aparece e adicione ao .env
```

## Produtos e Preços Configurados

### Planos Mensais (Subscription)

- **Essencial**: R$ 0,00/mês - 500 créditos
  - Price ID: `price_1T6O7HBNgnXewP8Me1hVETGA`
  
- **Profissional**: R$ 199,90/mês - 2.000 créditos
  - Price ID: `price_1T6O6QBNgnXewP8Mude8pCy8`
  
- **Estratégico**: R$ 499,90/mês - 5.000 créditos
  - Price ID: `price_1T6O6XBNgnXewP8M5BxqsMGU`

### Pacotes Avulsos (One-time Payment)

- **500 créditos**: R$ 49,90
  - Price ID: `price_1T6O6bBNgnXewP8MulEJ7pza`
  
- **1.000 créditos**: R$ 89,90
  - Price ID: `price_1T6O5OBNgnXewP8MlJvNPkU6`
  
- **5.000 créditos**: R$ 399,90
  - Price ID: `price_1T6O5RBNgnXewP8MSKndCTN0`

## Endpoints da API

### POST /api/checkout/create-session
Cria uma sessão de checkout do Stripe.

**Request:**
```json
{
  "priceId": "price_1T6O6QBNgnXewP8Mude8pCy8",
  "mode": "subscription",
  "successUrl": "https://app.com/billing?success=true",
  "cancelUrl": "https://app.com/billing?canceled=true"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### POST /api/webhooks/stripe
Webhook para processar eventos do Stripe.

**Eventos tratados:**
- `checkout.session.completed`: Adiciona créditos após pagamento
- `invoice.payment_succeeded`: Renova créditos da assinatura
- `customer.subscription.deleted`: Notifica cancelamento

### GET /api/billing/subscription
Retorna status da assinatura e créditos do usuário.

**Response:**
```json
{
  "credits": 1240,
  "subscription": {
    "id": "sub_...",
    "status": "active",
    "currentPeriodEnd": 1234567890,
    "priceId": "price_1T6O6QBNgnXewP8Mude8pCy8"
  }
}
```

## Fluxo de Pagamento

1. Usuário clica em "Selecionar Plano" ou "Comprar" na página de Billing
2. Frontend chama `createCheckoutSession()` com o `priceId`
3. Backend cria uma sessão no Stripe e retorna a URL
4. Usuário é redirecionado para o Stripe Checkout
5. Após pagamento, Stripe envia webhook `checkout.session.completed`
6. Backend processa webhook e adiciona créditos ao usuário
7. Usuário é redirecionado para `/app/billing?success=true`

## Testes

### Cartões de Teste
- Sucesso: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Autenticação: `4000 0025 0000 3155`

**Data de expiração**: Qualquer data futura  
**CVC**: Qualquer 3 dígitos  
**CEP**: Qualquer 5 dígitos

### Testando Webhooks Localmente

```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Terminal 3: Trigger evento de teste
stripe trigger checkout.session.completed
```

## Segurança

- ✅ Webhook signature verification (STRIPE_WEBHOOK_SECRET)
- ✅ Autenticação Firebase para todas as chamadas API
- ✅ Validação de metadata (userId, firebaseUid)
- ✅ HTTPS obrigatório em produção

## Produção

Antes de ir para produção:

1. [ ] Substituir `sk_test_...` por `sk_live_...`
2. [ ] Configurar webhook em modo LIVE no Stripe Dashboard
3. [ ] Atualizar `STRIPE_WEBHOOK_SECRET` com o secret do webhook LIVE
4. [ ] Configurar HTTPS/TLS no servidor
5. [ ] Testar fluxo completo em ambiente de staging
6. [ ] Configurar alertas de falha de pagamento
7. [ ] Implementar retry logic para webhooks falhados

## Suporte

- Stripe Dashboard: https://dashboard.stripe.com/
- Documentação Stripe: https://stripe.com/docs
- Logs de Webhooks: https://dashboard.stripe.com/test/webhooks
