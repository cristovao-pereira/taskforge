const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const p = new PrismaClient();

async function main() {
    const users = await p.user.findMany({
        where: { email: 'cristovaopb@gmail.com' }
    });
    console.log('Users found:', users.map(u => ({ id: u.id, credits: u.credits, plan: u.plan, stripeCustomerId: u.stripeCustomerId, stripeSubscriptionId: u.stripeSubscriptionId })));

    if (users.length > 0) {
        const user = users[0];
        const updated = await p.user.update({
            where: { id: user.id },
            data: { credits: { increment: 5000 } }
        });
        await p.creditLog.create({
            data: {
                userId: user.id,
                amount: 5000,
                reason: 'subscription_renewal',
                metadata: { note: 'Manual fix: estrategico plan checkout not credited', priceId: 'price_1T6O6XBNgnXewP8M5BxqsMGU' }
            }
        });
        console.log('Credits updated to:', updated.credits);
    }
    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
