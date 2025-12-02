import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { optionalTenant } from '../middleware/tenant.js';

const router = express.Router();

// Apply optional tenant middleware to all routes
router.use(authenticate, optionalTenant);

// Validation schemas
const exerciseSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1), // Accept any category key (dynamic categories)
  youtubeUrl: z.string()
    .transform(val => val?.trim() || '')
    .refine(val => val === '' || z.string().url().safeParse(val).success, {
      message: 'YouTube URL must be a valid URL. Check for extra characters like brackets or spaces.',
    })
    .optional(),
  positionTags: z.array(z.string()).optional().default([]),
  muscleGroups: z.array(z.enum(['legs', 'chest', 'back', 'shoulders', 'arms', 'core', 'full-body'])).optional().default([]),
  isGlobal: z.boolean().optional().default(true),
  isCustom: z.boolean().optional().default(false),
  descriptionEN: z.string().nullable().optional(),
  descriptionDE: z.string().nullable().optional(),
});

// GET /api/exercises - Get all exercises
// Returns: global exercises (organizationId = null) + org-specific exercises
router.get('/', async (req, res) => {
  try {
    // Build filter: global exercises OR exercises from user's organization
    const where: any = {
      OR: [
        { organizationId: null }, // Global exercises
      ],
    };

    // Add org-specific exercises if user has an organization
    if (req.tenant?.organizationId) {
      where.OR.push({ organizationId: req.tenant.organizationId });
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: [
        { isGlobal: 'desc' },
        { name: 'asc' },
      ],
    });

    res.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// GET /api/exercises/:id - Get single exercise
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Check access: allow global exercises or exercises from user's org
    if (exercise.organizationId && exercise.organizationId !== req.tenant?.organizationId) {
      return res.status(403).json({ error: 'Access denied to this exercise' });
    }

    res.json(exercise);
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// POST /api/exercises - Create new exercise (Coach only)
router.post('/', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can create exercises' });
    }

    const data = exerciseSchema.parse(req.body);

    // For org-specific exercises, check name uniqueness within org
    // For global exercises, check global uniqueness
    const nameFilter: any = { name: data.name };
    if (req.tenant?.organizationId && !data.isGlobal) {
      nameFilter.organizationId = req.tenant.organizationId;
    } else {
      nameFilter.organizationId = null;
    }

    const existing = await prisma.exercise.findFirst({
      where: nameFilter,
    });

    if (existing) {
      return res.status(400).json({ error: 'An exercise with this name already exists' });
    }

    const exercise = await prisma.exercise.create({
      data: {
        ...data,
        youtubeUrl: data.youtubeUrl || null,
        createdBy: req.user.userId,
        // Set organizationId for org-specific exercises
        organizationId: data.isGlobal ? null : (req.tenant?.organizationId || null),
      },
    });

    res.status(201).json(exercise);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create exercise error:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

// PATCH /api/exercises/:id - Update exercise (Coach only)
router.patch('/:id', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can update exercises' });
    }

    const { id } = req.params;
    const data = exerciseSchema.partial().parse(req.body);

    // Check if exercise exists
    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Check access: can only update global exercises or exercises from user's org
    if (existing.organizationId && existing.organizationId !== req.tenant?.organizationId) {
      return res.status(403).json({ error: 'Access denied to this exercise' });
    }

    // If updating name, check for duplicates within same scope
    if (data.name && data.name !== existing.name) {
      const nameFilter: any = { name: data.name };
      if (existing.organizationId) {
        nameFilter.organizationId = existing.organizationId;
      } else {
        nameFilter.organizationId = null;
      }

      const duplicate = await prisma.exercise.findFirst({
        where: nameFilter,
      });

      if (duplicate) {
        return res.status(400).json({ error: 'An exercise with this name already exists' });
      }
    }

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        ...data,
        youtubeUrl: data.youtubeUrl === '' ? null : data.youtubeUrl,
      },
    });

    res.json(exercise);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update exercise error:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// DELETE /api/exercises/:id - Delete exercise (Coach only)
router.delete('/:id', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can delete exercises' });
    }

    const { id } = req.params;

    // Check if exercise exists
    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Check access: can only delete exercises from user's org (not global)
    if (existing.organizationId && existing.organizationId !== req.tenant?.organizationId) {
      return res.status(403).json({ error: 'Access denied to this exercise' });
    }

    // Prevent deleting global exercises (only platform admins should do that)
    if (!existing.organizationId && req.user.platformRole !== 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete global exercises' });
    }

    await prisma.exercise.delete({
      where: { id },
    });

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

export default router;
