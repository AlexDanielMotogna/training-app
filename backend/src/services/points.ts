/**
 * Points calculation service for workout scoring.
 *
 * Fixed point values - no configuration needed.
 * Points are calculated based on workout type and intensity.
 */

// Fixed point values
const POINTS = {
  light: 1, // Light sessions (yoga, walking, stretching, <30min)
  moderate: 2, // Moderate sessions (gym, jogging, 30-60min)
  team: 2.5, // Team training sessions
  intensive: 3, // Intensive sessions (>=60min or high volume)
} as const;

export type PointsCategory = keyof typeof POINTS;

interface WorkoutData {
  duration?: number; // minutes
  source: string; // 'coach' | 'player' | 'team'
  entries?: any[]; // workout entries with set data
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
export function calculatePoints(workout: WorkoutData): {
  points: number;
  category: PointsCategory;
} {
  const { duration = 0, source, entries = [] } = workout;
  const category = determineCategory(duration, source, entries);
  const points = POINTS[category];
  return { points, category };
}

/**
 * Get point value for a category
 */
export function getPointsForCategory(category: PointsCategory): number {
  return POINTS[category];
}
