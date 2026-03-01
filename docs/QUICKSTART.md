# TaskForge - Guia de Início Rápido

## 🚀 O Que Foi Implementado

Sua aplicação TaskForge agora possui:
- ✅ Migrações de banco de dados inicializadas (Prisma + SQLite)
- ✅ Autenticação Firebase (frontend + backend)
- ✅ Endpoints de API protegidos
- ✅ Segurança CORS reforçada
- ✅ Gerenciamento de usuários (sem mais user-1 fixo)
- ✅ Dados de exemplo abrangentes

## ⚡ Próximos Passos (5 minutos)

### Passo 1: Obter Configuração Web do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/project/taskforge-addb3/settings/general)
2. Role até "Seus aplicativos"
3. Clique em "Adicionar app" → Selecione "Web" (ícone </>)
4. Registre o app com o apelido "TaskForge Web"
5. Copie os valores de configuração

### Passo 2: Atualizar o Arquivo .env

Adicione estas linhas ao seu arquivo `.env` (na raiz do projeto):

```bash
# Configuração Web do Firebase (do Passo 1)
VITE_FIREBASE_API_KEY="sua-api-key-aqui"
VITE_FIREBASE_AUTH_DOMAIN="taskforge-addb3.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="taskforge-addb3"
VITE_FIREBASE_STORAGE_BUCKET="taskforge-addb3.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"
```

### Passo 3: Habilitar Provedores de Autenticação

1. Acesse [Autenticação do Firebase](https://console.firebase.google.com/project/taskforge-addb3/authentication/providers)
2. Habilite estes provedores:
   - **Email/Senha**: Clique → Habilitar → Salvar
   - **Google**: Clique → Habilitar → Salvar
   - **GitHub** (opcional): Requer configuração de app OAuth

### Passo 4: Iniciar a Aplicação

```bash
# Instalar dependências (se ainda não fez)
npm install

# Popular o banco de dados com dados de exemplo
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor iniciará em: http://localhost:5173

### Passo 5: Testar Autenticação

1. Navegue até http://localhost:5173/login
2. Tente fazer login com:
   - **Google** (mais fácil)
   - **Email/Senha** (crie uma conta primeiro)
   - **Usuário demo** não funciona mais (autenticação obrigatória)

### Passo 6: Verificar se Tudo Funciona

1. Após o login, você deve ser redirecionado para `/app/dashboard`
2. Verifique o console do navegador para erros
3. Abra o Prisma Studio para ver seu usuário:
   ```bash
   npm run db:studio
   ```
4. Seu ID de usuário será seu Firebase UID (não "user-1")

## 🐛 Solução de Problemas

### "Property 'env' does not exist"
- Make sure `src/vite-env.d.ts` exists
- Restart your TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")

### "Firebase: Error (auth/configuration-not-found)"
- You need to add Firebase config to `.env` (see Step 2)
- Make sure all `VITE_FIREBASE_*` variables are set

### "Unauthorized: No token provided"
- Firebase authentication not configured
- Make sure you're logged in
- Check browser dev tools → Network → Headers for Authorization header

### Login button does nothing
- Check browser console for Firebase errors
- Verify Firebase config in `.env`
- Ensure authentication providers are enabled in Firebase Console

### Database errors
- Run `npm run db:migrate` to apply migrations
- Run `npm run db:seed` to add demo data
- Check `prisma/dev.db` exists

## 📦 Comandos de Banco de Dados

```bash
# Visualizar banco de dados na interface gráfica
npm run db:studio

# Verificar status das migrações
npm run db:status

# Resetar banco de dados (ATENÇÃO: Deleta todos os dados)
npm run db:reset

# Executar migrações
npm run db:migrate
```

## 🔐 Notas de Segurança

- Todos os endpoints da API agora requerem autenticação
- CORS está restrito a `localhost:5173` e `localhost:5000`
- Atualize `CORS_ORIGIN` no `.env` ao fazer deploy
- Usuários são criados automaticamente no primeiro login com seu perfil do Firebase

## 📚 Documentação

- [Relatório de Implementação](./implementation-report-phase1.md) - Detalhes completos
- [Estratégia de Banco de Dados](./database-strategy.md) - Guia do banco de dados
- [Plano de Produção](./plan-taskforgeProductionVerification.prompt.md) - Roteiro
- [Variáveis de Ambiente](../.env.example) - Referência de configuração

## 🎯 Próximos Passos

### Para Produção:
1. Provisionar banco de dados PostgreSQL (Neon/Supabase)
2. Obter chave de conta de serviço do Firebase
3. Fazer deploy para Vercel/Railway/Cloud Run
4. Configurar variáveis de ambiente de produção
5. Executar migrações de produção

### Para Desenvolvimento:
1. Implementar guardas de rota (redirecionar para login se não autenticado)
2. Adicionar UI de gerenciamento de perfil de usuário
3. Testar todos os recursos com autenticação real
4. Conectar agentes de IA a serviços reais
5. Implementar processamento de documentos

## 💡 Dicas

- Use `npm run db:studio` para inspecionar e editar dados
- Verifique `docs/implementation-report-phase1.md` para detalhes completos
- Token do Firebase expira após 1 hora (renovado automaticamente)
- Todos os IDs de usuário agora são Firebase UIDs (formato: string de 28 caracteres)

## 🆘 Precisa de Ajuda?

1. Verifique o [Relatório de Implementação](./implementation-report-phase1.md)
2. Revise o Console do Firebase para erros de autenticação
3. Verifique o console do navegador para erros de frontend
4. Verifique os logs do servidor para erros de backend
5. Verifique se as variáveis de ambiente estão configuradas corretamente

---

**Status**: Pronto para teste com configuração do Firebase ✅

