# 🔧 Configuração Pós-Deploy - TaskForge

## Status Atual ✅

**Projeto:** TaskForge  
**Deploy:** Concluído com sucesso  
**URLs Ativas:**
- https://taskforge-lime.vercel.app (Principal)
- https://taskforge-cristovaopbs-projects.vercel.app
- https://taskforge-cristovao-pereira-cristovaopbs-projects.vercel.app

---

## 📋 Passos de Configuração

### 1️⃣ Firebase - Adicionar Domínios Autorizados

O Firebase Authentication precisa dos domínios da Vercel na lista de autorizados para funcionar corretamente.

**Manualmente via Console:**

1. Acesse o Firebase Console: https://console.firebase.google.com/project/taskforge-addb3/authentication/settings
2. Vá para **Authentication** → **Settings** → **Authorized domains**
3. Clique em **Add domain**
4. Adicione os seguintes domínios (um por vez):
   ```
   taskforge-lime.vercel.app
   taskforge-cristovaopbs-projects.vercel.app
   taskforge-cristovao-pereira-cristovaopbs-projects.vercel.app
   ```
5. Clique em **Add** para cada um

**Via Firebase CLI (Alternativa):**

```bash
# Instalar Firebase CLI (se necessário)
npm install -g firebase-tools

# Fazer login
firebase login

# Listar domínios autorizados atuais
firebase auth:export auth.json --project taskforge-addb3

# Adicionar domínios
# Nota: Não há comando direto, precisa ser feito via console ou API
```

---

### 2️⃣ Stripe - Configurar Webhook

O Stripe precisa enviar eventos de pagamento para sua aplicação.

**Passos:**

1. Acesse o Stripe Dashboard: https://dashboard.stripe.com/test/webhooks

2. Clique em **Add endpoint**

3. Configure o webhook:
   - **Endpoint URL:** `https://taskforge-lime.vercel.app/api/webhooks/stripe`
   - **Description:** TaskForge Webhook
   - **Events to send:** Selecione os eventos necessários:
     ```
     ✓ checkout.session.completed
     ✓ customer.subscription.created
     ✓ customer.subscription.updated
     ✓ customer.subscription.deleted
     ✓ invoice.payment_succeeded
     ✓ invoice.payment_failed
     ```

4. Clique em **Add endpoint**

5. **IMPORTANTE:** Copie o **Signing secret** (começa com `whsec_...`)

6. Atualize a variável de ambiente na Vercel:
   ```bash
   vercel env rm STRIPE_WEBHOOK_SECRET production
   echo "novo_webhook_secret" | vercel env add STRIPE_WEBHOOK_SECRET production
   ```

**Via Stripe CLI (Alternativa):**

```bash
# Instalar Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Fazer login
stripe login

# Criar webhook
stripe webhook_endpoints create \
  --url "https://taskforge-lime.vercel.app/api/webhooks/stripe" \
  --enabled-events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed
```

---

### 3️⃣ Vercel - Verificar Configurações

✅ **Já Configurado:**
- Deploy automático via GitHub
- Variáveis de ambiente configuradas
- Framework detection (Vite)
- Node.js 24.x

**Configurações Adicionais (Opcional):**

1. **Domínio Customizado:**
   - Acesse: https://vercel.com/cristovaopbs-projects/taskforge/settings/domains
   - Adicione seu domínio personalizado (ex: taskforge.com)

2. **Analytics:**
   - Acesse: https://vercel.com/cristovaopbs-projects/taskforge/analytics
   - Habilite Vercel Analytics para monitorar performance

3. **Edge Functions:**
   - Se necessário para melhor performance global

---

## 🧪 Teste das Configurações

### Testar Firebase Auth:

1. Acesse: https://taskforge-lime.vercel.app/login
2. Tente fazer login/cadastro
3. ✅ Deve funcionar sem erros de domínio

### Testar Stripe Webhook:

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique no webhook criado
3. Clique em **Send test webhook**
4. Selecione `checkout.session.completed`
5. ✅ Deve receber resposta 200

### Verificar Logs:

```bash
# Ver logs da Vercel
vercel logs https://taskforge-lime.vercel.app --follow

# Ver últimos erros
vercel logs https://taskforge-lime.vercel.app --output=short
```

---

## 📊 Monitoramento

### Links Úteis:

- **Vercel Dashboard:** https://vercel.com/cristovaopbs-projects/taskforge
- **Firebase Console:** https://console.firebase.google.com/project/taskforge-addb3
- **Stripe Dashboard:** https://dashboard.stripe.com/test/dashboard
- **Neon Database:** https://console.neon.tech/
- **Google AI Studio:** https://aistudio.google.com/app/apikey

### Métricas para Acompanhar:

1. **Vercel:**
   - Build time
   - Deploy frequency
   - Error rate

2. **Firebase:**
   - Autenticações diárias
   - Erros de autenticação
   - Usuários ativos

3. **Stripe:**
   - Webhooks entregues
   - Pagamentos processados
   - Falhas de pagamento

4. **Neon:**
   - Conexões ativas
   - Query performance
   - Storage usado

---

## 🚨 Troubleshooting

### Erro: "auth/unauthorized-domain"
**Solução:** Adicione o domínio no Firebase Console (Passo 1)

### Erro: "Webhook signature verification failed"
**Solução:** Verifique se o STRIPE_WEBHOOK_SECRET está correto (Passo 2)

### Erro: Build Failed
**Solução:** 
```bash
# Verificar logs
vercel logs

# Reprovar localmente
npm run build
```

### Erro: Database Connection
**Solução:** Verifique a variável DATABASE_URL na Vercel

---

## ✅ Checklist Final

- [ ] Domínios adicionados no Firebase Authentication
- [ ] Webhook configurado no Stripe
- [ ] Webhook secret atualizado na Vercel
- [ ] Testes de login funcionando
- [ ] Testes de webhook funcionando
- [ ] Monitoramento configurado
- [ ] Documentação atualizada

---

## 🎉 Próximas Melhorias

1. **Performance:**
   - Adicionar cache strategies
   - Implementar Service Worker
   - Otimizar imagens

2. **Segurança:**
   - Implementar rate limiting
   - Adicionar CSRF protection
   - Configurar Content Security Policy

3. **Observabilidade:**
   - Adicionar Sentry para error tracking
   - Implementar custom metrics
   - Configurar alertas

4. **CI/CD:**
   - Testes automatizados antes do deploy
   - Preview deployments para PRs
   - Rollback automático em caso de erro

---

**Data da configuração:** 2 de março de 2026  
**Versão do Node:** 24.x  
**Framework:** Vite
