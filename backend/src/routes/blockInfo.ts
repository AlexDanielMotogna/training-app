import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireTenant } from '../middleware/tenant.js';

const router = express.Router();

// Apply auth + require tenant to all routes (BlockInfo requires organization)
router.use(authenticate, requireTenant);

// Validation schema
const blockInfoSchema = z.object({
  blockName: z.string().min(1),
  trainingType: z.string().min(1),
  infoText_en: z.string().min(1),
  infoText_de: z.string().min(1),
});

// GET /api/block-info - Get all block info for organization
router.get('/', async (req, res) => {
  try {
    // Only return block info for user's organization
    const blockInfo = await prisma.blockInfo.findMany({
      where: {
        organizationId: req.tenant!.organizationId,
      },
      orderBy: { blockName: 'asc' },
    });

    // Get all training types to map IDs to keys
    const trainingTypes = await prisma.trainingType.findMany();
    const typeMap = new Map(trainingTypes.map(tt => [tt.id, tt.key]));

    // Add trainingTypeKey to each block info
    const enrichedBlockInfo = blockInfo.map(info => ({
      ...info,
      trainingTypeKey: typeMap.get(info.trainingType) || info.trainingType,
    }));

    console.log(`[BLOCK-INFO] Returning ${enrichedBlockInfo.length} block info for org ${req.tenant!.organizationId}`);
    res.json(enrichedBlockInfo);
  } catch (error) {
    console.error('Get block info error:', error);
    res.status(500).json({ error: 'Failed to fetch block info' });
  }
});

// GET /api/block-info/:id - Get single block info
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const blockInfo = await prisma.blockInfo.findUnique({
      where: { id },
    });

    if (!blockInfo) {
      return res.status(404).json({ error: 'Block info not found' });
    }

    // Check tenant isolation
    if (blockInfo.organizationId !== req.tenant!.organizationId) {
      return res.status(403).json({ error: 'Access denied to this block info' });
    }

    res.json(blockInfo);
  } catch (error) {
    console.error('Get block info error:', error);
    res.status(500).json({ error: 'Failed to fetch block info' });
  }
});

// POST /api/block-info - Create new block info (Coach only)
router.post('/', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant!.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can create block info' });
    }

    const data = blockInfoSchema.parse(req.body);

    // Check if block info already exists for this combination in this org
    const existing = await prisma.blockInfo.findFirst({
      where: {
        organizationId: req.tenant!.organizationId,
        blockName: data.blockName,
        trainingType: data.trainingType,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Block info for this block and training type already exists' });
    }

    const blockInfo = await prisma.blockInfo.create({
      data: {
        ...data,
        organizationId: req.tenant!.organizationId,
      },
    });

    res.status(201).json(blockInfo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create block info error:', error);
    res.status(500).json({ error: 'Failed to create block info' });
  }
});

// PATCH /api/block-info/:id - Update block info (Coach only)
router.patch('/:id', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant!.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can update block info' });
    }

    const { id } = req.params;
    const data = blockInfoSchema.partial().parse(req.body);

    // Check if block info exists
    const existing = await prisma.blockInfo.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Block info not found' });
    }

    // Check tenant isolation
    if (existing.organizationId !== req.tenant!.organizationId) {
      return res.status(403).json({ error: 'Access denied to this block info' });
    }

    const blockInfo = await prisma.blockInfo.update({
      where: { id },
      data,
    });

    res.json(blockInfo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update block info error:', error);
    res.status(500).json({ error: 'Failed to update block info' });
  }
});

// DELETE /api/block-info/:id - Delete block info (Coach only)
router.delete('/:id', async (req, res) => {
  try {
    // Check if user is coach (legacy role or org role)
    const isCoach = req.user.role === 'coach' || req.tenant!.permissions.isCoach;
    if (!isCoach) {
      return res.status(403).json({ error: 'Only coaches can delete block info' });
    }

    const { id } = req.params;

    // Check if block info exists
    const existing = await prisma.blockInfo.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Block info not found' });
    }

    // Check tenant isolation
    if (existing.organizationId !== req.tenant!.organizationId) {
      return res.status(403).json({ error: 'Access denied to this block info' });
    }

    await prisma.blockInfo.delete({
      where: { id },
    });

    res.json({ message: 'Block info deleted successfully' });
  } catch (error) {
    console.error('Delete block info error:', error);
    res.status(500).json({ error: 'Failed to delete block info' });
  }
});

export default router;
