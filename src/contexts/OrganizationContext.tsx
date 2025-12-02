import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAuthToken } from '../services/api';

// Types matching backend schema
export interface Organization {
  id: string;
  name: string;
  slug: string;
  sportId: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  role: 'owner' | 'admin' | 'coach' | 'player';
}

export interface OrganizationPermissions {
  isOwner: boolean;
  isAdmin: boolean;
  isCoach: boolean;
  canManageMembers: boolean;
  canManageContent: boolean;
  canManageBilling: boolean;
  canManageSettings: boolean;
}

interface OrganizationContextValue {
  organization: Organization | null;
  permissions: OrganizationPermissions;
  isLoading: boolean;
  error: string | null;
  setOrganization: (org: Organization | null) => void;
  refreshOrganization: () => Promise<void>;
  hasOrganization: boolean;
}

const defaultPermissions: OrganizationPermissions = {
  isOwner: false,
  isAdmin: false,
  isCoach: false,
  canManageMembers: false,
  canManageContent: false,
  canManageBilling: false,
  canManageSettings: false,
};

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

const ORGANIZATION_STORAGE_KEY = 'teamtrainer_organization';

function calculatePermissions(role: string): OrganizationPermissions {
  return {
    isOwner: role === 'owner',
    isAdmin: role === 'owner' || role === 'admin',
    isCoach: role === 'owner' || role === 'admin' || role === 'coach',
    canManageMembers: role === 'owner' || role === 'admin',
    canManageContent: role === 'owner' || role === 'admin' || role === 'coach',
    canManageBilling: role === 'owner',
    canManageSettings: role === 'owner' || role === 'admin',
  };
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganizationState] = useState<Organization | null>(() => {
    // Load from localStorage on initial render
    const stored = localStorage.getItem(ORGANIZATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate permissions based on role
  const permissions = organization
    ? calculatePermissions(organization.role)
    : defaultPermissions;

  // Save to localStorage whenever organization changes
  useEffect(() => {
    if (organization) {
      localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(organization));
    } else {
      localStorage.removeItem(ORGANIZATION_STORAGE_KEY);
    }
  }, [organization]);

  // Set organization (called after login)
  const setOrganization = useCallback((org: Organization | null) => {
    setOrganizationState(org);
    setError(null);
  }, []);

  // Refresh organization from backend
  const refreshOrganization = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !organization?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/organizations/${organization.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organization');
      }

      const data = await response.json();
      setOrganizationState({
        ...data,
        role: organization.role, // Keep the role from JWT
      });
    } catch (err) {
      console.error('[OrganizationContext] Failed to refresh:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id, organization?.role]);

  // Clear organization on logout
  useEffect(() => {
    const handleLogout = () => {
      setOrganizationState(null);
    };

    window.addEventListener('user-logout', handleLogout);
    return () => window.removeEventListener('user-logout', handleLogout);
  }, []);

  const value: OrganizationContextValue = {
    organization,
    permissions,
    isLoading,
    error,
    setOrganization,
    refreshOrganization,
    hasOrganization: !!organization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

// Hook for checking specific permissions
export function useOrgPermission(permission: keyof OrganizationPermissions): boolean {
  const { permissions } = useOrganization();
  return permissions[permission];
}

// Hook for requiring organization membership
export function useRequireOrganization(): Organization {
  const { organization, hasOrganization } = useOrganization();
  if (!hasOrganization || !organization) {
    throw new Error('Organization membership required');
  }
  return organization;
}
