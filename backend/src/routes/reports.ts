import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport } from '../services/reports.js';
import prisma from '../utils/prisma.js';

const router = express.Router();

/**
 * GET /api/reports/daily/:date
 * Get daily report for a specific date (coach only)
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 */
router.get('/daily/:date?', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;

    // Only coaches can access reports
    if (user.role !== 'coach') {
      return res.status(403).json({ error: 'Only coaches can access reports' });
    }

    const date = req.params.date ? new Date(req.params.date) : new Date();

    // Validate date
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    console.log(`[REPORTS] Generating daily report for ${date.toISOString().split('T')[0]}`);

    const report = await generateDailyReport(date);

    res.json(report);
  } catch (error) {
    console.error('[REPORTS] Daily report error:', error);
    res.status(500).json({ error: 'Failed to generate daily report' });
  }
});

/**
 * GET /api/reports/weekly/:startDate?
 * Get weekly report starting from a specific date (coach only)
 * @param startDate - Start date in YYYY-MM-DD format (optional, defaults to current week start)
 */
router.get('/weekly/:startDate?', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;

    // Only coaches can access reports
    if (user.role !== 'coach') {
      return res.status(403).json({ error: 'Only coaches can access reports' });
    }

    let startDate: Date;

    if (req.params.startDate) {
      startDate = new Date(req.params.startDate);

      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
    } else {
      // Default to current week (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
      startDate = new Date(today);
      startDate.setDate(today.getDate() + diff);
      startDate.setHours(0, 0, 0, 0);
    }

    console.log(`[REPORTS] Generating weekly report starting from ${startDate.toISOString().split('T')[0]}`);

    const report = await generateWeeklyReport(startDate);

    res.json(report);
  } catch (error) {
    console.error('[REPORTS] Weekly report error:', error);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

/**
 * GET /api/reports/monthly/:month?
 * Get monthly report for a specific month (coach only)
 * @param month - Month in YYYY-MM format (optional, defaults to current month)
 */
router.get('/monthly/:month?', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;

    // Only coaches can access reports
    if (user.role !== 'coach') {
      return res.status(403).json({ error: 'Only coaches can access reports' });
    }

    let month: string;

    if (req.params.month) {
      month = req.params.month;

      // Validate format YYYY-MM
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
      }
    } else {
      // Default to current month
      const today = new Date();
      month = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    console.log(`[REPORTS] Generating monthly report for ${month}`);

    const report = await generateMonthlyReport(month);

    res.json(report);
  } catch (error) {
    console.error('[REPORTS] Monthly report error:', error);
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
});

/**
 * GET /api/reports/weekly-overview/:startDate?
 * Simplified weekly training overview showing who trained on which days
 * @param startDate - Start date in YYYY-MM-DD format (optional, defaults to current week Monday)
 */
router.get('/weekly-overview/:startDate?', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;

    // Only coaches can access reports
    if (user.role !== 'coach') {
      return res.status(403).json({ error: 'Only coaches can access reports' });
    }

    // Get coach's categories for filtering
    const coach = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { coachCategories: true },
    });
    const categoryFilter = coach?.coachCategories || [];

    // Calculate week start (Monday)
    let weekStart: Date;
    if (req.params.startDate) {
      weekStart = new Date(req.params.startDate);
      if (isNaN(weekStart.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
    } else {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart = new Date(today);
      weekStart.setDate(today.getDate() + diff);
    }
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    // Get players in coach's categories
    const playersWhere: any = { role: 'player' };
    if (categoryFilter.length > 0) {
      playersWhere.ageCategory = { in: categoryFilter };
    }

    const players = await prisma.user.findMany({
      where: playersWhere,
      select: { id: true, name: true, position: true, ageCategory: true },
      orderBy: { name: 'asc' },
    });

    // Get workouts for the week
    const playerIds = players.map(p => p.id);
    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId: { in: playerIds },
        date: { gte: startStr, lte: endStr },
      },
      select: { userId: true, date: true, source: true },
    });

    // Get team sessions
    const teamSessions = await prisma.trainingSession.findMany({
      where: {
        date: { gte: startStr, lte: endStr },
        sessionCategory: 'team',
      },
      select: { date: true },
    });
    const teamSessionDates = new Set(teamSessions.map(s => s.date));

    // Build week days array
    const weekDays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDays.push(d.toISOString().split('T')[0]);
    }

    // Build player data
    const playerData = players.map(player => {
      const playerWorkouts = workouts.filter(w => w.userId === player.id);
      const days: Record<string, 'self' | 'team' | null> = {};
      let totalDays = 0;

      weekDays.forEach(day => {
        const dayWorkouts = playerWorkouts.filter(w => w.date === day);
        const hasTeamSession = dayWorkouts.some(w => w.source === 'team') ||
          (teamSessionDates.has(day) && dayWorkouts.length > 0);
        const hasSelfTraining = dayWorkouts.some(w => w.source !== 'team');

        if (hasTeamSession) {
          days[day] = 'team';
          totalDays++;
        } else if (hasSelfTraining) {
          days[day] = 'self';
          totalDays++;
        } else {
          days[day] = null;
        }
      });

      return {
        id: player.id,
        name: player.name,
        position: player.position || '-',
        ageCategory: player.ageCategory,
        days,
        totalDays,
      };
    });

    const playersWhoTrained = playerData.filter(p => p.totalDays > 0).length;

    console.log(`[REPORTS] Weekly overview for ${startStr}: ${players.length} players, ${playersWhoTrained} trained`);

    res.json({
      weekStart: startStr,
      weekEnd: endStr,
      weekDays,
      players: playerData,
      summary: {
        totalPlayers: players.length,
        playersTrained: playersWhoTrained,
      },
      availableCategories: categoryFilter,
    });
  } catch (error) {
    console.error('[REPORTS] Weekly overview error:', error);
    res.status(500).json({ error: 'Failed to generate weekly overview' });
  }
});

export default router;
