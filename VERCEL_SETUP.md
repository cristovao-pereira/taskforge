# 🚀 Deploy TaskForge na Vercel

## Método 1: Interface Web (Recomendado)

### Passo 1: Importar Projeto do GitHub

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Autorize o acesso ao GitHub se necessário
5. Selecione o repositório: `cristovao-pereira/taskforge`
6. Clique em **"Import"**

### Passo 2: Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis:

#### Variáveis de Produção (Production):
```
DATABASE_URL=postgresql://neondb_owner:npg_yknQbS9e5Uum@ep-muddy-forest-aia765p4-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

FIREBASE_PROJECT_ID=taskforge-addb3

GEMINI_API_KEY=(adicione sua chave aqui)

NODE_ENV=production

STRIPE_SECRET_KEY=sk_test_51Sx9OGBNgnXewP8MJdheuXVkoELmZ1ppZUJ839FbspG6XzkYRy7yLfHt1cvS5i5ZvxDQCFO5SzjnSDUna56PdTA400FZKYA3pN

STRIPE_WEBHOOK_SECRET=whsec_feca7716f50a61b805cc3da5d17b7e5b665387d6fee3d87319d781f0be1551b1

VITE_FIREBASE_API_KEY=AIzaSyCuJXZRU5Ougfq0KJ1G9TIurk_V2O2IY6g

VITE_FIREBASE_APP_ID=1:537567219119:web:aa1870abb8b6423cca335a

VITE_FIREBASE_AUTH_DOMAIN=taskforge-addb3.firebaseapp.com

VITE_FIREBASE_MEASUREMENT_ID=G-RR7LWQTMCQ

VITE_FIREBASE_MESSAGING_SENDER_ID=537567219119

VITE_FIREBASE_PROJECT_ID=taskforge-addb3

VITE_FIREBASE_STORAGE_BUCKET=taskforge-addb3.firebasestorage.app
```

### Passo 3: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deployment
3. Seu projeto estará disponível em: `https://taskforge-xxx.vercel.app`

---

## Método 2: Script Automatizado (Requer Token da Vercel)

### Obter Token de Autenticação

1. Acesse: https://vercel.com/account/tokens
2. Crie um novo token com nome "TaskForge Deploy"
3. Copie o token gerado

### Executar Script

```bash
# Configure o token
set VERCEL_TOKEN=seu_token_aqui

# Execute o script
node scripts/setup-vercel.js
```

---

## Método 3: Vercel CLI

### 1. Fazer Login

```bash
vercel login
```

Siga as instruções no navegador para autenticar.

### 2. Fazer Deploy

```bash
cd C:\Apps\taskforge
vercel
```

### 3. Configurar Variáveis de Ambiente

```bash
# Adicionar todas as variáveis
vercel env add DATABASE_URL production
vercel env add FIREBASE_PROJECT_ID production
vercel env add GEMINI_API_KEY production
vercel env add NODE_ENV production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_APP_ID production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_MEASUREMENT_ID production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
```

### 4. Fazer Redeploy

```bash
vercel --prod
```

---

## ⚠️ Importante

1. **GEMINI_API_KEY**: Você precisa adicionar uma chave válida da API do Google Gemini
2. **Stripe**: As chaves fornecidas são de teste. Para produção, use chaves de produção
3. **Webhook Stripe**: Após o deploy, configure o webhook endpoint no Stripe para: `https://seu-dominio.vercel.app/api/webhooks/stripe`
4. **Firebase**: Certifique-se de que o domínio da Vercel está autorizado no Firebase Console

---

## 🔄 Atualizações Automáticas

Após configurar o projeto na Vercel:
- Cada push para a branch `main` cria um deploy em produção
- Cada push para outras branches cria um deploy de preview
- Pull requests geram deploys de preview automáticos

---

## 📊 Próximos Passos

1. ✅ Deploy na Vercel
2. 🔧 Configurar webhook do Stripe com a URL da Vercel
3. 🔐 Adicionar domínio da Vercel no Firebase Console (Authentication → Settings → Authorized domains)
4. 🗄️ Executar migrations do Prisma no banco Neon (se necessário)
5. 🎨 Configurar domínio customizado (opcional)
