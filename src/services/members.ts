import { getAuthToken } from './api';

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'coach' | 'player';
  canManageMembers: boolean;
  canManageContent: boolean;
  canManageBilling: boolean;
  canManageSettings: boolean;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: 'admin' | 'coach' | 'player';
  teamIds: string[];
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  invitedBy: string;
  createdAt: string;
}

export interface InviteMemberData {
  email: string;
  role: 'admin' | 'coach' | 'player';
  teamIds?: string[];
}

export interface UpdateMemberData {
  role?: 'admin' | 'coach' | 'player';
  canManageMembers?: boolean;
  canManageContent?: boolean;
  canManageBilling?: boolean;
  canManageSettings?: boolean;
}

/**
 * Get all members of an organization
 */
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/members`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch members');
  }

  return response.json();
}

/**
 * Get pending invitations for an organization
 */
export async function getOrganizationInvitations(organizationId: string): Promise<Invitation[]> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch invitations');
  }

  return response.json();
}

/**
 * Invite a new member to the organization
 */
export async function inviteMember(
  organizationId: string,
  data: InviteMemberData
): Promise<Invitation> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/members/invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send invitation');
  }

  return response.json();
}

/**
 * Resend an invitation
 */
export async function resendInvitation(
  organizationId: string,
  invitationId: string
): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(
    `/api/organizations/${organizationId}/invitations/${invitationId}/resend`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to resend invitation');
  }
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(
  organizationId: string,
  invitationId: string
): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(
    `/api/organizations/${organizationId}/invitations/${invitationId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel invitation');
  }
}

/**
 * Update a member's role or permissions
 */
export async function updateMember(
  organizationId: string,
  memberId: string,
  data: UpdateMemberData
): Promise<OrganizationMember> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update member');
  }

  return response.json();
}

/**
 * Remove a member from the organization
 * Returns the userId of the removed member
 */
export async function removeMember(
  organizationId: string,
  memberId: string
): Promise<{ userId: string }> {
  const token = getAuthToken();
  const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove member');
  }

  return response.json();
}
