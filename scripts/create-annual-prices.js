#!/usr/bin/env node

/**
 * Script para criar automaticamente os preços anuais no Stripe
 * 
 * Uso: node scripts/create-annual-prices.js
 * 
 * Saída esperada:
 * - Price ID do Builder Annual
 * - Price ID do Strategic Annual
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
    console.error('❌ STRIPE_SECRET_KEY não configurada ou inválida no .env');
    process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
});

// IDs dos produtos (não mudam)
const PRODUCTS = {
    builder: 'prod_U4X5DxJ5ZGRfab',
    strategic: 'prod_U4X2cEVz8fot8E'
};

// Configuração dos preços anuais
const ANNUAL_PRICES = {
    builder: {
        amount: 85400, // 854 BRL em centavos
        currency: 'brl',
        interval: 'year',
        product: PRODUCTS.builder,
        metadata: { plan: 'Builder Annual', credits: '2000' }
    },
    strategic: {
        amount: 171800, // 1718 BRL em centavos
        currency: 'brl',
        interval: 'year',
        product: PRODUCTS.strategic,
        metadata: { plan: 'Strategic Annual', credits: '5000' }
    }
};

async function createAnnualPrices() {
    console.log('🚀 Iniciando criação de preços anuais no Stripe...\n');

    try {
        // Criar preço Builder Annual
        console.log('📝 Criando Builder Annual (R$ 854/ano)...');
        const builderPrice = await stripe.prices.create({
            unit_amount: ANNUAL_PRICES.builder.amount,
            currency: ANNUAL_PRICES.builder.currency,
            recurring: {
                interval: ANNUAL_PRICES.builder.interval,
            },
            product: ANNUAL_PRICES.builder.product,
            metadata: ANNUAL_PRICES.builder.metadata,
        });
        console.log(`✅ Builder Annual criado: ${builderPrice.id}\n`);

        // Criar preço Strategic Annual
        console.log('📝 Criando Strategic Annual (R$ 1.718/ano)...');
        const strategicPrice = await stripe.prices.create({
            unit_amount: ANNUAL_PRICES.strategic.amount,
            currency: ANNUAL_PRICES.strategic.currency,
            recurring: {
                interval: ANNUAL_PRICES.strategic.interval,
            },
            product: ANNUAL_PRICES.strategic.product,
            metadata: ANNUAL_PRICES.strategic.metadata,
        });
        console.log(`✅ Strategic Annual criado: ${strategicPrice.id}\n`);

        // Salvar IDs em arquivo temporário
        const priceIds = {
            builderAnnual: builderPrice.id,
            strategicAnnual: strategicPrice.id,
            createdAt: new Date().toISOString()
        };

        const outputPath = path.join(__dirname, 'annual-prices.json');
        fs.writeFileSync(outputPath, JSON.stringify(priceIds, null, 2));

        console.log('📋 Preços criados com sucesso!\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎯 PRÓXIMO PASSO: Adicionar esses IDs ao código');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('📄 Arquivo: src/pages/PricingPage.tsx (linha ~24)\n');
        console.log('```typescript');
        console.log('const PRICING_CONFIG = {');
        console.log('  builder: {');
        console.log(`    priceIdAnnual: '${builderPrice.id}',`);
        console.log('    // ...');
        console.log('  },');
        console.log('  strategic: {');
        console.log(`    priceIdAnnual: '${strategicPrice.id}',`);
        console.log('    // ...');
        console.log('  }');
        console.log('};');
        console.log('```\n');

        console.log('📄 Arquivo: src/pages/BillingPage.tsx (linha ~13)\n');
        console.log('```typescript');
        console.log('const STRIPE_PLANS = {');
        console.log('  profissional: {');
        console.log(`    priceIdAnnual: '${builderPrice.id}',`);
        console.log('    // ...');
        console.log('  },');
        console.log('  estrategico: {');
        console.log(`    priceIdAnnual: '${strategicPrice.id}',`);
        console.log('    // ...');
        console.log('  }');
        console.log('};');
        console.log('```\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('✨ IDs salvos em: scripts/annual-prices.json');
        console.log('═══════════════════════════════════════════════════════\n');

        return { builderPrice: builderPrice.id, strategicPrice: strategicPrice.id };

    } catch (error) {
        console.error('❌ Erro ao criar preços:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Executar script
createAnnualPrices();
