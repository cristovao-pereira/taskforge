# TaskForge

Sistema Operacional Estratégico Pessoal para decisão estruturada e execução.

TaskForge transforma pensamento complexo em estrutura executável, combinando:
- Frontend React + Vite
- Backend Express (API + Socket.io)
- Prisma ORM (SQLite em desenvolvimento)
- Autenticação Firebase (cliente + admin)

## Stack do Projeto

- React 19 + TypeScript
- Vite 6 (middleware no servidor Express)
- Tailwind CSS 4
- Express 4 + Socket.io
- Prisma 6 + SQLite (`prisma/dev.db`)
- Firebase Auth + Firebase Admin

## Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- npm

### 1) Instalar dependências

```bash
npm install
```

### 2) Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis do Firebase Web/Admin.

Exemplo mínimo (ajuste com seus valores):

```bash
# Firebase Web (frontend)
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""

# Firebase Admin (backend) - use uma das opções
FIREBASE_SERVICE_ACCOUNT_JSON=""
# ou
FIREBASE_SERVICE_ACCOUNT_PATH=""

# CORS (opcional em dev)
CORS_ORIGIN="http://localhost:5000,http://localhost:5173"
```

### 3) Preparar banco local

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4) Iniciar aplicação

```bash
npm run dev
```

O servidor sobe por padrão em `http://localhost:5000`.
Se a porta estiver ocupada, o backend escolhe automaticamente a próxima disponível.

## Scripts Disponíveis

- `npm run dev` — sobe backend Express + Vite middleware
- `npm run build` — build do frontend
- `npm run preview` — preview do build
- `npm run lint` — validação TypeScript
- `npm run db:migrate` — aplica migrações de desenvolvimento
- `npm run db:migrate:prod` — aplica migrações em produção
- `npm run db:generate` — gera cliente Prisma
- `npm run db:seed` — popula dados iniciais
- `npm run db:studio` — abre Prisma Studio
- `npm run db:status` — status de migrações
- `npm run db:reset` — reset completo do banco local

## Estrutura Principal

- `src/` — frontend React (pages, contexts, components)
- `server.ts` — backend Express + integração Vite middleware
- `prisma/` — schema, migrações e seed
- `lib/` — integrações backend (Firebase auth, Prisma)
- `docs/` — documentação de produto, implementação e operação

## Autenticação e API

- Endpoints protegidos exigem `Authorization: Bearer <Firebase ID Token>`
- Contextos do frontend evitam chamadas protegidas quando não há usuário autenticado
- Fluxo de visitante exibe UX de “Modo Visitante” em áreas internas

## Troubleshooting Rápido

### `401 Unauthorized: No token provided`
- Faça login no app antes de acessar rotas protegidas
- Verifique configuração do Firebase no `.env`

### Erro de porta em uso (`EADDRINUSE`)
- O servidor tenta automaticamente próxima porta livre
- Em caso extremo, finalize processos `node` antigos e rode `npm run dev` novamente

### API retornando HTML em vez de JSON
- Em execução via Vite standalone (`:5173`), use proxy configurado no `vite.config.ts`
- Recomendado: usar `npm run dev` (backend integrado) e abrir a porta do backend

## Documentação

- [Guia Rápido](docs/QUICKSTART.md)
- [Brand Guidelines](docs/brand-guidelines.md)
- [Estratégia de Banco](docs/database-strategy.md)
- [Checklist Firebase Free Tier](docs/firebase-free-tier-checklist.md)
- [Relatório de Implementação Fase 1](docs/implementation-report-phase1.md)

## Licença

Uso interno do projeto TaskForge.
