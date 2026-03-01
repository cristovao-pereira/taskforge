# Firebase Free Tier (Spark) — Política de Uso

Projeto ativo: `taskforge-addb3`

## Estado atual validado
- Billing Enabled: **No**
- Projeto ativo no workspace: **taskforge-addb3**
- Usuário autenticado: **cristovaopb@gmail.com**

Com `Billing Enabled: No`, o projeto permanece no plano Spark (free tier), sem cobrança de uso acima da cota gratuita. Se a cota acabar, o serviço limita/bloqueia operações em vez de gerar custo.

## Guardrails obrigatórios
1. **Não vincular conta de faturamento** ao projeto.
2. **Não migrar para Blaze** sem aprovação explícita.
3. **Não provisionar serviços pagos por padrão** (ex.: Cloud SQL/Data Connect provisionado).
4. **Usar apenas recursos compatíveis com Spark** para banco (Firestore/Realtime Database dentro da cota grátis).
5. **Manter ambiente separado** para testes de carga (não usar produção para stress test).

## Checklist de verificação (antes de cada deploy)
- Confirmar projeto ativo:
  - `npx -y firebase-tools@latest use --json`
- Confirmar status no MCP:
  - `firebase_get_environment` deve retornar `Billing Enabled: No`
- Confirmar que o deploy não inclui produtos pagos não planejados.

## Regras práticas para proteger cota gratuita de banco
- Habilitar regras de segurança restritivas (evitar abuso anônimo).
- Evitar consultas sem índice e leituras em loop no client.
- Paginar leituras e limitar listeners em tempo real.
- Evitar gravações repetitivas em alta frequência.
- Monitorar consumo regularmente no console Firebase.

## Critério de aceite
Consideramos “garantido no free tier” quando:
- `Billing Enabled: No` permanece verdadeiro;
- nenhum recurso pago foi provisionado;
- o projeto ativo continua `taskforge-addb3`.

## Observação importante
Não é possível garantir “uso infinito” na cota grátis: o que é garantido é **não gerar cobrança** enquanto o faturamento estiver desativado. Ao atingir limites gratuitos, o Firebase passa a limitar operações.
