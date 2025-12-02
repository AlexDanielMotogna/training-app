import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAuthToken } from '../services/api';
import { useOrganization } from './OrganizationContext';

// Types matching backend schema
export interface Team {
  id: string;
  name: string;
  ageCategoryId: string;
  ageCategoryCode?: string; // e.g., "U15", "SEN"
  ageCategoryName?: string; // e.g., "Under 15", "Senior"
  isActive: boolean;
}

export interface TeamMembership {
  teamId: string;
  role: 'head_coach' | 'assistant_coach' | 'player';
  positionId?: string;
  jerseyNumber?: number;
}

interface TeamContextValue {
  // All teams the user belongs to
  teams: Team[];
  teamMemberships: TeamMembership[];

  // Currently active team (for filtering content)
  activeTeam: Team | null;
  activeTeamId: string | null;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveTeam: (teamId: string | null) => void;
  refreshTeams: () => Promise<void>;

  // Helpers
  isTeamMember: (teamId: string) => boolean;
  getTeamRole: (teamId: string) => string | null;
  hasMultipleTeams: boolean;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

const ACTIVE_TEAM_STORAGE_KEY = 'teamtrainer_active_team';
const TEAMS_STORAGE_KEY = 'teamtrainer_teams';

export function TeamProvider({ children }: { children: ReactNode }) {
  const { organization, hasOrganization } = useOrganization();

  const [teams, setTeams] = useState<Team[]>(() => {
    const stored = localStorage.getItem(TEAMS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([]);

  const [activeTeamId, setActiveTeamId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_TEAM_STORAGE_KEY);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the active team object
  const activeTeam = activeTeamId
    ? teams.find(t => t.id === activeTeamId) || null
    : null;

  // Save to localStorage
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    } else {
      localStorage.removeItem(TEAMS_STORAGE_KEY);
    }
  }, [teams]);

  useEffect(() => {
    if (activeTeamId) {
      localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, activeTeamId);
    } else {
      localStorage.removeItem(ACTIVE_TEAM_STORAGE_KEY);
    }
  }, [activeTeamId]);

  // Set active team
  const setActiveTeam = useCallback((teamId: string | null) => {
    setActiveTeamId(teamId);
  }, []);

  // Refresh teams from backend
  const refreshTeams = useCallback(async () => {
    if (!hasOrganization || !organization) return;

    const token = getAuthToken();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/organizations/${organization.id}/teams/my-teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }

      const data = await response.json();
      setTeams(data.teams || []);
      setTeamMemberships(data.memberships || []);

      // Set first team as active if none selected
      if (!activeTeamId && data.teams?.length > 0) {
        setActiveTeamId(data.teams[0].id);
      }
    } catch (err) {
      console.error('[TeamContext] Failed to refresh:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [hasOrganization, organization, activeTeamId]);

  // Check if user is member of a team
  const isTeamMember = useCallback((teamId: string): boolean => {
    return teamMemberships.some(m => m.teamId === teamId);
  }, [teamMemberships]);

  // Get user's role in a team
  const getTeamRole = useCallback((teamId: string): string | null => {
    const membership = teamMemberships.find(m => m.teamId === teamId);
    return membership?.role || null;
  }, [teamMemberships]);

  // Clear on logout
  useEffect(() => {
    const handleLogout = () => {
      setTeams([]);
      setTeamMemberships([]);
      setActiveTeamId(null);
    };

    window.addEventListener('user-logout', handleLogout);
    return () => window.removeEventListener('user-logout', handleLogout);
  }, []);

  // Refresh teams when organization changes
  useEffect(() => {
    if (hasOrganization) {
      refreshTeams();
    }
  }, [hasOrganization, refreshTeams]);

  const value: TeamContextValue = {
    teams,
    teamMemberships,
    activeTeam,
    activeTeamId,
    isLoading,
    error,
    setActiveTeam,
    refreshTeams,
    isTeamMember,
    getTeamRole,
    hasMultipleTeams: teams.length > 1,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam(): TeamContextValue {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

// Hook for getting the active team (throws if none)
export function useActiveTeam(): Team {
  const { activeTeam } = useTeam();
  if (!activeTeam) {
    throw new Error('No active team selected');
  }
  return activeTeam;
}

// Hook for checking if user can access a specific team
export function useCanAccessTeam(teamId: string): boolean {
  const { isTeamMember } = useTeam();
  const { permissions } = useOrganization();

  // Admins can access all teams
  if (permissions.isAdmin) return true;

  // Others can only access their teams
  return isTeamMember(teamId);
}
