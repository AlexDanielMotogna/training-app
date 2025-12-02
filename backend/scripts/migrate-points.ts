/**
 * Migration script to calculate and add points to existing workouts.
 * This is a one-time migration for workouts created before the points system.
 *
 * Run with: npx tsx scripts/migrate-points.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fixed point values (same as services/points.ts)
const POINTS = {
  light: 1, // Light sessions (yoga, walking, stretching, <30min)
  moderate: 2, // Moderate sessions (gym, jogging, 30-60min)
  team: 2.5, // Team training sessions
  intensive: 3, // Intensive sessions (>=60min or high volume)
} as const;

type PointsCategory = keyof typeof POINTS;

interface WorkoutEntry {
  sets?: Array<{ reps?: number; weight?: number }>;
}

/**
 * Calculate total volume from workout entries
 */
function calculateTotalVolume(entries: any[]): number {
  if (!entries || !Array.isArray(entries)) return 0;

  let totalVolume = 0;
  entries.forEach((entry) => {
    if (entry.sets && Array.isArray(entry.sets)) {
      entry.sets.forEach((set: any) => {
        const reps = set.reps || 0;
        const weight = set.weight || 0;
        totalVolume += reps * weight;
      });
    }
  });
  return totalVolume;
}

/**
 * Calculate total sets from workout entries
 */
function calculateTotalSets(entries: any[]): number {
  if (!entries || !Array.isArray(entries)) return 0;

  let totalSets = 0;
  entries.forEach((entry) => {
    if (entry.sets && Array.isArray(entry.sets)) {
      totalSets += entry.sets.length;
    }
  });
  return totalSets;
}

/**
 * Determine points category based on workout characteristics
 */
function determineCategory(
  duration: number,
  source: string,
  entries: any[]
): PointsCategory {
  // Team sessions always get team points
  if (source === 'team') {
    return 'team';
  }

  const totalVolume = calculateTotalVolume(entries);
  const totalSets = calculateTotalSets(entries);

  // Intensive: Long duration OR high volume
  if (duration >= 60 || totalVolume > 5000) {
    return 'intensive';
  }

  // Moderate: Medium duration with some volume
  if (duration >= 30 || totalSets >= 8 || totalVolume > 1000) {
    return 'moderate';
  }

  // Light: Everything else
  return 'light';
}

/**
 * Calculate points for a workout
 */
function calculatePoints(workout: {
  duration?: number | null;
  source: string;
  entries?: any;
}): { points: number; category: PointsCategory } {
  const duration = workout.duration || 0;
  const source = workout.source;
  const entries = workout.entries as any[] || [];
  const category = determineCategory(duration, source, entries);
  const points = POINTS[category];
  return { points, category };
}

async function migratePoints() {
  console.log('Starting points migration...');

  // Get all workouts without points
  const workoutsWithoutPoints = await prisma.workoutLog.findMany({
    where: {
      OR: [
        { points: null },
        { pointsCategory: null },
      ],
    },
  });

  console.log(`Found ${workoutsWithoutPoints.length} workouts without points`);

  let updated = 0;
  let errors = 0;

  for (const workout of workoutsWithoutPoints) {
    try {
      const { points, category } = calculatePoints({
        duration: workout.duration,
        source: workout.source,
        entries: workout.entries,
      });

      await prisma.workoutLog.update({
        where: { id: workout.id },
        data: {
          points,
          pointsCategory: category,
        },
      });

      updated++;

      if (updated % 50 === 0) {
        console.log(`Progress: ${updated}/${workoutsWithoutPoints.length} workouts updated`);
      }
    } catch (error) {
      console.error(`Error updating workout ${workout.id}:`, error);
      errors++;
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`Total workouts processed: ${workoutsWithoutPoints.length}`);
  console.log(`Successfully updated: ${updated}`);
  console.log(`Errors: ${errors}`);

  // Show summary by category
  const summary = await prisma.workoutLog.groupBy({
    by: ['pointsCategory'],
    _count: { id: true },
    _sum: { points: true },
  });

  console.log('\n=== Points Summary by Category ===');
  summary.forEach((row) => {
    console.log(`${row.pointsCategory || 'null'}: ${row._count.id} workouts, ${row._sum.points || 0} total points`);
  });
}

migratePoints()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
