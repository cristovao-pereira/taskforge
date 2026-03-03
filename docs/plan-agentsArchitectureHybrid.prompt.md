# Plan: Arquitetura de Agentes — n8n vs Express Embedded

## Executive Summary

**Recomendação: Hybrid (n8n + Express)** para volume de 10k-100k análises/mês.

n8n gerencia o processamento assíncrono de agentes com retry/escalabilidade nativa, enquanto Express fica como API limpa e lightweight. Reduz complexidade do backend (maioria da lógica sai do server.ts), melhora observabilidade, e escala melhor que workflows embedded no Express. Custo: ~20-30€/mês n8n cloud vs. 0€ self-hosted (trade-off: ops).

---

## Contexto Atual

### Planejamento Anterior (Já implementado)
- **3 agentes definidos**: DecisionForge, ClarityForge, LeverageForge
- **Endpoints criados** em server.ts (linhas 2040-2299)
- **Status**: Aguardando integração com Gemini API
- **Infraestrutura**: Express + Socket.io + Prisma + Firebase

### Suas Prioridades
- ✅ **Escalabilidade** (volume: 10k-100k análises/mês)
- ✅ **Arquitetura hybrid** (n8n + Express)
- ✅ **Código limpo + cost efficient**

---

## Comparação: Express Embedded vs n8n Hybrid

| Critério | **Planejamento Atual (Express)** | **n8n Hybrid** |
|----------|--------------------------------|---------------|
| **Onde fica lógica** | `/server.ts` endpoints + workers | n8n visual workflows |
| **Input/Output** | Frontend → Express API → Gemini | Frontend → Express API → n8n webhook |
| **Retry/Fallback** | Implementar manualmente | Nativo em n8n |
| **Escalabilidade** | Single Express instance (Node.js) | n8n handles parallelism |
| **Observabilidade** | Logs no stderr | UI visual n8n + execution history |
| **Deploy** | Vercel backend | Vercel (Express) + n8n cloud/self-hosted |
| **Custo infra** | ~13€/mês (Vercel Pro + Neon) | +0€ (self-hosted) ou +20-30€/mês (cloud) |
| **Curva aprendizado** | Código TypeScript | UI visual + node-based |
| **Manutenibilidade** | Código precisa ser versionado/testado | Visual (fácil iterar, difícil testar) |
| **Latência** | Baixa (<100ms) | Média (+200-500ms por webhook) |

---

## Quando Usar Cada Uma

### ✅ Use Express Embedded se:
- MVP muito pequeno (<1k análises/mês)
- Time pequeno, todos sabem TypeScript
- Latência crítica (<100ms)
- Quer tudo auditável em código + testes

### ✅ Use n8n Hybrid se:
- Volume 10k-100k análises/mês ← **Seu caso**
- Workflows precisam mudar frequentemente (sem deploy)
- Quer sair rápido sem codificar retry/fila
- Ops team pode lidar com n8n
- Precisa conectar muitos serviços (Slack, Discord, HTTP, etc.)

---

## Arquitetura n8n Hybrid — Detalhada

### Fluxo de Requisição

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                             │
│ User: "Analisar decisão" → AgentPage.tsx                     │
└────────────────┬─────────────────────────────────────────────┘
                 │ POST /api/agents/decision
                 │ {documentIds, context}
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ EXPRESS API (Lightweight)                                    │
│ √ Validação input + autenticação Firebase                    │
│ √ Prisma.agentJob.create({status: 'pending'})                │
│ √ HTTP POST para n8n webhook "DecisionForge trigger"         │
│ √ Retorna jobId ao frontend                                  │
└────────────────┬─────────────────────────────────────────────┘
                 │ HTTP POST webhook
                 │ {jobId, documentIds, userId}
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ n8n Workflow (DecisionForge)                                 │
│  1. Webhook trigger [documentIds]                            │
│  2. Node: "Retrieve Docs" HTTP GET /api/documents/batch      │
│  3. Node: "Prepare prompt" (format context + docs)           │
│  4. Node: "Call Gemini" (gcloud/OpenAI node + prompt)        │
│  5. Retry: ×3, backoff exponencial                           │
│  6. Node: "POST result" webhook                              │
│     HTTP POST /api/webhook/agent-result                      │
│     {jobId, result, status: 'done'}                          │
└────────────────┬─────────────────────────────────────────────┘
                 │ POST /api/webhook/agent-result
                 │
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ EXPRESS API (Webhook handler)                                │
│ √ Prisma.agentJob.update({status: 'done', result})           │
│ √ io.to(userId).emit('agent:done', result)                   │
└────────────────┬─────────────────────────────────────────────┘
                 │ WebSocket
                 ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND (Real-time update)                                  │
│ Mostra resultado do agente 🎯                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Fase 1: Refatorar Express para API-only mode
**Objetivo**: Remover lógica de agentes, manter apenas orchestração

**O que fazer**:
- Remove lógica de agentes de `server.ts` (linhas DecisionForge/Clarity/Leverage endpoints)
- Mantém: autenticação, CORS, Socket.io, Prisma queries
- Novo endpoint: `POST /api/webhook/agent-result` — recebe resultado processado de n8n

**Arquivos**:
- Modify: `server.ts` (remover ~250 linhas de agent logic)

---

### Fase 2: Criar migration DB (AgentJob)
**Objetivo**: Nova tabela para rastrear jobs de agentes

**Schema Prisma** (adicionar ao `prisma/schema.prisma`):

```prisma
model AgentJob {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  agentType         String    // "decision" | "clarity" | "leverage"
  status            String    @default("pending") // pending | processing | done | failed
  
  inputPayload      Json      // {documentIds, context, ...}
  outputResult      Json?     // resultado do agente
  errorMessage      String?   // se failed
  
  n8nExecutionId    String?   // para rastreabilidade em n8n
  
  createdAt         DateTime  @default(now())
  completedAt       DateTime?
  
  @@index([userId])
  @@index([status])
  @@index([agentType])
}
```

**Arquivos**:
- Create: Migration file (Prisma will generate)
- Modify: `prisma/schema.prisma`

---

### Fase 3: Implementar endpoints Express
**Objetivo**: API que orquestra chamadas a n8n

**Novos endpoints**:

#### POST /api/agents/decision
```typescript
// Request body
{
  documentIds: string[]
  context: string
}

// Response
{
  jobId: string
  status: "pending"
}
```

**Lógica**:
1. Validar autenticação Firebase
2. Validar documentIds (existem? propriedade do user?)
3. `Prisma.agentJob.create({agentType: 'decision', status: 'pending', inputPayload, userId})`
4. HTTP POST para n8n webhook (com jobId + payload)
5. Retorna `{jobId, status}`

#### POST /api/webhook/agent-result (Webhook de n8n)
```typescript
// Request body (de n8n)
{
  jobId: string
  result: {
    analysis: string
    suggestions: string[]
    confidence: number
  }
  status: "done" | "failed"
  error?: string
}

// Autenticação: Bearer token (n8n service key)
```

**Lógica**:
1. Validar bearer token (n8n service key)
2. `Prisma.agentJob.update({status: 'done', outputResult: result, completedAt: now()})`
3. Fetch user do agentJob para obter userId
4. `io.to(userId).emit('agent:done', {jobId, result})`
5. Retorna `{ok: true}`

**Arquivos**:
- Modify: `server.ts` (adicionar ~100 linhas)

---

### Fase 4: Setup n8n + Criar workflows
**Objetivo**: Workflows que processam agentes

**Opções de Deploy**:
- **Opção A (Recomendada MVP)**: n8n cloud (20€/mês, sem ops)
- **Opção B (Scale)**: Self-hosted em Docker (free, +ops)

**3 Workflows (um por agente)**

#### Workflow 1: DecisionForge
**Trigger**: Webhook
- Path: `/webhook/decision-forge`
- Method: POST

**Nodes**:

1. **HTTP Request: Retrieve Docs**
   - URL: `https://your-api.com/api/documents/batch`
   - Method: POST
   - Headers: `Authorization: Bearer ${FIREBASE_SERVICE_KEY}`
   - Body: `{documentIds: $.data.documentIds}`

2. **Node: Format Prompt**
   - Template: Estruturar docs + contexto em prompt para Gemini
   - Output: `{systemPrompt, userPrompt}`

3. **Node: Call Gemini API**
   - Type: "HTTP Request" ou "Google AI Nodes" (se n8n tiver)
   - URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
   - Method: POST
   - Headers: `x-goog-api-key: ${GEMINI_API_KEY}`
   - Body: Payload Gemini com prompt
   - **Retry**: On error, retry ×3 with exponential backoff

4. **Node: POST Result to Express**
   - URL: `https://your-api.com/api/webhook/agent-result`
   - Method: POST
   - Headers: `Authorization: Bearer ${N8N_SERVICE_KEY}`
   - Body:
   ```json
   {
     "jobId": "$.data.jobId",
     "result": {
       "analysis": "$.previous.google.choices[0].message.content",
       "suggestions": [],
       "confidence": 0.85
     },
     "status": "done"
   }
   ```

5. **Error Handling Node**
   - Catch errors → POST com `status: "failed"` + errorMessage

#### Workflow 2: ClarityForge (similar)
- Mesmo padrão, prompt diferente

#### Workflow 3: LeverageForge (similar)
- Mesmo padrão, prompt diferente

**Arquivos**:
- N/A (n8n UI, export JSON later)

---

### Fase 5: Testar loop Express ↔ n8n
**Testes**:
1. Trigger workflow manualmente na UI n8n (com webhook test)
2. De ponta a ponta: `Frontend → Express → n8n → Express → Frontend`
3. Validar que `AgentJob` table popula + status muda
4. Simular falha de Gemini → verificar retry × 3
5. Timeout: se n8n não responde em 30s → Express marca como failed

**Arquivos**:
- Create: `test/agents.e2e.test.ts` (opcional, E2E)

---

### Fase 6: Adaptar Frontend
**O que muda**:
- **Antes**: `await agentAPI.decision(...)` → resposta síncrona
- **Depois**: `await agentAPI.decision(...)` → jobId + polling/socket

**Componentes afetados**:
- `src/pages/DecisionForgePage.tsx` — Listen para `agent:done` socket event + mostrar resultado
- Similar para `ClarityForgePage.tsx` e `LeverageForgePage.tsx`
- Adicionar estado de "Processing..." com spinner

**API Client** (`src/lib/api.ts`):

```typescript
// Antes (síncrono)
export const decisionForge = async (documentIds, context) => {
  return await fetch('/api/agents/decision', {
    method: 'POST',
    body: JSON.stringify({documentIds, context})
  }).then(r => r.json())
}

// Depois (assíncrono + socket)
export const decisionForge = async (documentIds, context) => {
  const response = await fetch('/api/agents/decision', {
    method: 'POST',
    body: JSON.stringify({documentIds, context})
  }).then(r => r.json())
  
  return response.jobId // retorna jobId em vez de resultado
}

// Frontend escuta na componente
useEffect(() => {
  socket.on('agent:done', (data) => {
    if (data.jobId === currentJobId) {
      setResult(data.result)
      setLoading(false)
    }
  })
  
  return () => socket.off('agent:done')
}, [currentJobId])
```

**Arquivos**:
- Modify: `src/lib/api.ts` (~20 linhas)
- Modify: `src/pages/DecisionForgePage.tsx` (~50 linhas)
- Modify: `src/pages/ClarityForgePage.tsx` (~50 linhas)
- Modify: `src/pages/LeverageForgePage.tsx` (~50 linhas)

---

## Implementation Timeline

| Fase | O que | Tempo Est. | Complexidade |
|------|-------|-----------|--------------|
| **1** | Refatorar Express (remove agentes) | 2h | Média |
| **2** | Criar migration DB (AgentJob) | 1h | Baixa |
| **3** | Implementar endpoints Express | 2h | Média |
| **4** | Setup n8n + criar workflows | 3h | Alta (UI manual) |
| **5** | Testar loop Express ↔ n8n | 1h | Média |
| **6** | Adaptar frontend | 1h | Baixa |
| **Total** | | **~10h** | |

---

## Key Decisions

**Decision 1: n8n cloud vs self-hosted**
- **Recomendação**: Cloud para MVP (ops simplificado)
- **Rationale**: Sair rápido, sem ops overhead de Docker/Kubernetes
- **Switch after**: 100k+ análises/mês ou se custo n8n ficar proibitivo

**Decision 2: Gemini via n8n**
- n8n tem node nativo para Google AI Studio (simples, documentado)
- Alternativa: Custom HTTP node (mais controle, mais código)

**Decision 3: WebSocket real-time**
- Manter Socket.io para feedback imediato (`agent:done` event)
- Usuário não fica esperando polling

**Decision 4: Autenticação n8n**
- Express → n8n: Bearer token (service key gerado em n8n settings)
- n8n → Express: Bearer token (armazenar em n8n secrets)

---

## Verification Checklist

- [ ] Workflow n8n manualmente testado (trigger webhook na UI)
- [ ] E2E: Frontend → Express → n8n → Express → Frontend
- [ ] `AgentJob` table popula + status transiciona (pending → processing → done)
- [ ] Retry verificado: simular falha Gemini, confirmar n8n retenta ×3
- [ ] Timeout: Express marca como failed se n8n não responde em 30s
- [ ] Load test: 100 requisições simultâneas, latência aceitável (<5s)
- [ ] Monitor n8n: UI n8n mostra execution history + logs
- [ ] Rollback strategy: se n8n falha, Express tem fallback?

---

## Risco & Mitigation

| Risco | Impacto | Mitigation |
|-------|---------|-----------|
| **n8n cloud indisponível** | Users não conseguem usar agentes | Fallback: Express embedded para Gemini (lite) |
| **Latência +200ms** | Feedback mais lento | Otimizar n8n nodes, cache Gemini responses |
| **Gemini quota exceeded** | Agentes ficam broke | Rate limiting na API, alertas Slack |
| **Webhook desincronizado** | AgentJob stuck em "processing" | Timeout checker: marca como failed após 5min |

---

## Próximos Passos

1. Aprovar arquitetura hybrid (sim/não/refinar?)
2. Decidir: n8n cloud ou self-hosted?
3. Setup n8n (obter projeto, criar workflows)
4. Implementar Fase 1-3 no Express
5. Integrar workflows (Fase 4)
6. E2E testing (Fase 5)
7. Deploy (Fase 6 frontend + monitor)

---

## Perguntas em Aberto

1. **Qual Gemini model usar?** (gemini-pro vs gemini-vision vs gemini-pro-vision)
2. **Timeout de resposta**? (30s? 60s?)
3. **Fallback se n8n indisponível**? (degrade para Express-only?)
4. **Auditoria**: Logar todas as chamadas de agentes em EventLog ou separado?
5. **SLA esperado**: Qual latência é aceitável? (500ms? 2s?)
