import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../utils/jwt.js';

// Extend Express Request type with tenant context
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

export interface TenantContext {
  organizationId: string;
  organizationRole: string;
  teamIds: string[];
  activeTeamId?: string;
  permissions: TenantPermissions;
}

export interface TenantPermissions {
  canManageMembers: boolean;
  canManageContent: boolean;
  canManageBilling: boolean;
  canManageSettings: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isCoach: boolean;
}

/**
 * Middleware to extract tenant context from authenticated user
 * Must be used AFTER authenticate middleware
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  const user = req.user as JWTPayload;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!user.organizationId) {
    return res.status(403).json({
      error: 'Organization membership required',
      code: 'NO_ORGANIZATION',
      message: 'You must be a member of an organization to access this resource'
    });
  }

  // Build permissions based on organization role
  const orgRole = user.organizationRole || 'player';
  const permissions: TenantPermissions = {
    isOwner: orgRole === 'owner',
    isAdmin: orgRole === 'owner' || orgRole === 'admin',
    isCoach: orgRole === 'owner' || orgRole === 'admin' || orgRole === 'coach',
    canManageMembers: orgRole === 'owner' || orgRole === 'admin',
    canManageContent: orgRole === 'owner' || orgRole === 'admin' || orgRole === 'coach',
    canManageBilling: orgRole === 'owner',
    canManageSettings: orgRole === 'owner' || orgRole === 'admin',
  };

  // Set tenant context on request
  req.tenant = {
    organizationId: user.organizationId,
    organizationRole: orgRole,
    teamIds: user.teamIds || [],
    activeTeamId: user.activeTeamId,
    permissions,
  };

  console.log(`[TENANT] Context set for user ${user.email}: org=${user.organizationId}, role=${orgRole}`);
  next();
}

/**
 * Middleware to require coach role within the organization
 */
export function requireOrgCoach(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant?.permissions.isCoach) {
    return res.status(403).json({
      error: 'Coach access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
}

/**
 * Middleware to require admin role within the organization
 */
export function requireOrgAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant?.permissions.isAdmin) {
    return res.status(403).json({
      error: 'Admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
}

/**
 * Middleware to require owner role within the organization
 */
export function requireOrgOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.tenant?.permissions.isOwner) {
    return res.status(403).json({
      error: 'Owner access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
}

/**
 * Middleware for optional tenant context
 * Sets tenant if available but doesn't require it
 * Useful for routes that work with or without organization context
 */
export function optionalTenant(req: Request, res: Response, next: NextFunction) {
  const user = req.user as JWTPayload;

  if (user?.organizationId) {
    const orgRole = user.organizationRole || 'player';
    req.tenant = {
      organizationId: user.organizationId,
      organizationRole: orgRole,
      teamIds: user.teamIds || [],
      activeTeamId: user.activeTeamId,
      permissions: {
        isOwner: orgRole === 'owner',
        isAdmin: orgRole === 'owner' || orgRole === 'admin',
        isCoach: orgRole === 'owner' || orgRole === 'admin' || orgRole === 'coach',
        canManageMembers: orgRole === 'owner' || orgRole === 'admin',
        canManageContent: orgRole === 'owner' || orgRole === 'admin' || orgRole === 'coach',
        canManageBilling: orgRole === 'owner',
        canManageSettings: orgRole === 'owner' || orgRole === 'admin',
      },
    };
  }

  next();
}

/**
 * Helper to check if user can access a specific team
 */
export function canAccessTeam(req: Request, teamId: string): boolean {
  if (!req.tenant) return false;

  // Admins/Owners can access all teams in their org
  if (req.tenant.permissions.isAdmin) return true;

  // Others can only access teams they belong to
  return req.tenant.teamIds.includes(teamId);
}

/**
 * Helper to get the team filter for queries
 * Returns teamIds the user can access based on their role
 */
export function getTeamFilter(req: Request): { teamId?: string | { in: string[] } } | null {
  if (!req.tenant) return null;

  // Admins see all teams (no filter)
  if (req.tenant.permissions.isAdmin) {
    return {};
  }

  // Others see only their teams
  if (req.tenant.teamIds.length === 0) {
    // User has no team - should see nothing team-specific
    return { teamId: '__NONE__' };
  }

  if (req.tenant.teamIds.length === 1) {
    return { teamId: req.tenant.teamIds[0] };
  }

  return { teamId: { in: req.tenant.teamIds } };
}

/**
 * Helper to build org+team scoped query filter
 * Implements the hybrid visibility system (Option C)
 */
export function buildScopedFilter(req: Request, options?: {
  includeShared?: boolean;
  teamField?: string;
}): Record<string, unknown> {
  const { includeShared = true, teamField = 'teamId' } = options || {};

  if (!req.tenant) {
    throw new Error('Tenant context required');
  }

  const filter: Record<string, unknown> = {
    organizationId: req.tenant.organizationId,
  };

  // Admins see everything in their org
  if (req.tenant.permissions.isAdmin) {
    return filter;
  }

  // For non-admins, apply team filter with hybrid visibility
  if (includeShared) {
    // See shared content (teamId = null) + their team's content
    if (req.tenant.teamIds.length > 0) {
      filter.OR = [
        { [teamField]: null }, // Shared with whole org
        { [teamField]: { in: req.tenant.teamIds } }, // Their team(s)
      ];
    } else {
      // No team assigned - only see shared content
      filter[teamField] = null;
    }
  } else {
    // Only their team's content
    if (req.tenant.teamIds.length > 0) {
      filter[teamField] = { in: req.tenant.teamIds };
    } else {
      filter[teamField] = '__NONE__';
    }
  }

  return filter;
}
