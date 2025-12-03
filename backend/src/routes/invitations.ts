import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { generateToken, type JWTPayload } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/invitations/verify/:token - Verify invitation token (public)
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const isExpired = new Date(invitation.expiresAt) < new Date();
    const isAccepted = invitation.acceptedAt !== null;

    res.json({
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      isExpired,
      isAccepted,
    });
  } catch (error) {
    console.error('[INVITATIONS] Verify error:', error);
    res.status(500).json({ error: 'Failed to verify invitation' });
  }
});

// POST /api/invitations/accept - Accept invitation (requires auth)
router.post('/accept', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user!.userId;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return res.status(400).json({ error: 'Invitation has already been accepted' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify email matches
    if (user.email !== invitation.email) {
      return res.status(403).json({
        error: 'This invitation was sent to a different email address',
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId,
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this organization' });
    }

    // Create organization member
    const member = await prisma.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role,
        joinedAt: new Date(),
        invitedBy: invitation.invitedBy,
        // Set permissions based on role
        canManageMembers: invitation.role === 'admin',
        canManageContent: ['admin', 'coach'].includes(invitation.role),
        canManageBilling: invitation.role === 'admin',
        canManageSettings: invitation.role === 'admin',
      },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    // Update user's primary organizationId if they don't have one
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: invitation.organizationId,
      },
    });

    console.log(`[INVITATIONS] User ${userId} accepted invitation to org ${invitation.organizationId}`);

    res.json({
      message: 'Invitation accepted successfully',
      organizationId: invitation.organizationId,
      member,
    });
  } catch (error) {
    console.error('[INVITATIONS] Accept error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// POST /api/invitations/signup - Signup with invitation (public)
router.post('/signup', async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ error: 'Token, name, and password are required' });
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return res.status(400).json({ error: 'Invitation has already been accepted' });
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'An account with this email already exists. Please log in instead.',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        passwordHash,
        name,
        organizationId: invitation.organizationId,
        role: invitation.role === 'coach' ? 'coach' : 'player', // Legacy role field
      },
    });

    // Create organization member
    await prisma.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId: user.id,
        role: invitation.role,
        joinedAt: new Date(),
        invitedBy: invitation.invitedBy,
        // Set permissions based on role
        canManageMembers: invitation.role === 'admin',
        canManageContent: ['admin', 'coach'].includes(invitation.role),
        canManageBilling: invitation.role === 'admin',
        canManageSettings: invitation.role === 'admin',
      },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    // Generate JWT token
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: invitation.organizationId,
      organizationRole: invitation.role,
    };
    const authToken = generateToken(jwtPayload);

    console.log(`[INVITATIONS] New user ${user.id} signed up via invitation to org ${invitation.organizationId}`);

    res.json({
      message: 'Account created and invitation accepted',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error('[INVITATIONS] Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

export default router;
