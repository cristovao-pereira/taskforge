#!/bin/bash

# Strategic Simulation MVP - Testing Guide
# Este script testa o endpoint POST /api/simulate

# Configuração
API_BASE_URL="${API_BASE_URL:-http://localhost:5000}"
USER_ID="${USER_ID:-test-user-id}"
AUTH_TOKEN="${AUTH_TOKEN:-}"

echo "🧪 Testando Strategic Simulation MVP"
echo "=========================================="
echo "API URL: $API_BASE_URL"
echo "User ID: $USER_ID"
echo ""

# Teste 1: Simular resolução de risco
echo "📋 Teste 1: Simular resolução de risco"
echo "----------------------------------------"
curl -X POST "$API_BASE_URL/api/simulate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "hypotheticalMode": "equilibrado",
    "actions": [
      {
        "type": "resolve_risk",
        "id": "risk-1"
      }
    ]
  }' | jq '.'

echo ""
echo ""

# Teste 2: Simular múltiplas ações
echo "📋 Teste 2: Simular múltiplas ações (resolve_risk + complete_plan)"
echo "-------------------------------------------------------------------"
curl -X POST "$API_BASE_URL/api/simulate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "hypotheticalMode": "expansao",
    "actions": [
      {
        "type": "resolve_risk",
        "id": "risk-1"
      },
      {
        "type": "complete_plan",
        "id": "plan-1"
      }
    ]
  }' | jq '.'

echo ""
echo ""

# Teste 3: Modo conservador
echo "📋 Teste 3: Simular em modo Conservador"
echo "----------------------------------------"
curl -X POST "$API_BASE_URL/api/simulate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "hypotheticalMode": "conservador",
    "actions": [
      {
        "type": "complete_task",
        "id": "task-1"
      }
    ]
  }' | jq '.'

echo ""
echo ""
echo "✅ Testes concluídos!"
echo ""
echo "📊 Validação de Resposta:"
echo "- Verifique o campo 'deltas.health' e 'deltas.dna' para ver mudanças"
echo "- Verifique o campo 'explanations' para entender por que os valores mudaram"
echo "- Os dados em 'before' e 'after' mostram o estado anterior e posterior"
