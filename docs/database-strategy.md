# Estratégia e Configuração do Banco de Dados

## Estado Atual

**Banco de Dados**: SQLite (arquivo local)  
**Localização**: `prisma/dev.db`  
**Status da Migração**: ✅ Inicializado (20260301150631_initial_schema)  
**Status do Seed**: ✅ Dados de demonstração disponíveis

## Esquema do Banco de Dados

O banco de dados TaskForge consiste em 14 modelos:

### Entidades Principais
- **User**: Contas e preferências de usuários
- **Decision**: Decisões estratégicas com rastreamento de impacto
- **Plan**: Planos de execução vinculados a decisões
- **Task**: Itens acionáveis dentro de planos
- **Risk**: Rastreamento e mitigação de riscos

### Gerenciamento de Documentos
- **Document**: Upload de arquivos e metadados
- **DocumentInsights**: Insights gerados por IA de documentos
- **DecisionSuggestion**: Recomendações de IA para decisões
- **PlanSuggestion**: Recomendações de IA para planos

### Inteligência Estratégica
- **Session**: Sessões de planejamento estratégico
- **StrategicDNA**: Perfil de tomada de decisão do usuário
- **SystemHealth**: Métricas de saúde do sistema

### Auditoria e Logging
- **EventLog**: Rastreamento de eventos do sistema
- **ExplanationLog**: Explicações de raciocínio da IA

## Configuração de Desenvolvimento

### Pré-requisitos
- Node.js instalado
- Pacotes npm instalados (`npm install`)
- Arquivo `.env` configurado

### Inicializar Banco de Dados
```bash
# Gerar Prisma Client
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular com dados de demonstração
npm run db:seed
```

### Comandos de Banco de Dados
```bash
# Abrir Prisma Studio (Interface Gráfica)
npm run db:studio

# Verificar status das migrações
npm run db:status

# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Resetar banco de dados (ATENÇÃO: Deleta todos os dados)
npm run db:reset
```

## Estratégia de Migração para Produção

### Fase 1: Provisionamento PostgreSQL (Plano Gratuito)

Escolha um provedor de plano gratuito:

#### Opção A: Neon (Recomendado)
- **Plano Gratuito**: 10 GB de armazenamento, 1 projeto
- **Configuração**: https://neon.tech
- **Vantagens**: Plano gratuito generoso, plataforma moderna, auto-scaling
- **String de Conexão**: 
  ```
  postgresql://user:pass@host/dbname?sslmode=require
  ```

#### Opção B: Supabase
- **Plano Gratuito**: 500 MB de armazenamento, 2 projetos
- **Configuração**: https://supabase.com
- **Vantagens**: Plataforma backend completa, auth integrado
- **String de Conexão**: 
  ```
  postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
  ```

#### Opção C: Railway
- **Plano Gratuito**: $5 de crédito (~ 500 horas)
- **Configuração**: https://railway.app
- **Vantagens**: Deploy fácil, boa DX
- **String de Conexão**: 
  ```
  postgresql://user:pass@host:port/dbname
  ```

### Fase 2: Passos da Migração

1. **Provisionar Banco de Dados**
   ```bash
   # Criar instância no provedor escolhido
   # Copiar string de conexão
   ```

2. **Atualizar Ambiente**
   ```bash
   # Atualizar .env para produção
   DATABASE_URL="postgresql://..."
   NODE_ENV="production"
   ```

3. **Fazer Deploy das Migrações**
   ```bash
   # Fazer deploy das migrações para produção
   npm run db:migrate:prod
   ```

4. **Verificar Conexão**
   ```bash
   # Verificar status das migrações
   npm run db:status
   
   # Abrir Prisma Studio para verificar
   npm run db:studio
   ```

5. **Migrar Dados (se necessário)**
   ```bash
   # Exportar do SQLite
   sqlite3 prisma/dev.db .dump > backup.sql
   
   # Converter e importar para PostgreSQL
   # (Passo manual - depende do volume de dados)
   ```

### Fase 3: Gerenciamento de Ambientes

#### Desenvolvimento (SQLite)
```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV="development"
```

#### Staging/Produção (PostgreSQL)
```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
NODE_ENV="production"
```

## Atualizações de Esquema

### Criando Migrações
```bash
# 1. Modificar prisma/schema.prisma
# 2. Criar e aplicar migração
npx prisma migrate dev --name nome_descritivo

# 3. Commitar arquivos de migração
git add prisma/migrations
git commit -m "Add: migração nome_descritivo"
```

### Melhores Práticas de Migração
- ✅ Use nomes descritivos para migrações
- ✅ Teste migrações em desenvolvimento primeiro
- ✅ Revise o SQL gerado antes do deploy
- ✅ Nunca edite arquivos de migração após criação
- ✅ Sempre faça backup antes de migrações em produção
- ❌ Não use `prisma db push` em produção
- ❌ Não modifique o schema sem migrações

## Estratégia de Backup

### Backup de Desenvolvimento
```bash
# Backup do SQLite
cp prisma/dev.db prisma/dev.db.backup
```

### Backup de Produção
- Use backups automatizados do provedor
- Neon: Recuperação automática point-in-time
- Supabase: Backups diários incluídos
- Railway: Snapshots de volume disponíveis

### Backup Manual
```bash
# Backup do PostgreSQL
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restaurar
psql $DATABASE_URL < backup_20260301.sql
```

## Considerações de Performance

### Índices
Índices atuais definidos em `schema.prisma`:
- User: `email` (unique)
- StrategicDNA: `userId` (unique)
- SystemHealth: `userId` (unique)

### Otimização de Queries
- Use `select` para limitar campos
- Use `include` com critério (evite N+1)
- Considere paginação para datasets grandes
- Monitore performance de queries com Prisma Studio

### Connection Pooling
Para produção, considere connection pooling:
```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
```

## Resolução de Problemas

### Problemas Comuns

**Problema**: "Database file is not a database"
```bash
# Solução: Deletar e recriar
rm prisma/dev.db
npm run db:migrate
npm run db:seed
```

**Problema**: "Migration conflicts"
```bash
# Solução: Resetar histórico de migrações
npm run db:reset
# ATENÇÃO: Isso deleta todos os dados
```

**Problema**: "Prisma Client out of sync"
```bash
# Solução: Regenerar client
npm run db:generate
```

### Conflitos de Migração
Se as migrações divergirem entre ambientes:
```bash
# 1. Verificar status
npm run db:status

# 2. Resolver manualmente
npx prisma migrate resolve --applied "20260301_migration_name"

# 3. Ou resetar (apenas desenvolvimento)
npm run db:reset
```

## Considerações de Segurança

### Strings de Conexão
- ✅ Armazene em `.env` (não commitado)
- ✅ Use credenciais diferentes por ambiente
- ✅ Habilite SSL/TLS para produção (`?sslmode=require`)
- ❌ Nunca comite DATABASE_URL no git
- ❌ Não compartilhe credenciais de produção

### Controle de Acesso
- Use usuários de banco de dados com permissões mínimas
- Banco de produção deve ter apenas leitura/escrita para a app
- Acesso admin deve ter credenciais separadas

### Auditoria e Logging
Todos os eventos importantes são registrados via modelo `EventLog`:
- Criação/atualizações de decisões
- Criação/atualizações de planos
- Avaliações de risco
- Ações de usuário

## Monitoramento

### Health Checks
```typescript
// Endpoint de health check do backend
app.get('/health/database', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'healthy', database: 'connected' })
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' })
  }
})
```

### Métricas para Rastrear
- Contagem de conexões
- Latência de queries
- Taxa de erros
- Tamanho do banco de dados
- Conexões ativas

## Conformidade com Plano Gratuito

### Limites do Plano Gratuito Neon
- ✅ 10 GB de armazenamento
- ✅ 1 projeto
- ✅ Branches ilimitados (para dev/staging)
- ⚠️ Sleep após 5 minutos de inatividade
- ⚠️ Máx 10.000 mudanças de linha/dia

### Dicas de Otimização
- Use queries eficientes
- Implemente cache quando possível
- Arquive dados antigos periodicamente
- Monitore uso de armazenamento
- Considere read replicas para escalar

## Próximos Passos

1. ✅ Banco de dados inicializado com migrações
2. ✅ Dados de demonstração criados
3. ✅ Scripts do package configurados
4. ⏳ Provisionar PostgreSQL de produção
5. ⏳ Fazer deploy das migrações para produção
6. ⏳ Implementar automação de backup
7. ⏳ Configurar alertas de monitoramento
8. ⏳ Documentar políticas de retenção de dados

---

**Última Atualização**: 1 de Março de 2026  
**Versão da Migração**: 20260301150631_initial_schema  
**Provedor do Banco de Dados**: SQLite (dev), PostgreSQL (produção planejada)
