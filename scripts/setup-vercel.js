#!/usr/bin/env node

/**
 * Script para configurar projeto TaskForge na Vercel via API
 * 
 * Requer: Token da Vercel (https://vercel.com/account/tokens)
 * Uso: VERCEL_TOKEN=xxx node scripts/setup-vercel.js
 */

const https = require('https');

// Configurações
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = 'team_weBeDDTJYJLjjOXPwSYb1Rjb';
const PROJECT_NAME = 'taskforge';
const GITHUB_REPO = 'cristovao-pereira/taskforge';

// Variáveis de ambiente a serem configuradas
const ENV_VARS = [
  {
    key: 'DATABASE_URL',
    value: 'postgresql://neondb_owner:npg_yknQbS9e5Uum@ep-muddy-forest-aia765p4-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
    target: ['production', 'preview'],
    type: 'encrypted'
  },
  {
    key: 'FIREBASE_PROJECT_ID',
    value: 'taskforge-addb3',
    target: ['production', 'preview', 'development'],
    type: 'plain'
  },
  {
    key: 'GEMINI_API_KEY',
    value: process.env.GEMINI_API_KEY || '',
    target: ['production', 'preview'],
    type: 'encrypted'
  },
  {
    key: 'NODE_ENV',
    value: 'production',
    target: ['production'],
    type: 'plain'
  },
  {
    key: 'STRIPE_SECRET_KEY',
    value: 'sk_test_51Sx9OGBNgnXewP8MJdheuXVkoELmZ1ppZUJ839FbspG6XzkYRy7yLfHt1cvS5i5ZvxDQCFO5SzjnSDUna56PdTA400FZKYA3pN',
    target: ['production', 'preview'],
    type: 'encrypted'
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    value: 'whsec_feca7716f50a61b805cc3da5d17b7e5b665387d6fee3d87319d781f0be1551b1',
    target: ['production', 'preview'],
    type: 'encrypted'
  },
  {
    key: 'VITE_FIREBASE_API_KEY',
    value: 'AIzaSyCuJXZRU5Ougfq0KJ1G9TIurk_V2O2IY6g',
    target: ['production', 'preview', 'development'],
    type: 'plain'
  },
  {
    key: 'VITE_FIREBASE_APP_ID',
    value: '1:537567219119:web:aa1870abb8b6423cca335a',
    target: ['production', 'preview', 'development'],
    type: 'plain'
  },
  {
    key: 'VITE_FIREBASE_AUTH_DOMAIN',
    value: 'taskforge-addb3.firebaseapp.com',
    target: ['production', 'preview', 'development'],
    type: 'plain'
  },
  {
    key: 'VITE_FIREBASE_MEASUREMENT_ID',
    value: 'G-RR7LWQTMCQ',
    target: ['production', 'preview', 'development'],
    type: 'plain'
  },
  {
    key: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    value: '537567219119',
    target: ['production', 'preview', 'development'],
    type: 'plain'
  },
  {
    key: 'VITE_FIREBASE_PROJECT_ID',
    value: 'taskforge-addb3',
    target: ['production', 'preview', 'development'],
    type: 'plain'
  },
  {
    key: 'VITE_FIREBASE_STORAGE_BUCKET',
    value: 'taskforge-addb3.firebasestorage.app',
    target: ['production', 'preview', 'development'],
    type: 'plain'
  }
];

// Função auxiliar para fazer requisições HTTPS
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Verificar token
if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN não configurado!');
  console.log('\n📝 Para obter um token:');
  console.log('1. Acesse: https://vercel.com/account/tokens');
  console.log('2. Crie um novo token');
  console.log('3. Execute: set VERCEL_TOKEN=seu_token_aqui');
  console.log('4. Execute novamente este script\n');
  process.exit(1);
}

console.log('🚀 Configurando TaskForge na Vercel...\n');

// Passo 1: Verificar se o projeto já existe
async function checkProject() {
  console.log('📋 Verificando projeto existente...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${PROJECT_NAME}?teamId=${TEAM_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const project = await makeRequest(options);
    console.log(`✅ Projeto encontrado: ${project.name} (${project.id})`);
    return project;
  } catch (error) {
    console.log('ℹ️  Projeto não encontrado, será criado um novo');
    return null;
  }
}

// Passo 2: Criar projeto (se não existir)
async function createProject() {
  console.log('\n🆕 Criando novo projeto...');
  
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects?teamId=${TEAM_ID}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  const projectData = {
    name: PROJECT_NAME,
    framework: 'vite',
    gitRepository: {
      type: 'github',
      repo: GITHUB_REPO
    },
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm install'
  };

  try {
    const project = await makeRequest(options, projectData);
    console.log(`✅ Projeto criado: ${project.name} (${project.id})`);
    return project;
  } catch (error) {
    console.error('❌ Erro ao criar projeto:', error.message);
    throw error;
  }
}

// Passo 3: Adicionar variáveis de ambiente
async function addEnvironmentVariable(projectId, envVar) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${projectId}/env?teamId=${TEAM_ID}`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    await makeRequest(options, envVar);
    console.log(`  ✅ ${envVar.key}`);
  } catch (error) {
    // Se já existe, tentar atualizar
    if (error.message.includes('already exists')) {
      console.log(`  ⚠️  ${envVar.key} (já existe)`);
    } else {
      console.error(`  ❌ ${envVar.key}: ${error.message}`);
    }
  }
}

// Passo 4: Configurar todas as variáveis
async function setupEnvironmentVariables(projectId) {
  console.log('\n🔧 Configurando variáveis de ambiente...');
  
  for (const envVar of ENV_VARS) {
    await addEnvironmentVariable(projectId, envVar);
  }
}

// Executar setup
async function main() {
  try {
    // Verificar projeto existente
    let project = await checkProject();
    
    // Criar projeto se não existir
    if (!project) {
      project = await createProject();
    }
    
    // Configurar variáveis de ambiente
    await setupEnvironmentVariables(project.id);
    
    console.log('\n✨ Setup concluído com sucesso!');
    console.log('\n📌 Próximos passos:');
    console.log('1. Acesse: https://vercel.com/cristovaopbs-projects/taskforge');
    console.log('2. Conecte o repositório GitHub (se ainda não estiver conectado)');
    console.log('3. Faça o primeiro deploy');
    console.log('4. Configure o webhook do Stripe com a URL do projeto');
    console.log('5. Adicione o domínio da Vercel no Firebase Console\n');
    
  } catch (error) {
    console.error('\n❌ Erro durante o setup:', error.message);
    process.exit(1);
  }
}

main();
