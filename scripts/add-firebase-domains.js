#!/usr/bin/env node

/**
 * Script para adicionar domínios autorizados no Firebase Authentication
 * 
 * Requer: Firebase Admin SDK configurado
 * Uso: node scripts/add-firebase-domains.js
 */

import 'dotenv/config';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'taskforge-addb3';
const VERCEL_DOMAINS = [
  'taskforge-lime.vercel.app',
  'taskforge-cristovaopbs-projects.vercel.app',
  'taskforge-cristovao-pereira-cristovaopbs-projects.vercel.app'
];

console.log('🔧 Configurando domínios autorizados no Firebase...\n');
console.log(`📋 Projeto: ${FIREBASE_PROJECT_ID}\n`);

console.log('⚠️  ATENÇÃO: Este script requer configuração manual no Firebase Console\n');
console.log('🌐 Domínios a serem adicionados:\n');

VERCEL_DOMAINS.forEach((domain, index) => {
  console.log(`   ${index + 1}. ${domain}`);
});

console.log('\n📝 PASSOS MANUAIS:\n');
console.log('1. Acesse: https://console.firebase.google.com/project/' + FIREBASE_PROJECT_ID + '/authentication/settings');
console.log('2. Role até a seção "Authorized domains"');
console.log('3. Clique em "Add domain"');
console.log('4. Adicione cada domínio listado acima');
console.log('5. Clique em "Add" para confirmar cada um\n');

console.log('💡 DICA: Você pode copiar os domínios abaixo para colar:\n');
VERCEL_DOMAINS.forEach(domain => {
  console.log(`   ${domain}`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📖 VERIFICAÇÃO:\n');
console.log('Após adicionar os domínios, teste o login em:');
console.log('https://taskforge-lime.vercel.app/login\n');

console.log('✅ Se não houver erro "auth/unauthorized-domain", está configurado!\n');

// Informações adicionais sobre a API do Firebase
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('ℹ️  NOTA TÉCNICA:\n');
console.log('A configuração de domínios autorizados não está disponível via');
console.log('Firebase Admin SDK por questões de segurança. Precisa ser feita');
console.log('através do Firebase Console ou Google Cloud Console.\n');

console.log('Alternativa via Google Cloud Console:');
console.log('https://console.cloud.google.com/apis/credentials/domainverification?project=' + FIREBASE_PROJECT_ID + '\n');

// Se o usuário quiser automatizar, pode usar gcloud CLI
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🚀 AUTOMAÇÃO VIA GCLOUD CLI:\n');
console.log('Se você tem o gcloud CLI instalado e autenticado:\n');
console.log('# Instalar gcloud CLI:');
console.log('# https://cloud.google.com/sdk/docs/install\n');
console.log('# Fazer login:');
console.log('gcloud auth login\n');
console.log('# Configurar projeto:');
console.log(`gcloud config set project ${FIREBASE_PROJECT_ID}\n`);
console.log('# Listar configurações do Identity Platform:');
console.log('gcloud alpha identity platforms project-configs describe\n');
