import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation schema for sync request
const syncWeeklyPointsSchema = z.object({
  week: z.string().regex(/^\d{4}-W\d{2}$/, 'Week must be in format YYYY-Www'),
  totalPoints: z.number().min(0),
  targetPoints: z.number().int().min(0),
  workoutDays: z.number().int().min(0).max(7),
  teamTrainingDays: z.number().int().min(0).max(7),
  coachWorkoutDays: z.number().int().min(0).max(7),
  personalWorkoutDays: z.number().int().min(0).max(7),
  breakdown: z.array(z.object({
    date: z.string(),
    workoutTitle: z.string(),
    category: z.string(),
    points: z.number(),
    source: z.string(),
    duration: z.number().optional(),
    totalSets: z.number().optional(),
    totalVolume: z.number().optional(),
    totalDistance: z.number().optional(),
  })),
});

// Helper to get current ISO week
function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

// Helper to get current month start and end dates
function getCurrentMonthDates(): { startDate: string; endDate: string; month: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return { startDate, endDate, month: monthStr };
}

// ========================================
// GET /api/leaderboard - Get current month leaderboard with category filter
// ========================================
router.get('/', async (req, res) => {
  try {
    const user = (req as any).user;
    const requestedCategory = req.query.category as string | undefined;

    // Get user's category info
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, ageCategory: true, coachCategories: true },
    });

    // Determine category filter
    let categoryFilter: string[] = [];

    if (requestedCategory) {
      // Validate user has access to requested category
      if (dbUser?.role === 'player') {
        categoryFilter = dbUser.ageCategory === requestedCategory
          ? [requestedCategory]
          : (dbUser.ageCategory ? [dbUser.ageCategory] : []);
      } else if (dbUser?.role === 'coach') {
        if (dbUser.coachCategories?.includes(requestedCategory)) {
          categoryFilter = [requestedCategory];
        } else if (dbUser.coachCategories?.length > 0) {
          categoryFilter = [dbUser.coachCategories[0]];
        }
      }
    } else {
      // Default: first category
      if (dbUser?.role === 'player' && dbUser?.ageCategory) {
        categoryFilter = [dbUser.ageCategory];
      } else if (dbUser?.role === 'coach' && dbUser?.coachCategories?.length > 0) {
        categoryFilter = [dbUser.coachCategories[0]];
      }
    }

    // Get current month dates
    const { startDate, endDate, month: currentMonth } = getCurrentMonthDates();

    // Filter users by category (players AND coaches!)
    let userIdsToInclude: string[] | null = null;
    if (categoryFilter.length > 0) {
      // Get players in the category
      const players = await prisma.user.findMany({
        where: { role: 'player', ageCategory: { in: categoryFilter } },
        select: { id: true },
      });

      // Get coaches that have this category assigned (they can also train!)
      const coaches = await prisma.user.findMany({
        where: {
          role: 'coach',
          coachCategories: { hasSome: categoryFilter },
        },
        select: { id: true },
      });

      userIdsToInclude = [
        ...players.map(p => p.id),
        ...coaches.map(c => c.id),
      ];
    }

    // Get all workouts for the current month
    const whereWorkouts: any = {
      date: { gte: startDate, lte: endDate },
    };
    if (userIdsToInclude) {
      whereWorkouts.userId = { in: userIdsToInclude };
    }

    const workouts = await prisma.workoutLog.findMany({
      where: whereWorkouts,
      select: {
        userId: true,
        userName: true,
        date: true,
        points: true,
        source: true,
      },
    });

    // Aggregate points by user
    const pointsByUser = new Map<string, { totalPoints: number; workoutDates: Set<string>; userName?: string }>();

    workouts.forEach(workout => {
      if (!pointsByUser.has(workout.userId)) {
        pointsByUser.set(workout.userId, {
          totalPoints: 0,
          workoutDates: new Set(),
          userName: workout.userName || undefined,
        });
      }
      const userData = pointsByUser.get(workout.userId)!;
      userData.totalPoints += workout.points || 0;
      userData.workoutDates.add(workout.date);
    });

    // Get user info for all users in the leaderboard
    const userIds = Array.from(pointsByUser.keys());
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, position: true, ageCategory: true, role: true },
    });

    // Build leaderboard
    const leaderboardData = Array.from(pointsByUser.entries()).map(([userId, data]) => {
      const userInfo = users.find(u => u.id === userId);
      return {
        userId,
        playerName: userInfo?.name || data.userName || 'Unknown',
        position: userInfo?.position || '-',
        ageCategory: userInfo?.ageCategory,
        role: userInfo?.role || 'player',
        totalPoints: data.totalPoints,
        workoutDays: data.workoutDates.size,
      };
    });

    // Sort by points descending
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add ranks
    const leaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    // Determine available categories for the user
    let availableCategories: string[] = [];
    if (dbUser?.role === 'player' && dbUser?.ageCategory) {
      availableCategories = [dbUser.ageCategory];
    } else if (dbUser?.role === 'coach' && dbUser?.coachCategories) {
      availableCategories = dbUser.coachCategories;
    }

    console.log(`[LEADERBOARD] Fetched leaderboard for month ${currentMonth}, category ${categoryFilter[0] || 'all'}: ${leaderboard.length} entries`);

    res.json({
      month: currentMonth,
      leaderboard,
      currentCategory: categoryFilter[0] || null,
      availableCategories,
    });
  } catch (error) {
    console.error('[LEADERBOARD] Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ========================================
// GET /api/leaderboard/month/:month - Get specific month leaderboard
// ========================================
router.get('/month/:month', async (req, res) => {
  try {
    const user = (req as any).user;
    const { month } = req.params;
    const requestedCategory = req.query.category as string | undefined;

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Month must be in format YYYY-MM' });
    }

    // Get user's category info
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, ageCategory: true, coachCategories: true },
    });

    // Determine category filter (same logic as main endpoint)
    let categoryFilter: string[] = [];
    if (requestedCategory) {
      if (dbUser?.role === 'player') {
        categoryFilter = dbUser.ageCategory === requestedCategory
          ? [requestedCategory]
          : (dbUser.ageCategory ? [dbUser.ageCategory] : []);
      } else if (dbUser?.role === 'coach') {
        if (dbUser.coachCategories?.includes(requestedCategory)) {
          categoryFilter = [requestedCategory];
        } else if (dbUser.coachCategories?.length > 0) {
          categoryFilter = [dbUser.coachCategories[0]];
        }
      }
    } else {
      if (dbUser?.role === 'player' && dbUser?.ageCategory) {
        categoryFilter = [dbUser.ageCategory];
      } else if (dbUser?.role === 'coach' && dbUser?.coachCategories?.length > 0) {
        categoryFilter = [dbUser.coachCategories[0]];
      }
    }

    // Calculate month dates
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

    // Filter users by category
    let userIdsToInclude: string[] | null = null;
    if (categoryFilter.length > 0) {
      const players = await prisma.user.findMany({
        where: { role: 'player', ageCategory: { in: categoryFilter } },
        select: { id: true },
      });
      const coaches = await prisma.user.findMany({
        where: { role: 'coach', coachCategories: { hasSome: categoryFilter } },
        select: { id: true },
      });
      userIdsToInclude = [...players.map(p => p.id), ...coaches.map(c => c.id)];
    }

    // Get workouts
    const whereWorkouts: any = { date: { gte: startDate, lte: endDate } };
    if (userIdsToInclude) {
      whereWorkouts.userId = { in: userIdsToInclude };
    }

    const workouts = await prisma.workoutLog.findMany({
      where: whereWorkouts,
      select: { userId: true, userName: true, date: true, points: true },
    });

    // Aggregate
    const pointsByUser = new Map<string, { totalPoints: number; workoutDates: Set<string>; userName?: string }>();
    workouts.forEach(workout => {
      if (!pointsByUser.has(workout.userId)) {
        pointsByUser.set(workout.userId, { totalPoints: 0, workoutDates: new Set(), userName: workout.userName || undefined });
      }
      const userData = pointsByUser.get(workout.userId)!;
      userData.totalPoints += workout.points || 0;
      userData.workoutDates.add(workout.date);
    });

    const userIds = Array.from(pointsByUser.keys());
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, position: true, ageCategory: true, role: true },
    });

    const leaderboardData = Array.from(pointsByUser.entries()).map(([userId, data]) => {
      const userInfo = users.find(u => u.id === userId);
      return {
        userId,
        playerName: userInfo?.name || data.userName || 'Unknown',
        position: userInfo?.position || '-',
        ageCategory: userInfo?.ageCategory,
        role: userInfo?.role || 'player',
        totalPoints: data.totalPoints,
        workoutDays: data.workoutDates.size,
      };
    });

    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    const leaderboard = leaderboardData.map((entry, index) => ({ rank: index + 1, ...entry }));

    let availableCategories: string[] = [];
    if (dbUser?.role === 'player' && dbUser?.ageCategory) {
      availableCategories = [dbUser.ageCategory];
    } else if (dbUser?.role === 'coach' && dbUser?.coachCategories) {
      availableCategories = dbUser.coachCategories;
    }

    res.json({
      month,
      leaderboard,
      currentCategory: categoryFilter[0] || null,
      availableCategories,
    });
  } catch (error) {
    console.error('[LEADERBOARD] Get leaderboard for month error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ========================================
// GET /api/leaderboard/week/:week - Get specific week leaderboard (legacy)
// ========================================
router.get('/week/:week', async (req, res) => {
  try {
    const { week } = req.params;

    // Validate week format
    if (!/^\d{4}-W\d{2}$/.test(week)) {
      return res.status(400).json({ error: 'Week must be in format YYYY-Www' });
    }

    // Get all players' points for specified week
    const weeklyPoints = await prisma.playerWeeklyPoints.findMany({
      where: { week },
      orderBy: { totalPoints: 'desc' },
    });

    // Get user info for each player
    const userIds = weeklyPoints.map(p => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, position: true, role: true },
    });

    // Build leaderboard with user info
    const leaderboard = weeklyPoints.map((points, index) => {
      const user = users.find(u => u.id === points.userId);

      const compliancePct = points.targetPoints > 0
        ? Math.round((points.totalPoints / points.targetPoints) * 100)
        : 0;

      const attendancePct = points.workoutDays > 0
        ? Math.round((points.workoutDays / 7) * 100)
        : 0;

      const freeSharePct = points.workoutDays > 0
        ? Math.round((points.personalWorkoutDays / points.workoutDays) * 100)
        : 0;

      return {
        rank: index + 1,
        userId: points.userId,
        playerName: user?.name || 'Unknown',
        position: user?.position || 'N/A',
        role: user?.role || 'player',
        totalPoints: points.totalPoints,
        targetPoints: points.targetPoints,
        workoutDays: points.workoutDays,
        compliancePct,
        attendancePct,
        freeSharePct,
        teamTrainingDays: points.teamTrainingDays,
        coachWorkoutDays: points.coachWorkoutDays,
        personalWorkoutDays: points.personalWorkoutDays,
        lastUpdated: points.lastUpdated,
      };
    });

    console.log(`[LEADERBOARD] Fetched leaderboard for week ${week}: ${leaderboard.length} players`);
    res.json({ week, leaderboard });
  } catch (error) {
    console.error('[LEADERBOARD] Get leaderboard for week error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ========================================
// GET /api/leaderboard/player/:userId - Get player's history
// ========================================
router.get('/player/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all weeks for this player, sorted by most recent first
    const weeklyPoints = await prisma.playerWeeklyPoints.findMany({
      where: { userId },
      orderBy: { week: 'desc' },
    });

    console.log(`[LEADERBOARD] Fetched player history for ${userId}: ${weeklyPoints.length} weeks`);
    res.json({ userId, history: weeklyPoints });
  } catch (error) {
    console.error('[LEADERBOARD] Get player history error:', error);
    res.status(500).json({ error: 'Failed to fetch player history' });
  }
});

// ========================================
// POST /api/leaderboard/sync - Sync player's weekly points
// ========================================
router.post('/sync', async (req, res) => {
  try {
    const user = (req as any).user;
    const data = syncWeeklyPointsSchema.parse(req.body);

    // Upsert player weekly points (create or update)
    const weeklyPoints = await prisma.playerWeeklyPoints.upsert({
      where: {
        userId_week: {
          userId: user.userId,
          week: data.week,
        },
      },
      update: {
        totalPoints: data.totalPoints,
        targetPoints: data.targetPoints,
        workoutDays: data.workoutDays,
        teamTrainingDays: data.teamTrainingDays,
        coachWorkoutDays: data.coachWorkoutDays,
        personalWorkoutDays: data.personalWorkoutDays,
        breakdown: data.breakdown,
        lastUpdated: new Date(),
      },
      create: {
        userId: user.userId,
        week: data.week,
        totalPoints: data.totalPoints,
        targetPoints: data.targetPoints,
        workoutDays: data.workoutDays,
        teamTrainingDays: data.teamTrainingDays,
        coachWorkoutDays: data.coachWorkoutDays,
        personalWorkoutDays: data.personalWorkoutDays,
        breakdown: data.breakdown,
      },
    });

    console.log(`[LEADERBOARD] Synced points for ${user.email}, week ${data.week}: ${data.totalPoints} points`);
    res.json(weeklyPoints);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[LEADERBOARD] Sync points error:', error);
    res.status(500).json({ error: 'Failed to sync points' });
  }
});

export default router;
