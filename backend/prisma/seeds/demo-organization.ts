/**
 * Demo Organization Seed Data
 *
 * Crea una organización demo con:
 * - 1 Organization "Demo Football Club" (American Football)
 * - 2 Teams: U15 Juniors, Seniors
 * - 8 Users: 2 coaches, 6 players
 * - Sample exercises, training types, templates
 *
 * Ejecutar: npx tsx prisma/seeds/demo-organization.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// DEMO DATA DEFINITIONS
// ============================================

const DEMO_ORG = {
  name: 'Demo Football Club',
  slug: 'demo-fc',
  primaryColor: '#1976d2',
  secondaryColor: '#ff9800',
  timezone: 'Europe/Vienna',
  language: 'en',
};

const DEMO_USERS = [
  // Coaches
  {
    email: 'headcoach@demo-fc.com',
    password: 'Demo123!',
    name: 'John Coach',
    role: 'coach' as const,
    orgRole: 'owner' as const,
    teamRole: 'head_coach' as const,
    teams: ['seniors', 'u15'],
  },
  {
    email: 'assistant@demo-fc.com',
    password: 'Demo123!',
    name: 'Mike Assistant',
    role: 'coach' as const,
    orgRole: 'coach' as const,
    teamRole: 'assistant_coach' as const,
    teams: ['u15'],
  },
  // Seniors Players
  {
    email: 'player1@demo-fc.com',
    password: 'Demo123!',
    name: 'James Wilson',
    role: 'player' as const,
    orgRole: 'player' as const,
    teamRole: 'player' as const,
    teams: ['seniors'],
    position: 'QB',
    jerseyNumber: 12,
  },
  {
    email: 'player2@demo-fc.com',
    password: 'Demo123!',
    name: 'Robert Brown',
    role: 'player' as const,
    orgRole: 'player' as const,
    teamRole: 'player' as const,
    teams: ['seniors'],
    position: 'RB',
    jerseyNumber: 28,
  },
  {
    email: 'player3@demo-fc.com',
    password: 'Demo123!',
    name: 'Michael Davis',
    role: 'player' as const,
    orgRole: 'player' as const,
    teamRole: 'player' as const,
    teams: ['seniors'],
    position: 'WR',
    jerseyNumber: 81,
  },
  // U15 Players
  {
    email: 'junior1@demo-fc.com',
    password: 'Demo123!',
    name: 'Tommy Junior',
    role: 'player' as const,
    orgRole: 'player' as const,
    teamRole: 'player' as const,
    teams: ['u15'],
    position: 'QB',
    jerseyNumber: 7,
  },
  {
    email: 'junior2@demo-fc.com',
    password: 'Demo123!',
    name: 'Alex Young',
    role: 'player' as const,
    orgRole: 'player' as const,
    teamRole: 'player' as const,
    teams: ['u15'],
    position: 'RB',
    jerseyNumber: 22,
  },
  {
    email: 'junior3@demo-fc.com',
    password: 'Demo123!',
    name: 'Chris Smith',
    role: 'player' as const,
    orgRole: 'player' as const,
    teamRole: 'player' as const,
    teams: ['u15'],
    position: 'WR',
    jerseyNumber: 15,
  },
];

const DEMO_TRAINING_TYPES = [
  { key: 'strength', nameEN: 'Strength Training', nameDE: 'Krafttraining', season: 'all' },
  { key: 'speed', nameEN: 'Speed & Agility', nameDE: 'Schnelligkeit & Agilität', season: 'all' },
  { key: 'practice', nameEN: 'Practice', nameDE: 'Training', season: 'in-season' },
  { key: 'film', nameEN: 'Film Study', nameDE: 'Videoanalyse', season: 'all' },
  { key: 'recovery', nameEN: 'Recovery', nameDE: 'Regeneration', season: 'all' },
];

const DEMO_EXERCISE_CATEGORIES = [
  { key: 'compound', nameEN: 'Compound Lifts', nameDE: 'Grundübungen', color: '#e53935' },
  { key: 'accessory', nameEN: 'Accessory Work', nameDE: 'Isolationsübungen', color: '#1e88e5' },
  { key: 'core', nameEN: 'Core', nameDE: 'Rumpf', color: '#43a047' },
  { key: 'plyometrics', nameEN: 'Plyometrics', nameDE: 'Plyometrie', color: '#ff9800' },
  { key: 'conditioning', nameEN: 'Conditioning', nameDE: 'Kondition', color: '#00acc1' },
];

const DEMO_EXERCISES = [
  // Compound Lifts
  { name: 'Back Squat', category: 'compound' },
  { name: 'Bench Press', category: 'compound' },
  { name: 'Deadlift', category: 'compound' },
  { name: 'Power Clean', category: 'compound' },
  { name: 'Overhead Press', category: 'compound' },
  // Accessory Work
  { name: 'Dumbbell Rows', category: 'accessory' },
  { name: 'Lat Pulldown', category: 'accessory' },
  { name: 'Leg Curl', category: 'accessory' },
  { name: 'Leg Extension', category: 'accessory' },
  { name: 'Face Pulls', category: 'accessory' },
  // Core
  { name: 'Plank', category: 'core' },
  { name: 'Russian Twists', category: 'core' },
  { name: 'Hanging Leg Raises', category: 'core' },
  // Plyometrics
  { name: 'Box Jumps', category: 'plyometrics' },
  { name: 'Broad Jump', category: 'plyometrics' },
  { name: 'Depth Jumps', category: 'plyometrics' },
  // Conditioning
  { name: '40 Yard Sprint', category: 'conditioning' },
  { name: 'Shuttle Runs', category: 'conditioning' },
  { name: 'Sled Push', category: 'conditioning' },
];

// ============================================
// SEED FUNCTION
// ============================================

async function seedDemoOrganization() {
  console.log('🏈 Seeding Demo Organization...\n');

  // 1. Get American Football sport
  const sport = await prisma.sport.findUnique({
    where: { slug: 'american-football' },
    include: {
      positions: true,
      ageCategories: true,
    },
  });

  if (!sport) {
    throw new Error('American Football sport not found. Run sports-catalog.ts first!');
  }

  console.log(`✅ Found sport: ${sport.name}`);

  // Get age categories
  const seniorsCategory = sport.ageCategories.find(c => c.code === 'SEN');
  const u15Category = sport.ageCategories.find(c => c.code === 'U15');

  if (!seniorsCategory || !u15Category) {
    throw new Error('Required age categories not found!');
  }

  // 2. Create owner user first (needed for organization.createdBy)
  const ownerDef = DEMO_USERS.find(u => u.orgRole === 'owner')!;
  let ownerUser = await prisma.user.findUnique({
    where: { email: ownerDef.email },
  });

  if (!ownerUser) {
    const hashedPassword = await bcrypt.hash(ownerDef.password, 10);
    ownerUser = await prisma.user.create({
      data: {
        email: ownerDef.email,
        passwordHash: hashedPassword,
        name: ownerDef.name,
        role: ownerDef.role,
        emailVerified: true,
      },
    });
    console.log(`✅ Created owner user: ${ownerUser.name}`);
  } else {
    console.log(`⚠️  Owner user "${ownerUser.name}" already exists`);
  }

  // 3. Create or update Organization
  let organization = await prisma.organization.findUnique({
    where: { slug: DEMO_ORG.slug },
  });

  if (organization) {
    console.log(`⚠️  Organization "${DEMO_ORG.name}" already exists, updating...`);
    organization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        name: DEMO_ORG.name,
        primaryColor: DEMO_ORG.primaryColor,
        secondaryColor: DEMO_ORG.secondaryColor,
        timezone: DEMO_ORG.timezone,
        language: DEMO_ORG.language,
      },
    });
  } else {
    organization = await prisma.organization.create({
      data: {
        name: DEMO_ORG.name,
        slug: DEMO_ORG.slug,
        sportId: sport.id,
        primaryColor: DEMO_ORG.primaryColor,
        secondaryColor: DEMO_ORG.secondaryColor,
        timezone: DEMO_ORG.timezone,
        language: DEMO_ORG.language,
        createdBy: ownerUser.id,
        plan: 'pro',
        maxMembers: 50,
        maxCoaches: 5,
        maxTeams: 5,
        maxStorageGB: 10,
        subscriptionStatus: 'active',
      },
    });
    console.log(`✅ Created organization: ${organization.name}`);
  }

  // Update owner user with organizationId
  await prisma.user.update({
    where: { id: ownerUser.id },
    data: { organizationId: organization.id },
  });

  // Create OrganizationMember for owner
  const existingOwnerOrgMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: ownerUser.id,
      },
    },
  });

  if (!existingOwnerOrgMember) {
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: ownerUser.id,
        role: 'owner',
        canManageMembers: true,
        canManageContent: true,
        canManageBilling: true,
        canManageSettings: true,
      },
    });
    console.log(`✅ Created owner membership`);
  }

  // Store teams for later use
  const teams: Record<string, { id: string }> = {};

  // 4. Create Teams
  const teamDefinitions = [
    { name: 'Seniors', slug: 'seniors', ageCategoryId: seniorsCategory.id },
    { name: 'U15 Juniors', slug: 'u15', ageCategoryId: u15Category.id },
  ];

  for (const teamDef of teamDefinitions) {
    let team = await prisma.team.findFirst({
      where: {
        organizationId: organization.id,
        name: teamDef.name,
      },
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: teamDef.name,
          organizationId: organization.id,
          ageCategoryId: teamDef.ageCategoryId,
          isActive: true,
        },
      });
      console.log(`✅ Created team: ${team.name}`);
    } else {
      console.log(`⚠️  Team "${team.name}" already exists`);
    }

    teams[teamDef.slug] = team;
  }

  // Create TeamMembers for owner (all teams)
  for (const teamSlug of ownerDef.teams) {
    const team = teams[teamSlug];
    if (!team) continue;

    const existingOwnerTeamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: ownerUser.id,
        },
      },
    });

    if (!existingOwnerTeamMember) {
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: ownerUser.id,
          role: ownerDef.teamRole,
          isActive: true,
        },
      });
    }
  }

  // 5. Create Users with memberships
  const createdUsers: Record<string, { id: string }> = {};

  // Register owner user first
  createdUsers[ownerDef.email] = ownerUser;

  for (const userDef of DEMO_USERS) {
    // Skip owner - already created
    if (userDef.orgRole === 'owner') {
      continue;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: userDef.email },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(userDef.password, 10);
      user = await prisma.user.create({
        data: {
          email: userDef.email,
          passwordHash: hashedPassword,
          name: userDef.name,
          role: userDef.role,
          organizationId: organization.id,
          emailVerified: true,
        },
      });
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    } else {
      // Update existing user to link to organization
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: organization.id },
      });
      console.log(`⚠️  User "${user.name}" already exists, linked to org`);
    }

    createdUsers[userDef.email] = user;

    // Create OrganizationMember
    const existingOrgMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
    });

    if (!existingOrgMember) {
      await prisma.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: userDef.orgRole,
          canManageMembers: userDef.orgRole === 'owner' || userDef.orgRole === 'admin',
          canManageContent: userDef.orgRole !== 'player',
          canManageBilling: userDef.orgRole === 'owner',
          canManageSettings: userDef.orgRole === 'owner' || userDef.orgRole === 'admin',
        },
      });
    }

    // Create TeamMember for each team
    for (const teamSlug of userDef.teams) {
      const team = teams[teamSlug];
      if (!team) continue;

      // Get position if defined
      let positionId: string | undefined;
      if (userDef.position) {
        const position = sport.positions.find(p => p.abbreviation === userDef.position);
        positionId = position?.id;
      }

      const existingTeamMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: user.id,
          },
        },
      });

      if (!existingTeamMember) {
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            role: userDef.teamRole,
            positionId,
            jerseyNumber: userDef.jerseyNumber,
            isActive: true,
          },
        });
      }
    }
  }

  // 6. Create Training Types
  console.log('\n📋 Creating training types...');
  for (const typeDef of DEMO_TRAINING_TYPES) {
    const existing = await prisma.trainingType.findFirst({
      where: {
        key: typeDef.key,
        organizationId: organization.id,
      },
    });

    if (!existing) {
      await prisma.trainingType.create({
        data: {
          key: typeDef.key,
          nameEN: typeDef.nameEN,
          nameDE: typeDef.nameDE,
          season: typeDef.season,
          organizationId: organization.id,
        },
      });
      console.log(`   ✅ ${typeDef.nameEN}`);
    }
  }

  // 7. Create Exercise Categories
  console.log('\n📁 Creating exercise categories...');

  for (const catDef of DEMO_EXERCISE_CATEGORIES) {
    const existingCat = await prisma.exerciseCategory.findFirst({
      where: {
        key: catDef.key,
        organizationId: organization.id,
      },
    });

    if (!existingCat) {
      await prisma.exerciseCategory.create({
        data: {
          key: catDef.key,
          nameEN: catDef.nameEN,
          nameDE: catDef.nameDE,
          color: catDef.color,
          organizationId: organization.id,
        },
      });
      console.log(`   ✅ ${catDef.nameEN}`);
    }
  }

  // 8. Create Exercises
  console.log('\n🏋️ Creating exercises...');
  for (const exDef of DEMO_EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: {
        name: exDef.name,
        organizationId: organization.id,
      },
    });

    if (!existing) {
      await prisma.exercise.create({
        data: {
          name: exDef.name,
          category: exDef.category,
          organizationId: organization.id,
        },
      });
    }
  }
  console.log(`   ✅ ${DEMO_EXERCISES.length} exercises created/verified`);

  // 9. Create Points Config for organization
  console.log('\n🏆 Creating points config...');
  const existingPointsConfig = await prisma.pointsConfig.findFirst({
    where: {
      organizationId: organization.id,
    },
  });

  if (!existingPointsConfig) {
    await prisma.pointsConfig.create({
      data: {
        organizationId: organization.id,
        weeklyTarget: 20,
        maxDailyPoints: 3,
        categories: [
          { key: 'training', name: 'Training Session', points: 1, maxPerDay: 1 },
          { key: 'match', name: 'Match Day', points: 2, maxPerDay: 1 },
          { key: 'strength', name: 'Strength Training', points: 1, maxPerDay: 1 },
        ],
        colorScale: {
          low: '#ef5350',
          medium: '#ffb74d',
          high: '#66bb6a',
        },
      },
    });
    console.log(`   ✅ Points config created`);
  } else {
    console.log(`   ⚠️ Points config already exists`);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 DEMO ORGANIZATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`\nOrganization: ${organization.name}`);
  console.log(`Sport: ${sport.name}`);
  console.log(`Teams: ${Object.keys(teams).join(', ')}`);
  console.log(`Users: ${DEMO_USERS.length}`);
  console.log('\n📝 Login Credentials:');
  console.log('─'.repeat(40));

  for (const user of DEMO_USERS) {
    console.log(`${user.name.padEnd(20)} | ${user.email.padEnd(25)} | ${user.password}`);
  }

  console.log('\n✨ Demo organization seeding complete!\n');
}

// ============================================
// MAIN
// ============================================

async function main() {
  try {
    await seedDemoOrganization();
    console.log('✅ All demo seeds completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
