import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireTenant, requireOrgAdmin, canAccessTeam, optionalTenant } from '../middleware/tenant.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ========================================
// TEAM ENDPOINTS
// ========================================

// GET /api/organizations/:orgId/teams - Get all teams in organization
router.get('/', requireTenant, async (req, res) => {
  try {
    const orgId = req.tenant!.organizationId;

    const teams = await prisma.team.findMany({
      where: { organizationId: orgId },
      include: {
        ageCategory: true,
        _count: {
          select: {
            members: {
              where: { isActive: true }, // Only count active members
            },
          },
        },
      },
      orderBy: [
        { ageCategory: { displayOrder: 'asc' } },
        { name: 'asc' },
      ],
    });

    res.json(teams);
  } catch (error) {
    console.error('[TEAMS] Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/organizations/:orgId/teams/my-teams - Get teams the user belongs to
router.get('/my-teams', requireTenant, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgId = req.tenant!.organizationId;

    // Get user's team memberships
    const memberships = await prisma.teamMember.findMany({
      where: {
        userId: userId,
        isActive: true,
        team: { organizationId: orgId },
      },
      include: {
        team: {
          include: {
            ageCategory: true,
          },
        },
      },
    });

    const teams = memberships.map(m => ({
      id: m.team.id,
      name: m.team.name,
      ageCategoryId: m.team.ageCategoryId,
      ageCategoryCode: m.team.ageCategory?.code,
      ageCategoryName: m.team.ageCategory?.name,
      isActive: m.team.isActive,
    }));

    const membershipData = memberships.map(m => ({
      teamId: m.teamId,
      role: m.role,
      positionId: m.positionId,
      jerseyNumber: m.jerseyNumber,
    }));

    res.json({
      teams,
      memberships: membershipData,
    });
  } catch (error) {
    console.error('[TEAMS] Get my teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/organizations/:orgId/teams/:id - Get single team
router.get('/:id', requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.tenant!.organizationId;

    const team = await prisma.team.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
      include: {
        ageCategory: true,
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            position: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
                group: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check access (admins can see all, others only their teams)
    if (!req.tenant!.permissions.isAdmin && !canAccessTeam(req, id)) {
      return res.status(403).json({ error: 'Access denied to this team' });
    }

    res.json(team);
  } catch (error) {
    console.error('[TEAMS] Get team error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /api/organizations/:orgId/teams - Create team (admin+)
const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  ageCategoryId: z.string(),
  isActive: z.boolean().optional().default(true),
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgId = req.params.orgId || req.baseUrl.split('/')[3]; // Extract from URL
    const data = createTeamSchema.parse(req.body);

    // Verify user is a member of this organization with admin rights
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this organization' });
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check team limit
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { _count: { select: { teams: true } } },
    });

    if (org && org._count.teams >= org.maxTeams) {
      return res.status(400).json({
        error: 'Team limit reached',
        message: `Your plan allows ${org.maxTeams} team(s). Please upgrade to add more.`,
      });
    }

    // Verify age category exists and belongs to org's sport
    const ageCategory = await prisma.ageCategory.findFirst({
      where: {
        id: data.ageCategoryId,
        sport: {
          organizations: { some: { id: orgId } },
        },
      },
    });

    if (!ageCategory) {
      return res.status(400).json({ error: 'Invalid age category for this organization' });
    }

    // Check for duplicate name
    const existing = await prisma.team.findFirst({
      where: {
        organizationId: orgId,
        name: data.name,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'A team with this name already exists' });
    }

    const team = await prisma.team.create({
      data: {
        ...data,
        organizationId: orgId,
      },
      include: {
        ageCategory: true,
      },
    });

    console.log(`[TEAMS] Created: ${team.name} in org ${orgId}`);
    res.status(201).json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[TEAMS] Create error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PATCH /api/organizations/:orgId/teams/:id - Update team (admin+)
const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  ageCategoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  seasonPhase: z.enum(['off-season', 'pre-season', 'in-season']).optional(),
});

router.patch('/:id', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.tenant!.organizationId;
    const data = updateTeamSchema.parse(req.body);

    // Verify team belongs to org
    const existing = await prisma.team.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // If changing name, check for duplicates
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.team.findFirst({
        where: {
          organizationId: orgId,
          name: data.name,
          id: { not: id },
        },
      });

      if (duplicate) {
        return res.status(400).json({ error: 'A team with this name already exists' });
      }
    }

    const team = await prisma.team.update({
      where: { id },
      data,
      include: {
        ageCategory: true,
      },
    });

    console.log(`[TEAMS] Updated: ${team.name}`);
    res.json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[TEAMS] Update error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/organizations/:orgId/teams/:id - Delete team (admin+)
router.delete('/:id', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.tenant!.organizationId;

    // Verify team belongs to org
    const existing = await prisma.team.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Delete team (cascades to team members)
    await prisma.team.delete({
      where: { id },
    });

    console.log(`[TEAMS] Deleted: ${existing.name}`);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('[TEAMS] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// ========================================
// TEAM MEMBER ENDPOINTS
// ========================================

// GET /api/organizations/:orgId/teams/:id/members - Get team members
router.get('/:id/members', requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.tenant!.organizationId;

    // Verify team belongs to org
    const team = await prisma.team.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check access
    if (!req.tenant!.permissions.isAdmin && !canAccessTeam(req, id)) {
      return res.status(403).json({ error: 'Access denied to this team' });
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId: id, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            birthDate: true,
          },
        },
        position: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
            group: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { jerseyNumber: 'asc' },
      ],
    });

    res.json(members);
  } catch (error) {
    console.error('[TEAMS] Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST /api/organizations/:orgId/teams/:id/members - Add member to team (admin+)
const addMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['head_coach', 'assistant_coach', 'player']),
  positionId: z.string().optional(),
  jerseyNumber: z.number().int().min(0).max(99).optional(),
});

router.post('/:id/members', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.tenant!.organizationId;
    const data = addMemberSchema.parse(req.body);

    // Verify team belongs to org
    const team = await prisma.team.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify user is a member of the organization
    const orgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: data.userId,
        },
      },
    });

    if (!orgMembership) {
      return res.status(400).json({ error: 'User is not a member of this organization' });
    }

    // Check if already a member
    const existing = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: id,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ error: 'User is already a member of this team' });
      }
      // Reactivate membership
      const member = await prisma.teamMember.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          role: data.role,
          positionId: data.positionId,
          jerseyNumber: data.jerseyNumber,
          leftAt: null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          position: {
            select: {
              id: true,
              name: true,
              abbreviation: true,
              group: true,
            },
          },
        },
      });
      return res.json(member);
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: id,
        userId: data.userId,
        role: data.role,
        positionId: data.positionId,
        jerseyNumber: data.jerseyNumber,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        // position: true, // Not yet defined in schema
      },
    });

    console.log(`[TEAMS] Member added: ${data.userId} to team ${id}`);
    res.status(201).json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[TEAMS] Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// PATCH /api/organizations/:orgId/teams/:teamId/members/:userId - Update team member
const updateMemberSchema = z.object({
  role: z.enum(['head_coach', 'assistant_coach', 'player']).optional(),
  positionId: z.string().optional().nullable(),
  jerseyNumber: z.number().int().min(0).max(99).optional().nullable(),
});

router.patch('/:teamId/members/:userId', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const orgId = req.tenant!.organizationId;
    const data = updateMemberSchema.parse(req.body);

    // Verify team belongs to org
    const team = await prisma.team.findFirst({
      where: { id: teamId, organizationId: orgId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const member = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        // position: true, // Not yet defined in schema
      },
    });

    console.log(`[TEAMS] Member updated: ${userId} in team ${teamId}`);
    res.json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[TEAMS] Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/organizations/:orgId/teams/:teamId/members/:userId - Remove from team
router.delete('/:teamId/members/:userId', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const orgId = req.tenant!.organizationId;

    // Verify team belongs to org
    const team = await prisma.team.findFirst({
      where: { id: teamId, organizationId: orgId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Soft delete (mark as inactive)
    await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });

    console.log(`[TEAMS] Member removed: ${userId} from team ${teamId}`);
    res.json({ message: 'Member removed from team' });
  } catch (error) {
    console.error('[TEAMS] Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
