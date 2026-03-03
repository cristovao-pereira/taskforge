import fs from 'node:fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local', override: true });
}

type Rule = {
  key: string;
  required: boolean;
  requiredWhen?: () => boolean;
  validate?: (value: string) => boolean;
  description: string;
};

const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
const isVercel = process.env.VERCEL === '1';

const rules: Rule[] = [
  {
    key: 'GEMINI_API_KEY',
    required: true,
    validate: value => value.startsWith('AIza') && value.length > 20,
    description: 'Google AI key (prefixo AIza...)',
  },
  {
    key: 'STRIPE_SECRET_KEY',
    required: true,
    validate: value => /^sk_(test|live)_[A-Za-z0-9]+$/.test(value),
    description: 'Stripe secret key (sk_test_... ou sk_live_...)',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    validate: value => /^whsec_[A-Za-z0-9]+$/.test(value),
    description: 'Stripe webhook secret (whsec_...)',
  },
  {
    key: 'VITE_FIREBASE_API_KEY',
    required: false,
    validate: value => value.startsWith('AIza') && value.length > 20,
    description: 'Firebase Web API key (prefixo AIza...)',
  },
  {
    key: 'VITE_FIREBASE_PROJECT_ID',
    required: false,
    validate: value => /^[a-z0-9-]{4,}$/.test(value),
    description: 'Firebase project id',
  },
  {
    key: 'VITE_FIREBASE_APP_ID',
    required: false,
    validate: value => /^\d+:\d+:web:[A-Za-z0-9]+$/.test(value),
    description: 'Firebase app id (formato x:x:web:...)',
  },
  {
    key: 'DATABASE_URL',
    required: true,
    validate: value => value.startsWith('postgresql://') || value.startsWith('file:'),
    description: 'Database URL (postgresql://... ou file:...)',
  },
  {
    key: 'CORS_ORIGIN',
    required: false,
    requiredWhen: () => !isVercel,
    validate: value => value.length > 0,
    description: 'Lista de origens CORS',
  },
  {
    key: 'FIREBASE_SERVICE_ACCOUNT_JSON',
    required: false,
    validate: value => value.trim().startsWith('{') && value.trim().endsWith('}'),
    description: 'Firebase service account em JSON (opcional)',
  },
  {
    key: 'FIREBASE_SERVICE_ACCOUNT_PATH',
    required: false,
    validate: value => value.endsWith('.json'),
    description: 'Caminho para service account json (opcional)',
  },
];

let hasError = false;
const warnings: string[] = [];

console.log('🔎 Verificando variáveis sensíveis (sem exibir valores)...');

for (const rule of rules) {
  const rawValue = process.env[rule.key];
  const value = rawValue?.trim();
  const isRequired = rule.required || (rule.requiredWhen?.() ?? false);

  if (!value) {
    if (isRequired) {
      hasError = true;
      console.log(`❌ ${rule.key}: ausente (${rule.description})`);
    } else {
      console.log(`ℹ️  ${rule.key}: não definida (opcional)`);
      if (rule.key === 'CORS_ORIGIN' && isVercel) {
        warnings.push('CORS_ORIGIN ausente no Vercel; será usado fallback automático com VERCEL_URL no servidor.');
      }
    }
    continue;
  }

  const valid = rule.validate ? rule.validate(value) : true;
  if (!valid) {
    hasError = true;
    console.log(`❌ ${rule.key}: formato inválido (${rule.description})`);
    continue;
  }

  console.log(`✅ ${rule.key}: definida e válida`);
}

const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
if (isProduction && stripeKey.startsWith('sk_test_')) {
  warnings.push('Ambiente production usando STRIPE_SECRET_KEY de teste (sk_test_...).');
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON && !process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  warnings.push('Firebase Admin SDK pode operar com permissões limitadas sem service account explícita.');
}

if (warnings.length) {
  console.log('\n⚠️  Avisos:');
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (hasError) {
  console.log('\n❌ Falha na validação de ambiente.');
  process.exit(1);
}

console.log('\n✅ Ambiente validado com sucesso.');
