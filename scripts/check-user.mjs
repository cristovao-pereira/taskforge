import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const p = new PrismaClient();
const users = await p.user.findMany({
    where: { email: 'cristovaopb@gmail.com' },
    select: { id: true, email: true, credits: true, plan: true, stripeCustomerId: true, stripeSubscriptionId: true, deletedAt: true }
});
console.log(JSON.stringify(users, null, 2));
await p.$disconnect();
