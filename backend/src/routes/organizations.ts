import express from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireTenant, requireOrgAdmin, requireOrgOwner } from '../middleware/tenant.js';
import { generateToken } from '../utils/jwt.js';
import { upload, uploadOrganizationLogo, deleteImage } from '../utils/cloudinary.js';

const router = express.Router();

// ========================================
// PUBLIC ENDPOINTS (for signup flow)
// ========================================

// GET /api/organizations/sports - Get available sports for signup (NO AUTH REQUIRED)
router.get('/sports', async (_req, res) => {
  try {
    const sports = await prisma.sport.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        positions: {
          orderBy: { displayOrder: 'asc' },
        },
        ageCategories: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    res.json(sports);
  } catch (error) {
    console.error('[ORGANIZATIONS] Get sports error:', error);
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

// All routes below require authentication
router.use(authenticate);

// POST /api/organizations - Create organization (during signup)
const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  sportId: z.string(),
  primaryColor: z.string().optional().default('#1976d2'),
  secondaryColor: z.string().optional().default('#dc004e'),
  timezone: z.string().optional().default('Europe/Madrid'),
  language: z.string().optional().default('en'),
});

router.post('/', async (req, res) => {
  try {
    const data = createOrgSchema.parse(req.body);
    const userId = req.user.userId;

    // Check if slug is available
    const existingSlug = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return res.status(400).json({ error: 'This URL is already taken. Please choose another.' });
    }

    // Verify sport exists
    const sport = await prisma.sport.findUnique({
      where: { id: data.sportId },
    });

    if (!sport) {
      return res.status(400).json({ error: 'Invalid sport selected' });
    }

    // Create organization with owner membership
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        sportId: data.sportId,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        timezone: data.timezone,
        language: data.language,
        createdBy: userId,
        // Default free plan limits
        plan: 'free',
        maxMembers: 15,
        maxCoaches: 2,
        maxTeams: 1,
        maxStorageGB: 1,
        subscriptionStatus: 'trialing',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    // Create owner membership
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: userId,
        role: 'owner',
        canManageMembers: true,
        canManageContent: true,
        canManageBilling: true,
        canManageSettings: true,
      },
    });

    // Update user's default organization
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { organizationId: organization.id },
    });

    console.log(`[ORGANIZATIONS] Created: ${organization.name} by user ${userId}`);

    // Generate new JWT token with organizationId
    const newToken = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      organizationId: organization.id,
      organizationRole: 'owner',
      platformRole: updatedUser.platformRole || 'user',
    });

    res.status(201).json({
      ...organization,
      role: 'owner',
      token: newToken, // Include new token with organizationId
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[ORGANIZATIONS] Create error:', error);
    console.error('[ORGANIZATIONS] Error message:', error.message);
    console.error('[ORGANIZATIONS] Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to create organization',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ========================================
// ORGANIZATION MEMBER ENDPOINTS
// ========================================

// GET /api/organizations/:id - Get organization details
router.get('/:id', requireTenant, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user has access to this org
    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        sport: {
          include: {
            ageCategories: {
              orderBy: {
                displayOrder: 'asc',
              },
            },
          },
        },
        teams: {
          include: {
            ageCategory: true,
          },
        },
        _count: {
          select: {
            teams: true,
            members: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('[ORGANIZATIONS] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// PATCH /api/organizations/:id - Update organization (admin+)
const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  seasonPhase: z.enum(['off-season', 'pre-season', 'in-season', 'post-season']).optional(),
});

router.patch('/:id', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = updateOrgSchema.parse(req.body);

    const organization = await prisma.organization.update({
      where: { id },
      data,
    });

    console.log(`[ORGANIZATIONS] Updated: ${organization.name}`);
    res.json(organization);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[ORGANIZATIONS] Update error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// GET /api/organizations/:id/members - Get organization members
router.get('/:id/members', requireTenant, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
    });

    res.json(members);
  } catch (error) {
    console.error('[ORGANIZATIONS] Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// DELETE /api/organizations/:id/members/:userId - Remove member (admin+)
router.delete('/:id/members/:userId', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get membership to check role
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: id,
          userId: userId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot remove owner
    if (membership.role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove the organization owner' });
    }

    // Admin cannot remove another admin (only owner can)
    if (membership.role === 'admin' && !req.tenant!.permissions.isOwner) {
      return res.status(403).json({ error: 'Only the owner can remove admins' });
    }

    // Remove from organization
    await prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId: id,
          userId: userId,
        },
      },
    });

    // Also remove from all teams in this org
    await prisma.teamMember.deleteMany({
      where: {
        userId: userId,
        team: { organizationId: id },
      },
    });

    console.log(`[ORGANIZATIONS] Member removed: ${userId} from ${id}`);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('[ORGANIZATIONS] Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// PATCH /api/organizations/:id/members/:userId - Update member role (admin+)
const updateMemberSchema = z.object({
  role: z.enum(['admin', 'coach', 'player']),
});

router.patch('/:id/members/:userId', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = updateMemberSchema.parse(req.body);

    // Get current membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: id,
          userId: userId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot change owner role
    if (membership.role === 'owner') {
      return res.status(400).json({ error: 'Cannot change the owner role' });
    }

    // Only owner can promote to admin
    if (data.role === 'admin' && !req.tenant!.permissions.isOwner) {
      return res.status(403).json({ error: 'Only the owner can promote to admin' });
    }

    // Update membership
    const updated = await prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId: id,
          userId: userId,
        },
      },
      data: {
        role: data.role,
        canManageMembers: data.role === 'admin',
        canManageContent: data.role === 'admin' || data.role === 'coach',
        canManageSettings: data.role === 'admin',
      },
    });

    console.log(`[ORGANIZATIONS] Member role updated: ${userId} to ${data.role}`);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[ORGANIZATIONS] Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// ========================================
// ORGANIZATION LOGO ENDPOINTS
// ========================================

// POST /api/organizations/:id/logo - Upload organization logo (admin+)
router.post('/:id/logo', requireTenant, requireOrgAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get current organization to check if logo exists
    const org = await prisma.organization.findUnique({
      where: { id },
      select: { logoUrl: true },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Upload new logo to Cloudinary
    const { url } = await uploadOrganizationLogo(req.file.buffer, id);

    // Update organization with new logo URL
    const updated = await prisma.organization.update({
      where: { id },
      data: { logoUrl: url },
    });

    console.log(`[ORGANIZATIONS] Logo uploaded for: ${id}`);
    res.json({ logoUrl: updated.logoUrl });
  } catch (error) {
    console.error('[ORGANIZATIONS] Logo upload error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// DELETE /api/organizations/:id/logo - Delete organization logo (admin+)
router.delete('/:id/logo', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get current organization
    const org = await prisma.organization.findUnique({
      where: { id },
      select: { logoUrl: true },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (!org.logoUrl) {
      return res.status(400).json({ error: 'No logo to delete' });
    }

    // Extract public_id from Cloudinary URL if it's a Cloudinary URL
    if (org.logoUrl.includes('cloudinary.com')) {
      try {
        const publicId = `teamtraining/organizations/logo-${id}`;
        await deleteImage(publicId);
      } catch (error) {
        console.error('[ORGANIZATIONS] Failed to delete from Cloudinary:', error);
        // Continue anyway - we'll remove the URL from DB
      }
    }

    // Remove logo URL from organization
    await prisma.organization.update({
      where: { id },
      data: { logoUrl: null },
    });

    console.log(`[ORGANIZATIONS] Logo deleted for: ${id}`);
    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('[ORGANIZATIONS] Logo delete error:', error);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
});

// ========================================
// MEMBER MANAGEMENT ENDPOINTS
// ========================================

// GET /api/organizations/:id/members - Get all members (admin+)
router.get('/:id/members', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // owner, admin, coach, player
        { joinedAt: 'desc' },
      ],
    });

    res.json(members);
  } catch (error) {
    console.error('[ORGANIZATIONS] Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/organizations/:id/invitations - Get pending invitations (admin+)
router.get('/:id/invitations', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId: id,
        acceptedAt: null, // Only pending invitations
        expiresAt: { gt: new Date() }, // Not expired
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invitations);
  } catch (error) {
    console.error('[ORGANIZATIONS] Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// POST /api/organizations/:id/members/invite - Invite new member (admin+)
const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'coach', 'player']),
  teamIds: z.array(z.string()).optional().default([]),
});

router.post('/:id/members/invite', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = inviteMemberSchema.parse(req.body);

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: id,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        return res.status(400).json({ error: 'User is already a member of this organization' });
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organizationId: id,
        email: body.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An invitation has already been sent to this email' });
    }

    // Get organization details for email
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Generate invitation token
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: id,
        email: body.email,
        role: body.role,
        teamIds: body.teamIds,
        token,
        expiresAt,
        invitedBy: req.user!.id,
      },
    });

    // Send invitation email
    const { sendInvitationEmail } = await import('../utils/email.js');
    await sendInvitationEmail({
      email: body.email,
      organizationName: organization.name,
      inviterName: `${req.user!.firstName} ${req.user!.lastName}`,
      role: body.role,
      invitationToken: token,
    });

    console.log(`[ORGANIZATIONS] Invitation sent to ${body.email} for ${id}`);
    res.status(201).json(invitation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[ORGANIZATIONS] Invite member error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// POST /api/organizations/:id/invitations/:invitationId/resend - Resend invitation (admin+)
router.post('/:id/invitations/:invitationId/resend', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id, invitationId } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId: id,
        acceptedAt: null,
      },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Update expiration date
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { expiresAt: newExpiresAt },
    });

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Resend email
    const { sendInvitationEmail } = await import('../utils/email.js');
    await sendInvitationEmail({
      email: invitation.email,
      organizationName: organization.name,
      inviterName: `${req.user!.firstName} ${req.user!.lastName}`,
      role: invitation.role,
      invitationToken: invitation.token,
    });

    console.log(`[ORGANIZATIONS] Invitation resent to ${invitation.email} for ${id}`);
    res.json({ message: 'Invitation resent successfully' });
  } catch (error) {
    console.error('[ORGANIZATIONS] Resend invitation error:', error);
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
});

// DELETE /api/organizations/:id/invitations/:invitationId - Cancel invitation (admin+)
router.delete('/:id/invitations/:invitationId', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id, invitationId } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.invitation.delete({
      where: {
        id: invitationId,
        organizationId: id,
      },
    });

    console.log(`[ORGANIZATIONS] Invitation ${invitationId} cancelled for ${id}`);
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('[ORGANIZATIONS] Cancel invitation error:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
});

// PATCH /api/organizations/:id/members/:memberId - Update member role/permissions (admin+)
const updateMemberPermissionsSchema = z.object({
  role: z.enum(['admin', 'coach', 'player']).optional(),
  canManageMembers: z.boolean().optional(),
  canManageContent: z.boolean().optional(),
  canManageBilling: z.boolean().optional(),
  canManageSettings: z.boolean().optional(),
});

router.patch('/:id/members/:memberId', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const body = updateMemberPermissionsSchema.parse(req.body);

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = await prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId: id,
      },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Prevent changing owner role
    if (member.role === 'owner') {
      return res.status(403).json({ error: 'Cannot modify organization owner' });
    }

    // Only owner can change roles or grant admin permissions
    if (body.role || body.canManageMembers || body.canManageBilling) {
      if (req.tenant!.organizationRole !== 'owner') {
        return res.status(403).json({ error: 'Only organization owner can change roles or grant admin permissions' });
      }
    }

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: body,
    });

    console.log(`[ORGANIZATIONS] Member ${memberId} updated in ${id}`);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('[ORGANIZATIONS] Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/organizations/:id/members/:memberId - Remove member (admin+)
router.delete('/:id/members/:memberId', requireTenant, requireOrgAdmin, async (req, res) => {
  try {
    const { id, memberId } = req.params;

    if (req.tenant!.organizationId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = await prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId: id,
      },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Prevent removing owner
    if (member.role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove organization owner' });
    }

    // Prevent removing yourself
    if (member.userId === req.user!.id) {
      return res.status(403).json({ error: 'Cannot remove yourself from the organization' });
    }

    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    console.log(`[ORGANIZATIONS] Member ${memberId} removed from ${id}`);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('[ORGANIZATIONS] Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
