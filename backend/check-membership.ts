import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMembership() {
  try {
    const userId = '692daa8ad2337bac2892c766';
    const orgId = '692daa8ad2337bac2892c767';
    
    console.log('\n🔍 Checking OrganizationMember records...\n');
    
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: userId,
        },
      },
    });
    
    if (membership) {
      console.log('✅ Membership exists:');
      console.log(JSON.stringify(membership, null, 2));
    } else {
      console.log('❌ No membership found!');
      console.log('User ID:', userId);
      console.log('Org ID:', orgId);
      console.log('\nCreating membership now...');
      
      const newMembership = await prisma.organizationMember.create({
        data: {
          organizationId: orgId,
          userId: userId,
          role: 'owner',
          canManageMembers: true,
          canManageContent: true,
          canManageBilling: true,
          canManageSettings: true,
          joinedAt: new Date(),
        },
      });
      
      console.log('✅ Membership created:');
      console.log(JSON.stringify(newMembership, null, 2));
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

checkMembership().catch(console.error);
