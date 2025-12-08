import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { optionalTenant } from '../middleware/tenant.js';

const router = express.Router();

// Apply auth + optional tenant to all routes
router.use(authenticate, optionalTenant);

// Validation schema
const trainingTypeSchema = z.object({
  key: z.string().min(1),
  nameEN: z.string().min(1),
  nameDE: z.string().min(1),
  season: z.enum(['in-season', 'off-season', 'pre-season']),
  active: z.boolean().optional().default(true),
});

// GET /api/training-types - Get all training types
// Returns: global types (organizationId = null) + org-specific types
router.get('/', async (req, res) => {
  try {
    // Build filter: global types OR types from user's organization
    const where: any = {
      OR: [
        { organizationId: null }, // Global/system types
      ],
    };

    // Add org-specific types if user has an organization
    if (req.tenant?.organizationId) {
      where.OR.push({ organizationId: req.tenant.organizationId });
    }

    const trainingTypes = await prisma.trainingType.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    console.log(`[TRAINING-TYPES] Returning ${trainingTypes.length} types for org ${req.tenant?.organizationId || 'none'}`);
    res.json(trainingTypes);
  } catch (error) {
    console.error('Get training types error:', error);
    res.status(500).json({ error: 'Failed to fetch training types' });
  }
});

// GET /api/training-types/:id - Get single training type
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const trainingType = await prisma.trainingType.findUnique({
      where: { id },
    });

    if (!trainingType) {
      return res.status(404).json({ error: 'Training type not found' });
    }

    // Check access: allow global types or types from user's org
    if (trainingType.organizationId && trainingType.organizationId !== req.tenant?.organizationId) {
      return res.status(403).json({ error: 'Access denied to this training type' });
    }

    res.json(trainingType);
  } catch (error) {
    console.error('Get training type error:', error);
    res.status(500).json({ error: 'Failed to fetch training type' });
  }
});

// POST /api/training-types - Create new training type (Coach only)
router.post('/', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can create training types' });
    }

    const data = trainingTypeSchema.parse(req.body);

    // Check if key already exists in global or user's org
    const existing = await prisma.trainingType.findFirst({
      where: {
        key: data.key,
        OR: [
          { organizationId: null },
          { organizationId: req.tenant?.organizationId || null },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'A training type with this key already exists' });
    }

    const trainingType = await prisma.trainingType.create({
      data: {
        ...data,
        // Set organizationId for org-specific types
        organizationId: req.tenant?.organizationId || null,
      },
    });

    res.status(201).json(trainingType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create training type error:', error);
    res.status(500).json({ error: 'Failed to create training type' });
  }
});

// PATCH /api/training-types/:id - Update training type (Coach only)
router.patch('/:id', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can update training types' });
    }

    const { id } = req.params;
    const data = trainingTypeSchema.partial().parse(req.body);

    // Check if training type exists
    const existing = await prisma.trainingType.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Training type not found' });
    }

    // Check access: can only update types from user's org (not global)
    if (existing.organizationId && existing.organizationId !== req.tenant?.organizationId) {
      return res.status(403).json({ error: 'Access denied to this training type' });
    }

    // If updating key, check it's not taken in same scope
    if (data.key && data.key !== existing.key) {
      const keyTaken = await prisma.trainingType.findFirst({
        where: {
          key: data.key,
          organizationId: existing.organizationId,
        },
      });

      if (keyTaken) {
        return res.status(400).json({ error: 'A training type with this key already exists' });
      }
    }

    const trainingType = await prisma.trainingType.update({
      where: { id },
      data,
    });

    res.json(trainingType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update training type error:', error);
    res.status(500).json({ error: 'Failed to update training type' });
  }
});

// DELETE /api/training-types/:id - Delete training type (Coach only)
router.delete('/:id', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can delete training types' });
    }

    const { id } = req.params;

    // Check if training type exists
    const existing = await prisma.trainingType.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Training type not found' });
    }

    // Check access: can only delete types from user's org (not global)
    if (existing.organizationId && existing.organizationId !== req.tenant?.organizationId) {
      return res.status(403).json({ error: 'Access denied to this training type' });
    }

    // Prevent deleting global types (only platform admins should do that)
    if (!existing.organizationId && req.user.platformRole !== 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete global training types' });
    }

    await prisma.trainingType.delete({
      where: { id },
    });

    res.json({ message: 'Training type deleted successfully' });
  } catch (error) {
    console.error('Delete training type error:', error);
    res.status(500).json({ error: 'Failed to delete training type' });
  }
});

export default router;
