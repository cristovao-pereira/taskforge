#!/usr/bin/env node

/**
 * Script para configurar webhook do Stripe
 * 
 * Requer: STRIPE_SECRET_KEY no .env
 * Uso: node scripts/setup-stripe-webhook.js
 */

import 'dotenv/config';
import https from 'https';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_URL = 'https://taskforge-lime.vercel.app/api/webhooks/stripe';

const EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed'
];

console.log('🔧 Configurando webhook do Stripe...\n');

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no .env');
  process.exit(1);
}

console.log('🔑 Chave Stripe:', STRIPE_SECRET_KEY.substring(0, 20) + '...\n');

// Verificar se é chave de teste ou produção
const isTestKey = STRIPE_SECRET_KEY.startsWith('sk_test_');
const keyType = isTestKey ? 'TEST' : 'LIVE';

console.log(`⚠️  Usando chave de ${keyType}\n`);

if (!isTestKey) {
  console.log('⚠️  AVISO: Você está usando uma chave LIVE!');
  console.log('   Certifique-se de que está configurando para produção.\n');
}

async function listWebhooks() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      path: '/v1/webhook_endpoints',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data.error?.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function createWebhook() {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      'url': WEBHOOK_URL,
      'description': 'TaskForge Production Webhook',
    });
    
    EVENTS.forEach(event => {
      postData.append('enabled_events[]', event);
    });

    const options = {
      hostname: 'api.stripe.com',
      path: '/v1/webhook_endpoints',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData.toString())
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data.error?.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData.toString());
    req.end();
  });
}

async function main() {
  try {
    // 1. Listar webhooks existentes
    console.log('📋 Verificando webhooks existentes...\n');
    
    const existingWebhooks = await listWebhooks();
    
    if (existingWebhooks.data && existingWebhooks.data.length > 0) {
      console.log(`✅ Encontrados ${existingWebhooks.data.length} webhooks:\n`);
      
      existingWebhooks.data.forEach((webhook, index) => {
        console.log(`   ${index + 1}. ${webhook.url}`);
        console.log(`      ID: ${webhook.id}`);
        console.log(`      Status: ${webhook.status}`);
        console.log(`      Eventos: ${webhook.enabled_events.length}`);
        
        if (webhook.url === WEBHOOK_URL) {
          console.log(`      ⚠️  Este é o mesmo endpoint que vamos configurar!`);
        }
        console.log('');
      });
      
      const hasExisting = existingWebhooks.data.some(w => w.url === WEBHOOK_URL);
      
      if (hasExisting) {
        console.log('ℹ️  O webhook para esta URL já existe.');
        console.log('   Se quiser recriar, delete o existente primeiro:\n');
        console.log('   1. Acesse: https://dashboard.stripe.com/test/webhooks');
        console.log('   2. Encontre o webhook');
        console.log('   3. Clique em "..." → "Delete endpoint"\n');
        console.log('   Ou use o Stripe CLI:');
        
        const existingWebhook = existingWebhooks.data.find(w => w.url === WEBHOOK_URL);
        console.log(`   stripe webhook_endpoints delete ${existingWebhook.id}\n`);
        
        console.log('⏭️  Pulando criação...\n');
        return;
      }
    } else {
      console.log('ℹ️  Nenhum webhook encontrado.\n');
    }
    
    // 2. Criar novo webhook
    console.log('🆕 Criando novo webhook...\n');
    console.log(`📍 URL: ${WEBHOOK_URL}`);
    console.log(`📋 Eventos (${EVENTS.length}):`)
    EVENTS.forEach(event => console.log(`   • ${event}`));
    console.log('');
    
    const webhook = await createWebhook();
    
    console.log('✅ Webhook criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 DETALHES DO WEBHOOK:\n');
    console.log(`ID: ${webhook.id}`);
    console.log(`URL: ${webhook.url}`);
    console.log(`Status: ${webhook.status}`);
    console.log(`Criado: ${new Date(webhook.created * 1000).toLocaleString()}\n`);
    
    console.log('🔐 WEBHOOK SIGNING SECRET:\n');
    console.log(`   ${webhook.secret}\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANTE: Atualizar variável de ambiente!\n');
    console.log('Execute o seguinte comando para atualizar na Vercel:\n');
    console.log(`echo "${webhook.secret}" | vercel env add STRIPE_WEBHOOK_SECRET production --force\n`);
    
    console.log('Ou adicione manualmente em:');
    console.log('https://vercel.com/cristovaopbs-projects/taskforge/settings/environment-variables\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🧪 TESTAR O WEBHOOK:\n');
    console.log('1. Acesse: https://dashboard.stripe.com/test/webhooks');
    console.log(`2. Clique no webhook: ${webhook.id}`);
    console.log('3. Clique em "Send test webhook"');
    console.log('4. Selecione um evento e envie');
    console.log('5. Verifique se recebe resposta 200\n');
    
    console.log('✨ Configuração concluída!\n');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.log('\n💡 Dicas de troubleshooting:');
    console.log('1. Verifique se a STRIPE_SECRET_KEY está correta');
    console.log('2. Verifique sua conexão com a internet');
    console.log('3. Verifique se tem permissões no Stripe Dashboard\n');
    console.log('Alternativa: Configure manualmente em');
    console.log('https://dashboard.stripe.com/test/webhooks\n');
    process.exit(1);
  }
}

main();
