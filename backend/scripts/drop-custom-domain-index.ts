import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dropIndex() {
  try {
    const result = await (prisma as any).$runCommandRaw({
      dropIndexes: 'Organization',
      index: 'Organization_customDomain_key'
    });
    console.log('✅ Index dropped:', result);
  } catch (error: any) {
    console.log('Index already dropped or error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

dropIndex();
