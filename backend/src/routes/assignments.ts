import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { optionalTenant } from '../middleware/tenant.js';
import { createNotificationsForUsers } from './notifications.js';

const router = express.Router();

// Apply auth + optional tenant to all routes
router.use(authenticate, optionalTenant);

// Validation schemas
const assignmentSchema = z.object({
  templateId: z.string(),
  playerIds: z.array(z.string()), // Array of player IDs
  startDate: z.string(), // ISO date
  endDate: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
});

// GET /api/assignments - Get assignments (filtered by user role and organization)
router.get('/', async (req, res) => {
  try {
    const { playerId, templateId } = req.query;

    // Build filter based on organization via template
    const templateFilter: any = {};
    if (req.tenant?.organizationId) {
      templateFilter.OR = [
        { organizationId: null }, // Legacy/global templates
        { organizationId: req.tenant.organizationId },
      ];
    }

    let assignments = await prisma.trainingAssignment.findMany({
      include: {
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by organization via template
    if (req.tenant?.organizationId) {
      assignments = assignments.filter(a =>
        a.template.organizationId === null ||
        a.template.organizationId === req.tenant!.organizationId
      );
    }

    // Filter based on role and query params
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      // Players only see their own assignments
      assignments = assignments.filter(a => a.playerIds.includes(req.user.userId));
    } else {
      // Coaches can filter by playerId or templateId
      if (playerId) {
        assignments = assignments.filter(a => a.playerIds.includes(playerId as string));
      }
      if (templateId) {
        assignments = assignments.filter(a => a.templateId === templateId);
      }
    }

    // Enrich templates with trainingTypeName
    const trainingTypes = await prisma.trainingType.findMany();
    const typeMap = new Map(trainingTypes.map(tt => [tt.id, tt]));

    const enrichedAssignments = assignments.map(assignment => {
      const trainingType = typeMap.get(assignment.template.trainingType);

      return {
        ...assignment,
        template: {
          id: assignment.template.id,
          trainingTypeId: assignment.template.trainingType,
          trainingTypeName: trainingType?.nameEN || 'Unknown',
          positions: assignment.template.positions && assignment.template.positions.length > 0
            ? assignment.template.positions
            : assignment.template.position
              ? [assignment.template.position]
              : ['RB'],
          blocks: assignment.template.blocks,
          durationWeeks: assignment.template.durationWeeks || 8,
          frequencyPerWeek: assignment.template.frequencyPerWeek || '2-3',
          weeklyNotes: assignment.template.weeklyNotes || '',
          active: assignment.template.isActive,
          createdAt: assignment.template.createdAt,
          updatedAt: assignment.template.updatedAt,
        }
      };
    });

    res.json(enrichedAssignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id - Get single assignment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.trainingAssignment.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check tenant isolation via template
    if (req.tenant?.organizationId) {
      if (assignment.template.organizationId &&
          assignment.template.organizationId !== req.tenant.organizationId) {
        return res.status(403).json({ error: 'Access denied to this assignment' });
      }
    }

    // Players can only view their own assignments
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach && !assignment.playerIds.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// POST /api/assignments - Create new assignment (Coach only)
router.post('/', async (req, res) => {
  try {
    // Check if user is coach
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can create assignments' });
    }

    const data = assignmentSchema.parse(req.body);

    // Check if template exists
    const template = await prisma.trainingTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check template access
    if (req.tenant?.organizationId) {
      if (template.organizationId && template.organizationId !== req.tenant.organizationId) {
        return res.status(403).json({ error: 'Access denied to this template' });
      }
    }

    // Validate all players exist and are in the same organization
    const players = await prisma.user.findMany({
      where: {
        id: { in: data.playerIds },
        ...(req.tenant?.organizationId && { organizationId: req.tenant.organizationId }),
      },
    });

    if (players.length !== data.playerIds.length) {
      return res.status(404).json({ error: 'One or more players not found in your organization' });
    }

    const nonPlayers = players.filter(p => p.role !== 'player');
    if (nonPlayers.length > 0) {
      return res.status(400).json({ error: 'Can only assign templates to players' });
    }

    const assignment = await prisma.trainingAssignment.create({
      data: {
        templateId: data.templateId,
        playerIds: data.playerIds,
        startDate: data.startDate,
        endDate: data.endDate,
        active: data.active,
        assignedBy: req.user.userId,
      },
      include: {
        template: true,
      },
    });

    // Send notifications to assigned players
    if (data.playerIds.length > 0) {
      const title = 'Nuevo plan de entrenamiento';
      const message = `El coach te ha asignado el plan: ${template.name}`;

      await createNotificationsForUsers(
        data.playerIds,
        'new_plan',
        title,
        message,
        '/training',
        assignment.id
      );
    }

    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// PATCH /api/assignments/:id - Update assignment (Coach only)
router.patch('/:id', async (req, res) => {
  try {
    // Check if user is coach
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can update assignments' });
    }

    const { id } = req.params;
    const data = assignmentSchema.partial().parse(req.body);

    // Check if assignment exists
    const existing = await prisma.trainingAssignment.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check tenant isolation via template
    if (req.tenant?.organizationId) {
      if (existing.template.organizationId &&
          existing.template.organizationId !== req.tenant.organizationId) {
        return res.status(403).json({ error: 'Access denied to this assignment' });
      }
    }

    const assignment = await prisma.trainingAssignment.update({
      where: { id },
      data,
      include: {
        template: true,
      },
    });

    res.json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// DELETE /api/assignments/:id - Delete assignment (Coach only)
router.delete('/:id', async (req, res) => {
  try {
    // Check if user is coach
    const isCoach = req.user.role === 'coach' || req.tenant?.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can delete assignments' });
    }

    const { id } = req.params;

    // Check if assignment exists
    const existing = await prisma.trainingAssignment.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check tenant isolation via template
    if (req.tenant?.organizationId) {
      if (existing.template.organizationId &&
          existing.template.organizationId !== req.tenant.organizationId) {
        return res.status(403).json({ error: 'Access denied to this assignment' });
      }
    }

    await prisma.trainingAssignment.delete({
      where: { id },
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

export default router;
