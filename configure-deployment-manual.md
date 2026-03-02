# 🚀 Configuração Manual - Vercel + Render + Firebase

O script de configuração automática requer autenticação interativa. Aqui estão os passos manuais (mais rápido):

---

## 1️⃣ Render - Adicionar Environment Variables

### Link direto:
https://dashboard.render.com/web/srv-d6is8bs50q8c739n3r4g

### Adicione estas variáveis:

```
DATABASE_URL = postgresql://user:password@c-4.us-east-1.aws.neon.tech/taskforge?sslmode=require

STRIPE_SECRET_KEY = sk_test_***

STRIPE_WEBHOOK_SECRET = whsec_***

FIREBASE_STORAGE_BUCKET = taskforge-addb3.appspot.com

FIREBASE_SERVICE_ACCOUNT_JSON = <PASTE COMPLETE JSON FROM FIREBASE CONSOLE>
```

💡 **Para FIREBASE_SERVICE_ACCOUNT_JSON:**
1. Acesse: https://console.firebase.google.com/project/taskforge-addb3/settings/serviceaccounts/adminsdk
2. Clique em "Generate New Private Key"
3. Cole o JSON completo no Render

---

## 2️⃣ Vercel - Adicionar VITE_API_URL

### Link direto:
https://vercel.com/dashboard/taskforge

### Passos:
1. Clique em **Settings** → **Environment Variables**
2. Clique em **Add New**
3. Configure:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://taskforge-api-j84h.onrender.com`
   - **Environments**: Production + Preview + Development
4. Clique em **Save**
5. Vá para deployments e clique em **Redeploy** na branch main

---

## 3️⃣ Firebase - Adicionar Authorized Domain

### Link direto:
https://console.firebase.google.com/project/taskforge-addb3/authentication/settings

### Passos:
1. Vá para **Authentication** → **Settings**
2. Scroll para **Authorized domains**
3. Clique em **Add domain**
4. Digite: `taskforge-api-j84h.onrender.com`
5. Clique em **Save**

---

## ✅ Validação

Após completar os 3 passos acima:

1. **Aguarde 5 minutos** para o Render completar o build
2. **Teste o endpoint:**
   ```bash
   curl https://taskforge-api-j84h.onrender.com/api/health
   ```
   Deve retornar JSON (não HTML)

3. **Visita o frontend:**
   - https://taskforge-lime.vercel.app
   - Abra o DevTools (F12)
   - Vá para Network → XHR
   - Faça uma ação que chame a API (ex: login)
   - Confirme que a resposta é JSON e não "Unexpected token '<'"

---

## 🔧 Debug

Se os erros continuarem:

### Frontend console mostra "Unexpected token '<'"?
- Verifique se VITE_API_URL foi adicionada à Vercel
- Confirme que o Render está respondendo: `curl https://taskforge-api-j84h.onrender.com/api/health`

### Render build falha?
- Vá ao dashboard Render e clique em "View Logs"
- Procure por erros de DATABASE_URL ou FIREBASE_SERVICE_ACCOUNT_JSON

### Socket.IO não conecta?
- Verifique CORS_ORIGIN no Render (deve incluir https://taskforge-lime.vercel.app)
