import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me - Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        jerseyNumber: true,
        birthDate: true,
        age: true,
        weightKg: true,
        heightCm: true,
        position: true,
        sex: true,
        phone: true,
        instagram: true,
        snapchat: true,
        tiktok: true,
        hudl: true,
        metricsPublic: true,
        aiCoachEnabled: true,
        createdAt: true,
        teamMemberships: {
          where: { isActive: true },
          select: {
            jerseyNumber: true,
            position: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
                group: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 1,
          orderBy: { joinedAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge TeamMember data with User data (TeamMember takes precedence)
    const activeTeamMember = user.teamMemberships?.[0];
    const responseData = {
      ...user,
      teamMemberships: undefined, // Remove the array from response
      // Override with TeamMember data if available
      ...(activeTeamMember && {
        jerseyNumber: activeTeamMember.jerseyNumber ?? user.jerseyNumber,
        position: activeTeamMember.position?.abbreviation ?? user.position,
        positionFull: activeTeamMember.position?.name,
        positionGroup: activeTeamMember.position?.group,
        teamId: activeTeamMember.team?.id,
        teamName: activeTeamMember.team?.name,
      }),
    };

    res.json(responseData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users - Get all users in the same organization (for team directory)
router.get('/', authenticate, async (req, res) => {
  try {
    // Get the current user to find their organizationId
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { organizationId: true },
    });

    if (!currentUser?.organizationId) {
      // If user has no organization, return empty array
      console.log('[USERS] User has no organization, returning empty array');
      return res.json([]);
    }

    // Only return users from the same organization
    const users = await prisma.user.findMany({
      where: {
        organizationId: currentUser.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jerseyNumber: true,
        position: true,
        age: true,
        weightKg: true,
        heightCm: true,
        sex: true,
        metricsPublic: true,
        birthDate: true,
        avatarUrl: true,
      },
      orderBy: [
        { role: 'asc' }, // Coaches first
        { name: 'asc' },
      ],
    });

    console.log(`[USERS] Returning ${users.length} users for org ${currentUser.organizationId}`);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jerseyNumber: true,
        birthDate: true,
        age: true,
        weightKg: true,
        heightCm: true,
        position: true,
        sex: true,
        phone: true,
        instagram: true,
        snapchat: true,
        tiktok: true,
        hudl: true,
        metricsPublic: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/me - Update current user profile
router.patch('/me', authenticate, async (req, res) => {
  try {
    const {
      name,
      jerseyNumber,
      birthDate,
      age,
      weightKg,
      heightCm,
      position,
      sex,
      phone,
      instagram,
      snapchat,
      tiktok,
      hudl,
      metricsPublic,
      preferredLanguage,
      aiCoachEnabled,
      aiApiKey,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name && { name }),
        ...(jerseyNumber !== undefined && { jerseyNumber }),
        ...(birthDate && { birthDate }),
        ...(age !== undefined && { age }),
        ...(weightKg !== undefined && { weightKg }),
        ...(heightCm !== undefined && { heightCm }),
        ...(position && { position }),
        ...(sex && { sex }),
        ...(phone !== undefined && { phone }),
        ...(instagram !== undefined && { instagram }),
        ...(snapchat !== undefined && { snapchat }),
        ...(tiktok !== undefined && { tiktok }),
        ...(hudl !== undefined && { hudl }),
        ...(metricsPublic !== undefined && { metricsPublic }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(aiCoachEnabled !== undefined && { aiCoachEnabled }),
        ...(aiApiKey !== undefined && { aiApiKey }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        jerseyNumber: true,
        birthDate: true,
        age: true,
        weightKg: true,
        heightCm: true,
        position: true,
        sex: true,
        phone: true,
        instagram: true,
        snapchat: true,
        tiktok: true,
        hudl: true,
        metricsPublic: true,
        aiCoachEnabled: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
