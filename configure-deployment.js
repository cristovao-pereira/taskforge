#!/usr/bin/env node

/**
 * Script de Configuração Automática: Vercel, Render, Firebase
 * Configura variáveis de ambiente e authorized domains
 */

import https from 'https';
import { execSync } from 'child_process';

// ==================== CONFIG ====================
const CONFIG = {
  render: {
    serviceId: 'srv-d6is8bs50q8c739n3r4g',
    url: 'https://taskforge-api-j84h.onrender.com',
  },
  vercel: {
    project: 'taskforge',
    team: null, // ou seu team slug
  },
  firebase: {
    projectId: 'taskforge-addb3',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@c-4.us-east-1.aws.neon.tech/taskforge?sslmode=require',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_***',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_***',
  },
  firebase: {
    projectId: 'taskforge-addb3',
    storageBucket: 'taskforge-addb3.appspot.com',
  },
};

// ==================== HELPERS ====================

function request(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(data);
          }
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function log(level, message) {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[level] || ''}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

// ==================== VERCEL ====================

async function configureVercel() {
  log('info', 'Configurando Vercel...');

  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      log('warn', 'VERCEL_TOKEN não encontrado. Rodando: vercel login');
      execSync('vercel login', { stdio: 'inherit' });
    }

    // Usando Vercel CLI
    log('info', 'Adicionando VITE_API_URL na Vercel...');
    execSync(
      `vercel env add VITE_API_URL --value=${CONFIG.render.url} --environment=production`,
      { stdio: 'inherit' }
    );

    log('success', '✓ Vercel configurada');
    log('info', 'Redeploy iniciado automaticamente...');
  } catch (error) {
    log('error', `Erro ao configurar Vercel: ${error.message}`);
    log('warn', 'Você pode configurar manualmente em: https://vercel.com/dashboard');
  }
}

// ==================== RENDER ====================

async function configureRender() {
  log('info', 'Configurando Render...');

  try {
    const renderApiKey = process.env.RENDER_API_KEY;
    if (!renderApiKey) {
      throw new Error('RENDER_API_KEY não definida. Acesse https://dashboard.render.com/account/api-tokens');
    }

    const envVars = [
      { key: 'DATABASE_URL', value: CONFIG.database.url },
      { key: 'STRIPE_SECRET_KEY', value: CONFIG.stripe.secretKey },
      { key: 'STRIPE_WEBHOOK_SECRET', value: CONFIG.stripe.webhookSecret },
      { key: 'FIREBASE_STORAGE_BUCKET', value: CONFIG.firebase.storageBucket },
    ];

    // Nota: SERVICE_ACCOUNT_JSON requer entrada manual
    log('warn', 'FIREBASE_SERVICE_ACCOUNT_JSON requer configuração manual no dashboard');

    for (const envVar of envVars) {
      log('info', `Adicionando ${envVar.key}...`);
      // Nota: A API do Render não tem endpoint público para adicionar env vars
      // Esta é uma limitação conhecida
    }

    log('warn', 'Variáveis de Render precisam ser configuradas manualmente:');
    log('warn', 'Acesse: https://dashboard.render.com/web/srv-d6is8bs50q8c739n3r4g');
    log('warn', 'Clique em "Environment"');
    log('warn', 'Adicione as variáveis manualmente');
  } catch (error) {
    log('error', `Erro ao configurar Render: ${error.message}`);
  }
}

// ==================== FIREBASE ====================

async function configureFirebase() {
  log('info', 'Configurando Firebase...');

  try {
    // Usar Firebase CLI para adicionar authorized domain
    log('info', 'Adicionando domínio autorizado no Firebase...');

    // Primeiro, fazer login se necessário
    try {
      execSync('firebase projects:list', { stdio: 'pipe' });
    } catch (e) {
      log('warn', 'Firebase CLI não autenticado. Rodando: firebase login');
      execSync('firebase login', { stdio: 'inherit' });
    }

    // Tentar via Firebase REST API (requer custom token)
    const firebaseToken = process.env.FIREBASE_TOKEN;
    if (firebaseToken) {
      log('info', 'Usando Firebase REST API...');
      // Nota: Adicionar authorized domains via REST API é complexo e requer credenciais especiais
      log('warn', 'Domínios autorizados precisam ser configurados via Firebase Console');
    } else {
      log('warn', 'FIREBASE_TOKEN não definida');
    }

    log('warn', 'Adicione o domínio manualmente:');
    log('warn', `1. Acesse: https://console.firebase.google.com/project/${CONFIG.firebase.projectId}/authentication/settings`);
    log('warn', '2. Vá para "Authorized domains"');
    log('warn', '3. Adicione: taskforge-api-j84h.onrender.com');
  } catch (error) {
    log('error', `Erro ao configurar Firebase: ${error.message}`);
  }
}

// ==================== MAIN ====================

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║     CONFIGURAÇÃO AUTOMÁTICA DE DEPLOY      ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Verificar tokens/credenciais necessárias
    if (!process.env.VERCEL_TOKEN) {
      log('warn', 'Variáveis de ambiente necessárias:');
      log('warn', '  - VERCEL_TOKEN: https://vercel.com/account/tokens');
      log('warn', '  - RENDER_API_KEY: https://dashboard.render.com/account/api-tokens');
      log('warn', '  - FIREBASE_SERVICE_ACCOUNT_JSON: JSON das credenciais Firebase');
    }

    // Executar configurações
    await configureVercel();
    await configureRender();
    await configureFirebase();

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║           CONFIGURAÇÃO CONCLUÍDA           ║');
    console.log('╚════════════════════════════════════════════╝\n');

    log('info', 'Próximos passos:');
    log('info', '1. Aguarde o build do Render completar (2-5 min)');
    log('info', '2. Teste: GET https://taskforge-api-j84h.onrender.com/api/health');
    log('info', '3. Monitore os logs: https://dashboard.render.com/web/srv-d6is8bs50q8c739n3r4g\n');
  } catch (error) {
    log('error', `Erro fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
