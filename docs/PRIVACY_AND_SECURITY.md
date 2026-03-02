# TaskForge - Política de Privacidade e Segurança de Dados

**Última atualização:** 2 de março de 2026

## 🔐 Princípios de Privacidade

TaskForge é um **Sistema Operacional Estratégico Pessoal** com foco em isolamento rigoroso de dados:

1. **Cada usuário existe em seu próprio espaço de dados**
2. **Nenhum cruzamento de contexto entre usuários**
3. **Auditoria completa de acesso**
4. **Retenção controlada com direito de esquecimento**

---

## 🛡️ Isolamento Multi-tenant

### Nivel 1: Autenticação
- ✅ Todos os endpoints requerem token Firebase válido (ID Token)
- ✅ Token verificado no middleware `authenticateUser` em [lib/firebaseAuth.ts](../lib/firebaseAuth.ts)
- ✅ Socket.io autentica e isola por usuário ao conectar

### Nível 2: Banco de Dados (PostgreSQL/Neon)
- ✅ Cada tabela contém campo `userId` como Foreign Key obrigatório
- ✅ Todas as queries filtram por `where: { userId }`
- ✅ Índices compostos: `(userId, status)`, `(userId, createdAt)` para performance
- ✅ Sem queries globais sem filtro de usuário

**Tabelas protegidas:**
- `User` → `id` é o identificador único (Firebase UID)
- `Document` → vinculado a `userId`
- `Decision`, `Plan`, `Risk` → todos com `userId`
- `DocumentInsight`, `DocumentAuditLog` → rastreables por usuário

### Nível 3: comunicação em Tempo Real (Socket.io)
- ✅ Socket.io autentica token na conexão
- ✅ Usuário automaticamente faz join em room: `io.socket.join(userId)`
- ✅ Eventos emitidos apenas para room do usuário: `io.to(userId).emit(...)`
- ✅ Nenhum evento global (`io.emit()`) sem isolamento

**Eventos isolados:**
- `event:new` → do usuário autenticado
- `document:uploaded`, `document:processed`, `document:deleted` → por `userId`
- `metrics:dna:update`, `metrics:health:update` → por `userId`
- `agent:decision_analysis_ready` → por `userId`

### Nível 4: Firebase (Firestore + Storage)
- ✅ **firestore.rules** ([firestore.rules](../firestore.rules)): Acesso permitido apenas se `request.auth.uid == uid`
  ```
  match /users/{uid} {
    allow read, write: if request.auth.uid == uid;
  }
  ```

- ✅ **storage.rules** ([storage.rules](../storage.rules)): Arquivos sob `documents/{uid}/*` acessíveis apenas pelo dono
  ```
  match /documents/{uid}/{allPaths=**} {
    allow read, write: if request.auth.uid == uid;
  }
  ```

---

## 📋 Endpoints de Dados Pessoais

### Recuperação de Dados
```bash
GET /api/documents              # Lista documentos do usuário
GET /api/documents/:id          # Detalhes de documento específico
GET /api/documents/:id/audit-history  # Trilha de acesso ao documento
GET /api/user/profile           # Perfil do usuário
GET /api/compliance/document-retention # Relatório de retenção
```

### Retenção de Dados
- **Padrão:** 90 dias (configurável via `DOCUMENT_RETENTION_DAYS`)
- **Expiração:** Automática após `retentionExpiresAt`
- **Limpeza:** Worker cron a cada 6 horas remove arquivos expirados
- **Auditoria:** `DocumentAuditLog` registra ação `delete`

### Direito de Esquecimento (Exclusão)
```bash
DELETE /api/documents/:id
```
- ✅ Requer propriedade do documento (validação de `userId`)
- ✅ Remove arquivo do Storage
- ✅ Marca documento como `deleted` no banco
- ✅ Registra auditoria com razão e timestamp

---

## 🔍 Auditoria e Trilha de Acesso

### DocumentAuditLog
Cada operação de documento é registrada:

```sql
CREATE TABLE "DocumentAuditLog" (
  documentId String
  userId String (FK)
  action String    -- upload, view, retrieve, delete, analyze
  reason String?
  metadata Json?   -- contexto adicional
  ipAddress String?
  createdAt DateTime
)
```

**Ações registradas:**
- `upload` - Arquivo enviado
- `view` - Usuário visualizou documento
- `retrieve` - Agente consultou documento
- `analyze` - Pipeline de análise executado
- `delete` - Documento excluído

**Consulta:**
```bash
GET /api/documents/:id/audit-history
```

---

## 🚀 Endpoints dos Agentes (com Isolamento)

### Retrieval: Buscar Contexto de Documentos
```bash
POST /api/agents/retrieve
Body: {
  query: "Riscos de expansão de mercado",
  mode: "equilibrado",        # conservador | equilibrado | expansao
  documentIds: ["..."],       # Filtro opcional
  topK: 5                     # Máximo 20
}
Response: {
  results: [
    {
      documentId,
      title,
      excerpt,
      confidence,
      insights: { decisions, risks, opportunities }
    }
  ]
}
```
- ✅ Filtra por `userId` automaticamente
- ✅ Retorna apenas documentos processados do usuário
- ✅ Registra auditoria com `action: 'retrieve'`

### DecisionForge: Análise de Risco
```bash
POST /api/agents/decision
Body: {
  decision: "Expandir para novo mercado em Q4",
  context: { mode: "equilibrado" },
  documentIds: ["..."]
}
```
- ✅ Acessa documentos do `userId` autenticado
- ✅ Emite `agent:decision_analysis_ready` apenas para usuário
- ✅ Auditoria: `action: 'agent_query'`

### ClarityForge: Estruturação
```bash
POST /api/agents/clarity
Body: {
  input: "Tenho várias ideias mas não consigo priorizar...",
  context: { mode: "equilibrado" },
  documentIds: ["..."]
}
```

### LeverageForge: Execução
```bash
POST /api/agents/leverage
Body: {
  objective: "Aumentar receita em 50% mantendo custos estáveis",
  context: { mode: "equilibrado" },
  documentIds: ["..."]
}
```

---

## 🔒 Segurança da Transmissão

- ✅ **HTTPS/TLS 1.3+**: Produção (Render + Vercel)
- ✅ **CORS configurado**: Apenas `https://taskforge-lime.vercel.app` em produção
- ✅ **Tokens JWT**: ID Tokens do Firebase com expiração 1 hora
- ✅ **Socket.io + TLS**: Conexão segura via WSS

---

## 🧹 Conformidade e Direitos

### GDPR / LGPD
- ✅ Direito de acesso: `/api/documents`, `/api/compliance/document-retention`
- ✅ Direito de retificação: `/api/user/profile` (PATCH)
- ✅ Direito de esquecimento: `DELETE /api/documents/:id` ou retenção automática
- ✅ Direito de portabilidade: Exportar dados via `documentAuditLog`

### Relatório de Compliance
```bash
GET /api/compliance/document-retention
Response: {
  summary: { totalDocuments, activeDocuments, deletedDocuments },
  retention: { expiringIn7Days, alreadyExpired },
  auditBreakdown: { upload, view, retrieve, delete },
  deletionRecords: [ ... ]  # Últimas 100 deleções com timestamp
}
```

---

## ⚠️ Limites e Políticas por Plano

| Recurso | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Max documentos/mês | 10 | 100 | Ilimitado |
| Max arquivo (MB) | 5 | 25 | 100 |
| Retenção (dias) | 30 | 90 | 365 |
| Retrieval topK | 5 | 10 | 20 |
| Auditoria (meses) | 1 | 6 | 24 |

---

## 🔧 Como Validar Isolamento

### Teste 1: Acesso Cruzado (deve falhar)
```bash
# Usuário A tenta acessar documento de Usuário B
curl -H "Authorization: Bearer tokenA" \
  https://api.taskforge/api/documents/docIdB
# Esperado: 404 Not Found
```

### Teste 2: Socket Events (deve ser isolado)
```javascript
// Socket de usuário A não recebe eventos de usuário B
// Apenas `io.to(userIdB).emit()` alcança B
// Verificar no Real-time Database que room isolation está ativa
```

### Teste 3: Índices (performance)
```sql
-- Verificar se índices composite existem
SELECT * FROM pg_indexes WHERE tablename = 'Document' AND indexname LIKE '%userId%';
-- Esperado: índices em (userId, status), (userId, createdAt)
```

---

## 📞 Suporte e Contato em Privacidade

Para questões de privacidade ou segurança:
- Email: privacy@taskforge.com
- GitHub Issues: Classificar como `security` 🔐

---

## Versão e Histórico

| Data | Versão | Mudanças |
|------|--------|----------|
| 2026-03-02 | 1.0 | Políticas iniciais: isolamento Socket.io, Firebase rules, endpoints de agentes |

---

**TaskForge** prioriza privacidade e segurança como direito fundamental de cada usuário.
