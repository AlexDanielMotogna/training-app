import { getAuthToken } from './api';

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  ageCategoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ageCategory?: {
    id: string;
    name: string;
    code: string;
    nameTranslations?: { en?: string; de?: string };
  };
  _count?: {
    members: number;
  };
}

export interface CreateTeamData {
  name: string;
  ageCategoryId: string;
  isActive?: boolean;
}

export interface UpdateTeamData {
  name?: string;
  ageCategoryId?: string;
  isActive?: boolean;
}

/**
 * Get all teams for an organization
 */
export async function getTeams(organizationId: string): Promise<Team[]> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/teams`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch teams');
  }

  return response.json();
}

/**
 * Get a single team by ID
 */
export async function getTeam(organizationId: string, teamId: string): Promise<Team> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/teams/${teamId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch team');
  }

  return response.json();
}

/**
 * Create a new team
 */
export async function createTeam(organizationId: string, data: CreateTeamData): Promise<Team> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/teams`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to create team');
  }

  return response.json();
}

/**
 * Update a team
 */
export async function updateTeam(
  organizationId: string,
  teamId: string,
  data: UpdateTeamData
): Promise<Team> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/teams/${teamId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update team');
  }

  return response.json();
}

/**
 * Delete a team
 */
export async function deleteTeam(organizationId: string, teamId: string): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/teams/${teamId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete team');
  }
}

// ========================================
// TEAM MEMBER FUNCTIONS
// ========================================

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'head_coach' | 'assistant_coach' | 'player';
  positionId?: string;
  jerseyNumber?: number;
  isActive: boolean;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  position?: {
    id: string;
    name: string;
    abbreviation: string;
  };
}

export interface AddTeamMemberData {
  userId: string;
  role: 'head_coach' | 'assistant_coach' | 'player';
  positionId?: string;
  jerseyNumber?: number;
}

/**
 * Get all members of a team
 */
export async function getTeamMembers(organizationId: string, teamId: string): Promise<TeamMember[]> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/teams/${teamId}/members`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch team members');
  }

  return response.json();
}

/**
 * Add a member to a team
 */
export async function addTeamMember(
  organizationId: string,
  teamId: string,
  data: AddTeamMemberData
): Promise<TeamMember> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/teams/${teamId}/members`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add team member');
  }

  return response.json();
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(
  organizationId: string,
  teamId: string,
  userId: string
): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove team member');
  }
}
