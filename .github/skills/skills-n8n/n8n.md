# Guia Profissional de Criação de Workflows no n8n

Este documento padroniza como criar workflows de alta qualidade no n8n usando MCP, com foco em confiabilidade, segurança, manutenção e velocidade de entrega.

## Referências oficiais

- MCP Server: https://github.com/czlonkowski/n8n-mcp
- Skills: https://github.com/czlonkowski/n8n-skills

## Objetivo

Criar workflows que sejam:
- previsíveis em produção
- fáceis de manter
- observáveis
- seguros por padrão
- fáceis de evoluir sem quebrar integrações

## Princípios de engenharia

- Template-first: procurar template antes de construir do zero.
- Validação em camadas: validar nó, depois workflow, depois execução.
- Configuração explícita: não confiar em defaults críticos.
- Idempotência: prevenir duplicação em reprocessamentos.
- Tratamento de erro de ponta a ponta: timeouts, retries e fallback.
- Menor privilégio: credenciais e permissões mínimas.

## Stack recomendada

- n8n para orquestração.
- n8n-mcp para descoberta de nós, validação e operações de workflow.
- n8n-skills para acelerar decisões corretas de modelagem e troubleshooting.

## Arquitetura de workflow profissional

- Trigger claro e único por fluxo principal.
- Blocos separados por responsabilidade:
- ingestao
- validacao
- transformacao
- integracao
- persistencia
- resposta/notificacao
- error handler dedicado.
- Ramo de sucesso e ramo de falha explícitos.
- Padronização de nomes de nós com prefixos funcionais.

Padrão sugerido de nomenclatura:
- `TRG - <origem>`
- `VAL - <regra>`
- `MAP - <transformacao>`
- `ACT - <acao externa>`
- `DB - <operacao>`
- `ERR - <tratamento>`

## Processo padrão (SOP)

1. Definir contrato de entrada e saída.
2. Buscar templates semelhantes.
3. Selecionar padrão arquitetural (webhook, schedule, evento, AI, ETL).
4. Escolher nós e propriedades com base em documentação MCP.
5. Configurar cada nó com parâmetros críticos explícitos.
6. Validar configuração de nós.
7. Validar workflow completo (conexões e expressões).
8. Testar com dados reais e casos de erro.
9. Publicar com versionamento e rollback definido.
10. Monitorar execuções e ajustar gargalos.

## Checklist de qualidade antes de publicar

- Entrada validada com campos obrigatórios.
- Expressões revisadas (ex.: uso correto de `$json.body` quando aplicável).
- Timeouts definidos em chamadas HTTP.
- Retry com limite e backoff para integrações instáveis.
- Erros mapeados com mensagem operacional útil.
- Logs com contexto mínimo para suporte.
- Nenhuma credencial hardcoded.
- Fluxo testado com casos:
- sucesso
- payload inválido
- dependência externa indisponível
- duplicidade/reprocessamento

## Segurança e governança

- Armazenar segredos em credenciais/variáveis seguras.
- Evitar tokens em texto plano em arquivos.
- Aplicar menor privilégio por integração.
- Separar ambientes: dev, homolog, prod.
- Definir política de rotação de tokens.
- Revisar exposição de webhook e autenticação.

## Observabilidade

- Definir métricas mínimas:
- taxa de sucesso
- latência por etapa
- taxa de erro por integração
- volume processado por janela
- Criar rotina de auditoria de execuções.
- Registrar correlation id para rastrear ponta a ponta.

## Performance e resiliência

- Processar em lotes quando possível.
- Evitar loops sem controle.
- Reduzir payload entre nós.
- Isolar integrações lentas em subfluxos.
- Definir limites de concorrência onde fizer sentido.

## Padrões de erro e recuperação

- Erro transitório: retry com backoff.
- Erro de validação: falhar rápido com mensagem clara.
- Erro de regra de negócio: encaminhar para fila de revisão.
- Erro crítico de integração: fallback e alerta.

## MCP no dia a dia

Fluxo recomendado com n8n-mcp:
- consultar documentação da ferramenta
- buscar templates por tarefa/metadata
- buscar nós relevantes
- obter detalhes dos nós selecionados
- validar nó em modo rápido
- validar nó em modo completo
- validar workflow completo
- criar/atualizar workflow
- testar execução

Observação prática da instância:
- Um workflow pode estar com `availableInMCP: true` e ainda não aparecer em listagens se estiver vazio ou sem trigger executável.
- Se necessário, validar por ID do workflow.

## Uso das skills do n8n

As skills aceleram qualidade técnica em áreas críticas:
- Expression Syntax: reduz erros de mapeamento e sintaxe.
- MCP Tools Expert: melhora escolha e uso de ferramentas MCP.
- Workflow Patterns: ajuda na arquitetura correta do fluxo.
- Validation Expert: reduz ciclos longos de tentativa e erro.
- Node Configuration: evita combinações inválidas de propriedades.
- Code JavaScript/Python: orienta uso correto de Code node.

## Template de briefing para criar workflow profissional

Use este briefing com o agente para obter melhores resultados:

```text
Crie um workflow n8n para [objetivo de negocio].

Entradas:
- [fonte dos dados]
- [campos obrigatorios]

Saidas esperadas:
- [resultado final]

Regras de negocio:
- [regra 1]
- [regra 2]

Requisitos nao funcionais:
- timeout maximo: [valor]
- retries: [quantidade + estrategia]
- observabilidade: [logs/metricas]
- seguranca: sem segredos hardcoded

Critérios de aceite:
- [critério 1]
- [critério 2]

Aplique: template-first, validacao em camadas e tratamento de erro completo.
```

## Template de revisão técnica (code review de workflow)

```text
Revise este workflow com foco em:
- riscos de producao
- regressao comportamental
- falhas de validacao
- seguranca de credenciais
- resiliencia (timeout/retry/fallback)
- cobertura de testes de casos negativos

Entregue findings por severidade com recomendacoes objetivas.
```

## Definição de pronto (DoD)

Um workflow só está pronto quando:
- atende ao contrato de entrada e saída
- passou em validação de nós e workflow
- passou em testes de sucesso e falha
- possui estratégia de erro e observabilidade
- está documentado com propósito e limites
- pode ser operado por outra pessoa sem conhecimento implícito

## Manutenção contínua

- Revisão semanal de execuções com erro.
- Revisão mensal de performance e custo.
- Rotação periódica de credenciais.
- Refatoração quando houver crescimento de complexidade.

---

Se quiser, o próximo passo é eu criar um segundo arquivo com um blueprint pronto de workflow (Webhook -> Validação -> HTTP -> Persistência -> Resposta) já em formato JSON para importação no n8n.
