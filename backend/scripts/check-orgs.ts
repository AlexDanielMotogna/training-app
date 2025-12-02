import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const orgs = await prisma.organization.findMany();
  console.log('Organizations:', orgs.map(o => ({
    id: o.id,
    name: o.name,
    stripeCustomerId: o.stripeCustomerId,
  })));
  await prisma.$disconnect();
}

check();
