import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showStructure() {
  const org = await prisma.organization.findFirst({
    include: {
      sport: true,
      teams: {
        include: {
          ageCategory: true,
        },
      },
    },
  });

  console.log('\n📋 Organization Structure:\n');
  console.log('Organization:', org?.name);
  console.log('Sport:', org?.sport?.name);
  console.log('Teams:', org?.teams.length);
  org?.teams.forEach(team => {
    const catName = team.ageCategory?.name || 'No category';
    console.log(`  - ${team.name} (${catName})`);
  });

  await prisma.$disconnect();
}

showStructure();
