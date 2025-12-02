/**
 * Fix stripeCustomerId unique index issue
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStripeIndex() {
  console.log('\n🔧 Fixing stripeCustomerId unique index...\n');

  try {
    console.log('Attempting to drop index on Organization collection...');

    // Execute raw MongoDB command to drop the unique index
    const result = await (prisma as any).$runCommandRaw({
      dropIndexes: 'Organization',
      index: 'Organization_stripeCustomerId_key'
    });

    console.log('✅ Index dropped successfully:', result);
    console.log('\n✨ Fix complete! Now the signup should work.\n');

  } catch (error: any) {
    if (error.message?.includes('index not found') || error.message?.includes('ns not found')) {
      console.log('✅ Index already removed or never existed.');
      console.log('\n✨ Nothing to fix - you should be good to go!\n');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixStripeIndex();
