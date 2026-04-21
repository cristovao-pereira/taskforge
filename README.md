# 🛠️ TaskForge

> **Sistema Operacional Estratégico Pessoal** — Transforme pensamento complexo em estrutura executável.

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&style=flat-square)
![Node](https://img.shields.io/badge/Node-20+-339933?logo=node&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Frontend** · **Backend** · **Database** · **Auth** · **Payments**

</div>

---

## ✨ O que é o TaskForge?

TaskForge combina ferramentas modernas para entregar uma experiência completa de **decisão estruturada e execução**:

| Tecnologia | Função |
|------------|--------|
| React 19 + Vite | Frontend performático |
| Express + Socket.io | API REST + tempo real |
| Prisma + PostgreSQL | Banco de dados relacional |
| Firebase Auth | Autenticação segura |
| Stripe | Pagamentos e assinaturas |
| Motion System | Animações sofisticadas |

---

## 🚀 Como Rodar Localmente

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Backend Express + Vite middleware |
| `npm run build` | Build do frontend |
| `npm run preview` | Preview do build |
| `npm run lint` | Validação TypeScript |
| `npm run db:generate` | Gera cliente Prisma |
| `npm run db:migrate` | Aplica migrações (dev) |
| `npm run db:migrate:prod` | Aplica migrações (prod) |
| `npm run db:seed` | Popula dados iniciais |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run db:status` | Status de migrações |
| `npm run db:reset` | Reset completo do banco local |

---

## 📁 Estrutura do Projeto

- `src/` — frontend React (pages, contexts, components)
- `server.ts` — backend Express + integração Vite middleware
- `prisma/` — schema, migrações e seed
- `lib/` — integrações backend (Firebase auth, Prisma)
- `docs/` — documentação de produto, implementação e operação

## Autenticação e API

- Endpoints protegidos exigem `Authorization: Bearer <Firebase ID Token>`
- Contextos do frontend evitam chamadas protegidas quando não há usuário autenticado
- Fluxo de visitante exibe UX de “Modo Visitante” em áreas internas

---

---

## 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| `401 Unauthorized` | Faça login no app ou verifique configuração do Firebase |
| `EADDRINUSE` (porta) | O servidor tenta próxima porta; mate processos `node` antigos se necessário |
| API retorna HTML | Use `npm run dev` (backend integrado), não Vite standalone |
| `Port 24678 in use` | Feche processos Vite antigos; reinicie o terminal se preciso |

---

## 🎨 Motion System v1.1

- Curva oficial: `EASE_STANDARD = [0.16, 1, 0.3, 1]`
- Durações oficiais: micro `0.14`, hover `0.18`, card `0.24`, modal `0.3`, page `0.36`
- Regras: sem bounce, sem overshoot, sem animações longas (> `0.4s`)
- Performance: animar apenas `transform` e `opacity`
- Componentes base: `AnimatedPage`, `MotionButton`, `CardWithHover`, `AnimatedCounter`, `AnimatedRiskAlert`, `AnimatedLogo`

---

## 🚀 Deployment

> **Status:** ✅ Totalmente operacional

### Infraestrutura

| Serviço | URL | Status |
|---------|-----|--------|
| Frontend (Vercel) | https://taskforge-lime.vercel.app | ✅ Ativo |
| Backend (Render) | https://taskforge-api-j84h.onrender.com | ✅ Ativo |
| Database (Neon) | PostgreSQL com replicação automática | ✅ Sincronizado |

### Recursos
- API REST respondendo (HTTP 200)
- Socket.io para comunicação em tempo real
- Health check: `/api/health`
- Firebase domains autorizados
- Stripe webhooks integrados (8 eventos)
- CORS configurado

### Documentação
- [Deploy Manual](configure-deployment-manual.md)
- [Stripe Integration](docs/stripe-integration.md)

---

## 💳 Stripe

Sistema de pagamentos com suporte a Checkout, Subscriptions e Webhooks.

### Eventos Configurados
`checkout.session.completed` · `customer.subscription.*` · `invoice.payment_succeeded/failed` · `payment_intent.succeeded/failed`

### Recursos
- Checkout com sessões
- Assinaturas recorrentes
- Gestão de clientes e faturas

📄 [Documentação completa](docs/stripe-integration.md)

---

## 🔐 Segurança Multi-tenant

### Isolation by Design
- **Auth**: Firebase JWT verificado em todo endpoint
- **Socket.io**: Rooms por usuário (não global)
- **Firebase Rules**: Acesso restrito por `request.auth.uid`
- **Database**: Todas queries filtram por `userId`
- **Auditoria**: Upload, view, retrieve, delete de documentos
- **Retenção**: 90 dias + direito de esquecimento

📄 [Política de Privacidade](docs/PRIVACY_AND_SECURITY.md)

---

## 🤖 Agentes Especialistas

| Agente | Função | Endpoint |
|--------|--------|----------|
| **DecisionForge** | Análise de risco e impacto | `/api/agents/decision` |
| **ClarityForge** | Estruturação de pensamento | `/api/agents/clarity` |
| **LeverageForge** | Execução de alto impacto | `/api/agents/leverage` |

Todos consultam documentos via `/api/agents/retrieve` e respeitam o modo estratégico configurado.
- Emitem eventos isolados por Socket.io (só o dono vê)
- Registram auditoria de consultas

**Próximos passos**: Integração com Gemini 2.5 Flash para análise real (atual: MVP pronto para Gemini).

## Documentação

- [Guia Rápido](docs/QUICKSTART.md)
- [Motion System v1.1](docs/motion-system.md)
- [Brand Guidelines](docs/brand-guidelines.md)
- [Estratégia de Banco](docs/database-strategy.md)
- [Stripe Integration](docs/stripe-integration.md)
- [Privacidade e Segurança (Multi-tenant)](docs/PRIVACY_AND_SECURITY.md)
- [Checklist Firebase Free Tier](docs/firebase-free-tier-checklist.md)
- [Relatório de Implementação Fase 1](docs/implementation-report-phase1.md)


## 📷 Demonstração (GIF)

![Demonstração da UI](public/assets/demo-screen.gif)

## Licença

Este projeto é de propriedade exclusiva da TaskForge. O código é disponibilizado apenas para visualização pública. Qualquer uso, cópia, modificação ou distribuição é proibido sem autorização prévia. Consulte [LICENSE](LICENSE) para detalhes.