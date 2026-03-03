import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-02-25.clover',
});

interface PlanInfo {
    plan: 'gratis' | 'essencial' | 'profissional' | 'estrategico';
    status: Stripe.Subscription.Status;
    priceId: string;
    productId: string;
}

function resolvePlanFromSubscription(subscription: Stripe.Subscription): PlanInfo | null {
    const price = subscription.items.data[0]?.price;
    if (!price) return null;

    const priceId = price.id;
    const productId = typeof price.product === 'string' ? price.product : price.product?.id || '';
    const amount = price.unit_amount || 0;

    // Map known price IDs
    const priceToPlan: Record<string, 'essencial' | 'profissional' | 'estrategico'> = {
        'price_1T6O7HBNgnXewP8Me1hVETGA': 'essencial',
        'price_1T6O6QBNgnXewP8Mude8pCy8': 'profissional',
        'price_1T6O6XBNgnXewP8M5BxqsMGU': 'estrategico',
    };

    // Map known product IDs
    const productToPlan: Record<string, 'essencial' | 'profissional' | 'estrategico'> = {
        'prod_U4X21x0lWIvsHW': 'essencial',
        'prod_U4X5DxJ5ZGRfab': 'profissional',
        'prod_U4X2cEVz8fot8E': 'estrategico',
    };

    let plan: 'essencial' | 'profissional' | 'estrategico' | null = null;

    // Try exact match first
    if (priceToPlan[priceId]) {
        plan = priceToPlan[priceId];
    } else if (productToPlan[productId]) {
        plan = productToPlan[productId];
    } else {
        // Fallback to amount-based detection
        if (amount >= 49990) plan = 'estrategico';
        else if (amount >= 19990) plan = 'profissional';
        else if (amount > 0) plan = 'essencial';
    }

    if (!plan) return null;

    return {
        plan,
        status: subscription.status,
        priceId,
        productId,
    };
}

async function syncUserStripeToDb(email: string, dryRun: boolean = true) {
    try {
        // 1. Find user in database
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
                stripeCustomerId: true,
            }
        });

        if (!user) {
            console.log(`❌ Usuário não encontrado: ${email}`);
            return;
        }

        console.log('\n📋 Usuário encontrado no banco:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Plano atual no DB: ${user.plan || 'gratis'}`);
        console.log(`   Stripe Customer ID: ${user.stripeCustomerId || 'N/A'}`);

        if (!user.stripeCustomerId) {
            console.log('\n⚠️  Usuário não tem Stripe Customer ID. Não é possível sincronizar.');
            return;
        }

        // 2. Fetch subscriptions from Stripe
        console.log('\n🔍 Consultando Stripe...');
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'all',
            limit: 10,
        });

        console.log(`   Total de subscriptions: ${subscriptions.data.length}`);

        if (subscriptions.data.length === 0) {
            console.log('\n⚠️  Nenhuma subscription encontrada no Stripe.');
            return;
        }

        // 3. Find active subscription
        const activeStatuses: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due'];
        const activeSubscriptions = subscriptions.data.filter(sub =>
            activeStatuses.includes(sub.status)
        );

        if (activeSubscriptions.length === 0) {
            console.log('\n⚠️  Nenhuma subscription ativa encontrada.');
            console.log('\nSubscriptions existentes:');
            subscriptions.data.forEach(sub => {
                const planInfo = resolvePlanFromSubscription(sub);
                console.log(`   - Status: ${sub.status}, Plano: ${planInfo?.plan || 'N/A'}`);
            });
            return;
        }

        // Get the highest priority active subscription
        const subscription = activeSubscriptions.sort((a, b) => {
            const aInfo = resolvePlanFromSubscription(a);
            const bInfo = resolvePlanFromSubscription(b);
            const aPriority = aInfo?.plan === 'estrategico' ? 3 : aInfo?.plan === 'profissional' ? 2 : 1;
            const bPriority = bInfo?.plan === 'estrategico' ? 3 : bInfo?.plan === 'profissional' ? 2 : 1;
            return bPriority - aPriority;
        })[0];

        const planInfo = resolvePlanFromSubscription(subscription);

        if (!planInfo) {
            console.log('\n⚠️  Não foi possível determinar o plano da subscription.');
            return;
        }

        console.log('\n✅ Subscription ativa encontrada:');
        console.log(`   Plano no Stripe: ${planInfo.plan}`);
        console.log(`   Status: ${planInfo.status}`);
        console.log(`   Price ID: ${planInfo.priceId}`);
        console.log(`   Product ID: ${planInfo.productId}`);

        // 4. Compare and update
        const currentPlan = (user.plan || 'gratis').toLowerCase();
        const stripePlan = planInfo.plan.toLowerCase();

        if (currentPlan === stripePlan) {
            console.log('\n✅ Planos já estão sincronizados. Nenhuma atualização necessária.');
            return;
        }

        console.log('\n🔄 SINCRONIZAÇÃO NECESSÁRIA:');
        console.log(`   DB atual:     ${currentPlan}`);
        console.log(`   Stripe atual: ${stripePlan}`);

        if (dryRun) {
            console.log('\n⚠️  DRY RUN - Não será atualizado. Execute com --apply para aplicar.');
            return;
        }

        // 5. Update database
        await prisma.user.update({
            where: { id: user.id },
            data: { plan: planInfo.plan },
        });

        console.log('\n✅ PLANO ATUALIZADO COM SUCESSO!');
        console.log(`   ${currentPlan} → ${stripePlan}`);

    } catch (error) {
        console.error('\n❌ Erro ao sincronizar:', error);
        if (error instanceof Stripe.errors.StripeError) {
            console.error('   Stripe Error:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// CLI
const email = process.argv[2];
const apply = process.argv.includes('--apply');

if (!email) {
    console.log('Uso: npx tsx sync-stripe-to-db.ts <email> [--apply]');
    console.log('');
    console.log('Exemplo (dry run):');
    console.log('  npx tsx sync-stripe-to-db.ts cristovaopb@gmail.com');
    console.log('');
    console.log('Exemplo (aplicar alterações):');
    console.log('  npx tsx sync-stripe-to-db.ts cristovaopb@gmail.com --apply');
    process.exit(1);
}

console.log('🔄 Sincronizando Stripe → Database');
console.log(`📧 Email: ${email}`);
console.log(`${apply ? '✅ MODO APLICAR' : '⚠️  MODO DRY RUN'}\n`);

syncUserStripeToDb(email, !apply);
