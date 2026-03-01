# 🚀 Deploy do TaskForge na Vercel

## Pré-requisitos

- ✅ Conta no GitHub com repositório do TaskForge
- ✅ Conta na Vercel (gratuita)
- ✅ Firebase configurado e funcionando

---

## 📋 Passo a Passo

### 1. **Prepare o Repositório**

Certifique-se de que seu código está commitado:

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push origin main
```

### 2. **Conecte à Vercel**

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Importe seu repositório do GitHub
4. Selecione o repositório `taskforge`

### 3. **Configure o Projeto**

A Vercel detectará automaticamente o Vite. Confirme as configurações:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. **Configure as Variáveis de Ambiente**

Na seção **Environment Variables**, adicione:

```bash
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

**💡 Dica:** Copie os valores do seu arquivo `.env.local`

### 5. **Deploy! 🚀**

Clique em **"Deploy"** e aguarde (geralmente 1-2 minutos).

---

## 🔄 Deploys Automáticos

Após o primeiro deploy:

- ✅ **Cada push na `main`** → Deploy em produção
- ✅ **Cada Pull Request** → Preview deployment automático
- ✅ **Rollback fácil** via dashboard da Vercel

---

## 🌍 Domínio Personalizado (Opcional)

1. Vá em **Settings** > **Domains**
2. Adicione seu domínio customizado
3. Configure o DNS conforme as instruções
4. Aguarde propagação (pode levar até 48h)

---

## 📊 Monitoramento

Acesse o dashboard da Vercel para:

- 📈 Analytics de performance
- 🔍 Logs de build e runtime
- ⚡ Web Vitals automáticos
- 🌐 Tráfego e bandwidth

---

## 🔥 Firebase + Vercel

O frontend na Vercel se conecta ao:

- **Firebase Auth** (autenticação)
- **Firestore** (banco de dados)
- **Firebase Functions** (backend, se houver)

Nada muda no código - tudo continua funcionando! 🎉

---

## 🆘 Troubleshooting

### Build falha?

```bash
# Teste localmente primeiro:
npm run build
npm run preview
```

### Variáveis de ambiente não funcionam?

- Certifique-se de usar o prefixo `VITE_` em todas as env vars
- Redeploy após adicionar novas variáveis

### Página em branco após deploy?

- Verifique se o `vercel.json` tem o rewrite configurado
- Verifique erros no console do browser (F12)

---

## 📞 Suporte

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [TaskForge Issues](https://github.com/seu-usuario/taskforge/issues)

---

**✨ Seu TaskForge estará no ar em minutos!**
