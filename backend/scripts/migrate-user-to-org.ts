/**
 * Migrate existing user to organization
 * Usage: npx tsx backend/scripts/migrate-user-to-org.ts <email>
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserToOrg(email: string) {
  console.log(`\n🔄 Migrating user: ${email}\n`);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  console.log(`✅ Found user: ${user.name} (${user.id})`);

  // Check if user already has organization
  if (user.organizationId) {
    console.log(`⚠️  User already has organizationId: ${user.organizationId}`);
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });
    if (org) {
      console.log(`✅ Organization exists: ${org.name}`);
      return;
    }
  }

  // Get first sport (American Football)
  const sport = await prisma.sport.findFirst({
    where: { slug: 'american-football' },
  });

  if (!sport) {
    throw new Error('No sports found. Please run: npx tsx backend/prisma/seeds/sports-catalog.ts');
  }

  console.log(`✅ Using sport: ${sport.name} (${sport.id})`);

  // Create organization
  const timestamp = Date.now();
  const org = await prisma.organization.create({
    data: {
      name: `${user.name}'s Organization`,
      slug: `${user.name.toLowerCase().replace(/\s+/g, '-')}-org-${timestamp}`,
      sportId: sport.id,
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      timezone: 'Europe/Madrid',
      language: user.preferredLanguage || 'en',
      createdBy: user.id,
      plan: 'free',
      maxMembers: 15,
      maxCoaches: 2,
      maxTeams: 1,
      maxStorageGB: 1,
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      // Don't set stripeCustomerId to avoid unique constraint issue
    },
  });

  console.log(`✅ Created organization: ${org.name} (${org.id})`);

  // Create owner membership
  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'owner',
      canManageMembers: true,
      canManageContent: true,
      canManageBilling: true,
      canManageSettings: true,
    },
  });

  console.log(`✅ Created owner membership`);

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: { organizationId: org.id },
  });

  console.log(`✅ Updated user organizationId`);

  // Get first age category for sport
  const ageCategory = await prisma.ageCategory.findFirst({
    where: { sportId: sport.id },
    orderBy: { displayOrder: 'asc' },
  });

  if (!ageCategory) {
    throw new Error('No age categories found for sport');
  }

  console.log(`✅ Using age category: ${ageCategory.name} (${ageCategory.id})`);

  // Create first team
  const team = await prisma.team.create({
    data: {
      name: 'First Team',
      organizationId: org.id,
      ageCategoryId: ageCategory.id,
      isActive: true,
    },
  });

  console.log(`✅ Created team: ${team.name} (${team.id})`);

  // Add user as team member
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: user.id,
      role: 'head_coach',
      isActive: true,
    },
  });

  console.log(`✅ Added user to team as head_coach`);

  console.log(`\n✨ Migration complete!\n`);
  console.log(`Organization ID: ${org.id}`);
  console.log(`Team ID: ${team.id}`);
  console.log(`\nNow refresh your browser and you should see the organization settings.\n`);
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx backend/scripts/migrate-user-to-org.ts <email>');
  process.exit(1);
}

migrateUserToOrg(email)
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    prisma.$disconnect();
    process.exit(1);
  });
