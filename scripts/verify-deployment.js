#!/usr/bin/env node

/**
 * Script de verificação completa do deployment
 * 
 * Verifica: Vercel, Stripe, Firebase e Gemini
 * Uso: node scripts/verify-deployment.js
 */

import 'dotenv/config';
import https from 'https';

const STATUS = {
  OK: '✅',
  WARNING: '⚠️',
  ERROR: '❌',
  PENDING: '🔴'
};

// URLs e configurações
const VERCEL_URL = 'https://taskforge-lime.vercel.app';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('🔍 Verificação Completa do Deployment TaskForge\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 1. Verificar Vercel
async function checkVercel() {
  console.log('1️⃣  VERCEL\n');
  
  return new Promise((resolve) => {
    https.get(VERCEL_URL, (res) => {
      if (res.statusCode === 200) {
        console.log(`   ${STATUS.OK} Deploy ativo: ${VERCEL_URL}`);
        console.log(`   ${STATUS.OK} Status Code: ${res.statusCode}`);
        resolve(true);
      } else {
        console.log(`   ${STATUS.WARNING} Status Code: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`   ${STATUS.ERROR} Erro: ${err.message}`);
      resolve(false);
    });
  });
}

// 2. Verificar Stripe
async function checkStripe() {
  console.log('\n2️⃣  STRIPE\n');
  
  if (!STRIPE_SECRET_KEY) {
    console.log(`   ${STATUS.ERROR} STRIPE_SECRET_KEY não encontrada`);
    return false;
  }
  
  return new Promise((resolve) => {
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
            console.log(`   ${STATUS.OK} API Key válida`);
            
            if (data.data && data.data.length > 0) {
              console.log(`   ${STATUS.OK} Webhooks configurados: ${data.data.length}`);
              
              const taskforgeWebhook = data.data.find(w => 
                w.url.includes('taskforge-lime.vercel.app')
              );
              
              if (taskforgeWebhook) {
                console.log(`   ${STATUS.OK} Webhook TaskForge: ${taskforgeWebhook.id}`);
                console.log(`   ${STATUS.OK} Status: ${taskforgeWebhook.status}`);
                console.log(`   ${STATUS.OK} Eventos: ${taskforgeWebhook.enabled_events.length}`);
                resolve(true);
              } else {
                console.log(`   ${STATUS.WARNING} Webhook TaskForge não encontrado`);
                resolve(false);
              }
            } else {
              console.log(`   ${STATUS.WARNING} Nenhum webhook configurado`);
              resolve(false);
            }
          } else {
            console.log(`   ${STATUS.ERROR} Erro na API: ${data.error?.message || 'Unknown'}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`   ${STATUS.ERROR} Erro ao processar resposta`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ${STATUS.ERROR} Erro: ${err.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

// 3. Verificar Gemini
async function checkGemini() {
  console.log('\n3️⃣  GOOGLE GEMINI AI\n');
  
  if (!GEMINI_API_KEY) {
    console.log(`   ${STATUS.ERROR} GEMINI_API_KEY não encontrada`);
    return false;
  }
  
  return new Promise((resolve) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode === 200) {
            console.log(`   ${STATUS.OK} API Key válida`);
            console.log(`   ${STATUS.OK} Modelos disponíveis: ${data.models?.length || 0}`);
            
            const gemini25 = data.models?.find(m => m.name === 'models/gemini-2.5-flash');
            if (gemini25) {
              console.log(`   ${STATUS.OK} Modelo recomendado disponível: gemini-2.5-flash`);
              resolve(true);
            } else {
              console.log(`   ${STATUS.WARNING} Modelo gemini-2.5-flash não encontrado`);
              resolve(false);
            }
          } else {
            console.log(`   ${STATUS.ERROR} Erro na API: ${data.error?.message || 'Unknown'}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`   ${STATUS.ERROR} Erro ao processar resposta`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ${STATUS.ERROR} Erro: ${err.message}`);
      resolve(false);
    });
  });
}

// 4. Verificar Firebase (nota manual)
function checkFirebase() {
  console.log('\n4️⃣  FIREBASE AUTHENTICATION\n');
  console.log(`   ${STATUS.PENDING} Requer verificação manual`);
  console.log(`   ${STATUS.PENDING} Domínios autorizados precisam ser adicionados\n`);
  console.log('   📋 Domínios para adicionar:');
  console.log('      • taskforge-lime.vercel.app');
  console.log('      • taskforge-cristovaopbs-projects.vercel.app');
  console.log('      • taskforge-cristovao-pereira-cristovaopbs-projects.vercel.app\n');
  console.log('   🔗 Link: https://console.firebase.google.com/project/taskforge-addb3/authentication/settings\n');
  console.log('   ✅ Teste: Tente fazer login em https://taskforge-lime.vercel.app/login');
  console.log('      Se NÃO aparecer erro "auth/unauthorized-domain", está OK!');
}

// Main
async function main() {
  const results = {
    vercel: false,
    stripe: false,
    gemini: false,
    firebase: 'pending'
  };

  results.vercel = await checkVercel();
  results.stripe = await checkStripe();
  results.gemini = await checkGemini();
  checkFirebase();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 RESUMO DA VERIFICAÇÃO\n');

  console.log(`Vercel:   ${results.vercel ? STATUS.OK : STATUS.ERROR}`);
  console.log(`Stripe:   ${results.stripe ? STATUS.OK : STATUS.ERROR}`);
  console.log(`Gemini:   ${results.gemini ? STATUS.OK : STATUS.ERROR}`);
  console.log(`Firebase: ${STATUS.PENDING} (Verificação manual necessária)\n`);

  const allOk = results.vercel && results.stripe && results.gemini;

  if (allOk) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 TUDO PRONTO!\n');
    console.log('Último passo: Adicione os domínios no Firebase\n');
    console.log('Depois disso, seu TaskForge estará 100% funcional! 🚀\n');
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  ATENÇÃO!\n');
    console.log('Alguns serviços apresentaram problemas.');
    console.log('Verifique os logs acima e corrija os erros.\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📚 DOCUMENTAÇÃO:\n');
  console.log('• Status completo:    DEPLOYMENT_STATUS.md');
  console.log('• Guia pós-deploy:    POST_DEPLOY_SETUP.md');
  console.log('• Setup Vercel:       VERCEL_SETUP.md\n');
}

main();
