## Plan: Produção segura + verificação completa (DRAFT)

Objetivo: sair do estado híbrido (mock + backend parcial) para uma base de produção com frontend separado do backend/socket, autenticação real com Firebase, banco em Postgres e pipeline confiável. O plano prioriza segurança mínima e deploy funcional primeiro (decisão sua), depois convergência de dados e agentes. Isso reduz risco de exposição (CORS aberto, usuário hardcoded, rotas sem auth), evita dívida operacional (SQLite em produção sem migrações) e cria critérios de aceite claros por fase.

**Steps**
1. Fechar baseline de produção e variáveis por ambiente (dev/staging/prod), definindo contratos de runtime para backend e frontend em `.env.example`, `server.ts` e `vite.config.ts`.
2. Separar arquitetura de entrega: frontend estático (Vite build) em serviço de web/CDN e backend API+Socket em serviço Node, removendo dependência de middleware Vite em runtime de produção em `server.ts` e ajustando scripts em `package.json`.
3. Implementar autenticação Firebase end-to-end: emissão no client e verificação no backend (middleware auth), removendo fallback de user fixo em `src/contexts/EventContext.tsx` e `server.ts`.
4. Aplicar autorização mínima por recurso (scoping por userId autenticado) nas rotas de documentos, sugestões, perfil e métricas em `server.ts`.
5. Endurecer superfície HTTP/socket: CORS por allowlist, validação de payload em POST/PUT, limites e validação de upload por tipo real/MIME em `server.ts`.
6. Migrar banco para Postgres com Prisma: atualizar datasource em `prisma/schema.prisma`, criar histórico de migrações versionadas, estratégia de seed e plano de rollback; retirar dependência operacional de arquivos locais .db.
7. Tornar fluxos críticos transacionais no backend (criação de sugestões, aceites, logs e métricas) usando transações Prisma para evitar estados parciais em `server.ts` e `services/metricsService.ts`.
8. Unificar dados da UI com backend real: substituir consumo de mockService em `src/contexts/AppContext.tsx` por endpoints reais e sincronizar atualizações socket nas páginas de dashboard/risco/planos.
9. Evoluir agentes para execução real por backend: criar endpoints para DecisionForge, ClarityForge e LeverageForge; manter fallback por feature flag até estabilização das respostas em `src/pages/DecisionForgePage.tsx`, `src/pages/ClarityForgePage.tsx`, `src/pages/LeverageForgePage.tsx`.
10. Adicionar observabilidade operacional: logs estruturados, correlação de requisição, métricas de erro/latência e eventos de auditoria úteis para suporte em `server.ts` e `prisma/schema.prisma`.

**Verification**
- Build e tipagem: rodar `npm run lint` e `npm run build`; critério: zero erro.
- Deploy smoke (frontend separado + backend): abrir app e validar navegação autenticada; backend responde GET /api/health.
- Auth/ACL: chamadas sem token para rotas privadas devem retornar 401/403.
- CORS: origem não permitida deve falhar em preflight; origem permitida deve passar.
- Upload: arquivo >10MB rejeitado; tipo inválido rejeitado; PDF válido processa e gera eventos.
- Realtime: em duas abas, upload/aceite de sugestão atualiza ambas via socket.
- DB: npx prisma migrate status sem drift; migração sobe em ambiente limpo; rollback testado em staging.
- Consistência: aceitar sugestão cria entidade final + atualiza status + gera log/auditoria sem registros órfãos.
- Agentes: cada agente responde via endpoint real e persiste resultado relevante; fallback desligável por flag.
- Regressão funcional: Dashboard, Risk Alerts, Execution Plans e Documents exibem dados reais sem mock.

**Decisions**
- Arquitetura: frontend separado + API/Socket separado.
- Prioridade: segurança mínima + deploy funcional primeiro.
- Autenticação: Firebase Auth com verificação no backend.
- Banco: migração para Postgres.

**Restrições de Custo (Firebase Free Tier)**
- Projeto Firebase de operação: `taskforge-addb3`.
- Manter `Billing Enabled: No` (Spark/free tier).
- Não vincular conta de faturamento nem migrar para Blaze sem aprovação explícita.
- Não provisionar serviços pagos por padrão durante implementação/infra.
- Critério de custo: se a cota acabar, a operação limita; não deve haver cobrança.

Se quiser, na próxima iteração eu transformo esse DRAFT em plano de execução por sprint (Sprint 0/1/2) com esforço estimado e ordem de PRs.
