import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Avatar,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BusinessIcon from '@mui/icons-material/Business';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import InfoIcon from '@mui/icons-material/Info';
import SportsIcon from '@mui/icons-material/Sports';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import GroupsIcon from '@mui/icons-material/Groups';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useOrganization, useOrgPermission } from '../contexts/OrganizationContext';
import { useI18n } from '../i18n/I18nProvider';
import { toastService } from '../services/toast';
import { getAuthToken, clearAuthToken } from '../services/api';
import { getCurrentUser } from '../services/userProfile';
import {
  getOrganizationMembers,
  getOrganizationInvitations,
  inviteMember,
  resendInvitation,
  cancelInvitation,
  removeMember,
  type OrganizationMember,
  type Invitation,
} from '../services/members';
import { useOrganizationSSE } from '../hooks/useOrganizationSSE';
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  type Team,
  type TeamMember,
} from '../services/teams';

const DEFAULT_LOGO = '/teamtraining-logo.svg';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Tab name mapping
const TAB_NAMES = ['general', 'branding', 'logo', 'members', 'teams'] as const;
type TabName = typeof TAB_NAMES[number];

const getTabIndex = (tabName: string | null): number => {
  if (!tabName) return 0;
  const index = TAB_NAMES.indexOf(tabName as TabName);
  return index >= 0 ? index : 0;
};

const getTabName = (index: number): TabName => {
  return TAB_NAMES[index] || 'general';
};

export const OrganizationSettings: React.FC = () => {
  const { t, locale } = useI18n();
  const { organization, refreshOrganization, hasOrganization, isLoading: isLoadingOrg } = useOrganization();
  const canManageSettings = useOrgPermission('canManageSettings');
  const [searchParams, setSearchParams] = useSearchParams();

  // Debug: Log organization data
  useEffect(() => {
    console.log('[OrganizationSettings] Organization data:', organization);
    console.log('[OrganizationSettings] Sport data:', (organization as any)?.sport);
  }, [organization]);

  // Initialize activeTab from URL query param
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return getTabIndex(tabParam);
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sync activeTab with URL changes (browser back/forward buttons)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const newTabIndex = getTabIndex(tabParam);
    setActiveTab(newTabIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Form state
  const [orgName, setOrgName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#203731');
  const [secondaryColor, setSecondaryColor] = useState('#FFB612');
  const [logoUrl, setLogoUrl] = useState('');
  const [previewLogo, setPreviewLogo] = useState(DEFAULT_LOGO);
  const [seasonPhase, setSeasonPhase] = useState<'off-season' | 'pre-season' | 'in-season' | 'post-season'>('off-season');

  // Members state
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'coach' | 'player'>('player');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Teams state
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamAgeCategoryId, setTeamAgeCategoryId] = useState('');
  const [teamIsActive, setTeamIsActive] = useState(true);
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  // Team members state
  const [teamMembersModalOpen, setTeamMembersModalOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<string>('');
  const [memberRole, setMemberRole] = useState<'head_coach' | 'assistant_coach' | 'player'>('player');
  const [memberPositionId, setMemberPositionId] = useState<string>('');
  const [memberJerseyNumber, setMemberJerseyNumber] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Refresh organization data on mount to get full data including sport
  useEffect(() => {
    if (hasOrganization) {
      refreshOrganization();
    }
  }, [hasOrganization]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load organization data
  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || '');
      setPrimaryColor(organization.primaryColor || '#203731');
      setSecondaryColor(organization.secondaryColor || '#FFB612');
      setLogoUrl(organization.logoUrl || '');
      setPreviewLogo(organization.logoUrl || DEFAULT_LOGO);
      setSeasonPhase((organization as any).seasonPhase || 'off-season');
    }
  }, [organization]);

  // Update preview when URL changes
  useEffect(() => {
    setPreviewLogo(logoUrl || DEFAULT_LOGO);
  }, [logoUrl]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Update URL query param to persist tab selection
    const tabName = getTabName(newValue);
    setSearchParams({ tab: tabName });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !organization) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastService.error(t('orgSettings.errors.invalidImageType'));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toastService.error(t('orgSettings.errors.imageTooLarge'));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = getAuthToken();
      const response = await fetch(`/api/organizations/${organization.id}/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      setLogoUrl(data.logoUrl);
      setPreviewLogo(data.logoUrl);
      toastService.success(t('orgSettings.logoUploaded'));
    } catch (error) {
      console.error('Logo upload failed:', error);
      toastService.error(t('orgSettings.errors.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!organization) return;

    setIsSaving(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orgName,
          primaryColor,
          secondaryColor,
          logoUrl: logoUrl || null, // Convert empty string to null
          seasonPhase,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update organization');
      }

      await refreshOrganization();
      toastService.success(t('orgSettings.saved'));

      // Theme changes will be applied automatically via OrganizationContext
    } catch (error) {
      console.error('Save failed:', error);
      toastService.error(t('orgSettings.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (organization) {
      setOrgName(organization.name || '');
      setPrimaryColor(organization.primaryColor || '#203731');
      setSecondaryColor(organization.secondaryColor || '#FFB612');
      setLogoUrl(organization.logoUrl || '');
      setPreviewLogo(organization.logoUrl || '');
      setSeasonPhase((organization as any).seasonPhase || 'off-season');
    }
  };

  // Store organization ID in a ref to avoid stale closures
  const organizationIdRef = useRef<string | undefined>(organization?.id);
  useEffect(() => {
    organizationIdRef.current = organization?.id;
  }, [organization?.id]);

  const loadMembersAndInvitations = useCallback(async (showLoading = true) => {
    const orgId = organizationIdRef.current;
    if (!orgId) {
      console.log('[MEMBERS] No organization ID available, skipping load');
      return;
    }

    console.log('[MEMBERS] Loading members for org:', orgId);
    if (showLoading) setIsLoadingMembers(true);
    try {
      const [membersData, invitationsData] = await Promise.all([
        getOrganizationMembers(orgId),
        getOrganizationInvitations(orgId),
      ]);
      console.log('[MEMBERS] Loaded members:', membersData.length);
      console.log('[MEMBERS] Loaded invitations:', invitationsData.length);
      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('[MEMBERS] Failed to load members:', error);
      toastService.error('Failed to load members');
    } finally {
      if (showLoading) setIsLoadingMembers(false);
    }
  }, []); // No dependencies - uses ref for organization ID

  // Load members and invitations when Members tab is active
  useEffect(() => {
    if (activeTab === 3 && organization?.id) {
      console.log('[MEMBERS] Tab active, triggering load for org:', organization.id);
      loadMembersAndInvitations();
    }
  }, [activeTab, organization?.id, loadMembersAndInvitations]);

  // Callback for SSE events
  const handleSSEEvent = useCallback((event: any) => {
    if (event.event === 'invitation:accepted') {
      console.log('[SSE] Invitation accepted, refreshing members list');
      toastService.success('New member joined the organization!');
      loadMembersAndInvitations();
    }
  }, [loadMembersAndInvitations]);

  // SSE for real-time updates when invitations are accepted
  useOrganizationSSE(organization?.id, handleSSEEvent);

  const loadTeams = useCallback(async (showLoading = true) => {
    const orgId = organizationIdRef.current;
    if (!orgId) {
      console.log('[TEAMS] No organization ID available, skipping load');
      return;
    }

    console.log('[TEAMS] Loading teams for org:', orgId);
    if (showLoading) setIsLoadingTeams(true);
    try {
      const teamsData = await getTeams(orgId);
      console.log('[TEAMS] Loaded teams:', teamsData.map(team => ({ name: team.name, members: team._count?.members })));
      setTeams(teamsData);
    } catch (error) {
      console.error('[TEAMS] Failed to load teams:', error);
      toastService.error(t('orgSettings.teams.errors.loadFailed'));
    } finally {
      if (showLoading) setIsLoadingTeams(false);
    }
  }, [t]); // Only t as dependency - uses ref for organization ID

  // Load teams when Teams tab is active
  useEffect(() => {
    if (activeTab === 4 && organization?.id) {
      console.log('[TEAMS] Tab active, triggering load for org:', organization.id);
      loadTeams();
    }
  }, [activeTab, organization?.id, loadTeams]);

  const handleOpenTeamModal = (team?: Team) => {
    if (team) {
      // Edit mode
      setEditingTeam(team);
      setTeamName(team.name);
      setTeamAgeCategoryId(team.ageCategoryId);
      setTeamIsActive(team.isActive);
    } else {
      // Create mode
      setEditingTeam(null);
      setTeamName('');
      setTeamAgeCategoryId('');
      setTeamIsActive(true);
    }
    setTeamModalOpen(true);
  };

  const handleCloseTeamModal = () => {
    setTeamModalOpen(false);
    setEditingTeam(null);
    setTeamName('');
    setTeamAgeCategoryId('');
    setTeamIsActive(true);
  };

  const handleSaveTeam = async () => {
    const orgId = organizationIdRef.current;
    if (!orgId || !teamName || !teamAgeCategoryId) {
      toastService.error(t('orgSettings.teams.errors.fieldsRequired'));
      return;
    }

    setIsSavingTeam(true);
    try {
      if (editingTeam) {
        // Update existing team
        await updateTeam(orgId, editingTeam.id, {
          name: teamName,
          ageCategoryId: teamAgeCategoryId,
          isActive: teamIsActive,
        });
        toastService.success(t('orgSettings.teams.updated'));
      } else {
        // Create new team
        await createTeam(orgId, {
          name: teamName,
          ageCategoryId: teamAgeCategoryId,
          isActive: teamIsActive,
        });
        toastService.success(t('orgSettings.teams.created'));
      }

      handleCloseTeamModal();
      await loadTeams();
    } catch (error: any) {
      console.error('[TEAMS] Failed to save team:', error);
      if (error.message.includes('limit')) {
        toastService.error(t('orgSettings.teams.errors.limitReached'));
      } else {
        toastService.error(t('orgSettings.teams.errors.saveFailed'));
      }
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    const orgId = organizationIdRef.current;
    if (!orgId) return;

    if (!window.confirm(t('orgSettings.teams.confirmDelete', { name: team.name }))) {
      return;
    }

    try {
      await deleteTeam(orgId, team.id);
      toastService.success(t('orgSettings.teams.deleted'));
      await loadTeams();
    } catch (error: any) {
      console.error('[TEAMS] Failed to delete team:', error);
      if (error.message.includes('members')) {
        toastService.error(t('orgSettings.teams.errors.hasMembers'));
      } else {
        toastService.error(t('orgSettings.teams.errors.deleteFailed'));
      }
    }
  };

  const getAgeCategoryDisplayName = (category: any): string => {
    return category?.nameTranslations?.[locale as 'en' | 'de'] || category?.name || '';
  };

  // Team Members handlers
  const handleOpenTeamMembersModal = async (team: Team) => {
    setSelectedTeamForMembers(team);
    setTeamMembersModalOpen(true);
    setSelectedMemberToAdd('');
    setMemberRole('player');
    setMemberPositionId('');
    setMemberJerseyNumber('');

    // Load organization members (for the "Add Member" dropdown) and team members in parallel
    console.log('[TEAM_MEMBERS] Opening modal, loading org members and team members');
    await Promise.all([
      loadMembersAndInvitations(false), // Load org members without showing loading spinner
      loadTeamMembers(team.id),
    ]);
  };

  const handleCloseTeamMembersModal = () => {
    setTeamMembersModalOpen(false);
    setSelectedTeamForMembers(null);
    setTeamMembers([]);
    setSelectedMemberToAdd('');
    setMemberRole('player');
    setMemberPositionId('');
    setMemberJerseyNumber('');
  };

  const loadTeamMembers = async (teamId: string) => {
    const orgId = organizationIdRef.current;
    if (!orgId) {
      console.log('[TEAM_MEMBERS] No organization ID available, skipping load');
      return;
    }

    console.log('[TEAM_MEMBERS] Loading members for team:', teamId);
    setIsLoadingTeamMembers(true);
    try {
      const membersData = await getTeamMembers(orgId, teamId);
      console.log('[TEAM_MEMBERS] Loaded:', membersData.length, 'members');
      setTeamMembers(membersData);
    } catch (error) {
      console.error('[TEAM_MEMBERS] Failed to load team members:', error);
      toastService.error(t('orgSettings.teamMembers.errors.loadFailed'));
    } finally {
      setIsLoadingTeamMembers(false);
    }
  };

  const handleAddTeamMember = async () => {
    const orgId = organizationIdRef.current;
    if (!orgId || !selectedTeamForMembers || !selectedMemberToAdd) return;

    setIsAddingMember(true);
    try {
      await addTeamMember(orgId, selectedTeamForMembers.id, {
        userId: selectedMemberToAdd,
        role: memberRole,
        positionId: memberPositionId || undefined,
        jerseyNumber: memberJerseyNumber ? parseInt(memberJerseyNumber, 10) : undefined,
      });

      toastService.success(t('orgSettings.teamMembers.memberAdded'));
      setSelectedMemberToAdd('');
      setMemberRole('player');
      setMemberPositionId('');
      setMemberJerseyNumber('');
      await loadTeamMembers(selectedTeamForMembers.id);
      await loadTeams(false); // Refresh teams to update member count (no loading spinner)
    } catch (error: any) {
      console.error('[TEAM_MEMBERS] Failed to add team member:', error);
      if (error.message.includes('already a member')) {
        toastService.error(t('orgSettings.teamMembers.errors.alreadyMember'));
      } else {
        toastService.error(t('orgSettings.teamMembers.errors.addFailed'));
      }
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    const orgId = organizationIdRef.current;
    if (!orgId || !selectedTeamForMembers) return;

    if (!window.confirm(t('orgSettings.teamMembers.confirmRemove'))) {
      return;
    }

    try {
      await removeTeamMember(orgId, selectedTeamForMembers.id, userId);
      toastService.success(t('orgSettings.teamMembers.memberRemoved'));
      await loadTeamMembers(selectedTeamForMembers.id);
      await loadTeams(false); // Refresh teams to update member count (no loading spinner)
    } catch (error) {
      console.error('[TEAM_MEMBERS] Failed to remove team member:', error);
      toastService.error(t('orgSettings.teamMembers.errors.removeFailed'));
    }
  };

  // Get available org members that are not already in the team
  const availableMembersToAdd = members.filter(
    (member) => !teamMembers.some((tm) => tm.userId === member.user.id)
  );

  const formatTeamMemberRole = (role: string) => {
    return t(`orgSettings.teamMembers.roles.${role}`);
  };

  const handleSendInvite = async () => {
    const orgId = organizationIdRef.current;
    if (!orgId || !inviteEmail || !inviteRole) {
      toastService.error(t('orgSettings.invite.errors.emailRequired'));
      return;
    }

    setIsSendingInvite(true);
    try {
      await inviteMember(orgId, {
        email: inviteEmail,
        role: inviteRole,
      });

      toastService.success(t('orgSettings.invite.sent'));
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('player');

      // Reload invitations
      await loadMembersAndInvitations();
    } catch (error: any) {
      console.error('[INVITE] Failed to send invite:', error);
      if (error.message.includes('already a member')) {
        toastService.error(t('orgSettings.invite.errors.alreadyMember'));
      } else if (error.message.includes('already been sent')) {
        toastService.error(t('orgSettings.invite.errors.alreadyInvited'));
      } else {
        toastService.error(t('orgSettings.invite.errors.failed'));
      }
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    const orgId = organizationIdRef.current;
    if (!orgId) return;

    try {
      await resendInvitation(orgId, invitationId);
      toastService.success(t('orgSettings.invitations.resent'));
    } catch (error: any) {
      console.error('[INVITE] Failed to resend invitation:', error);

      // If invitation not found, it was likely already accepted - refresh the list
      if (error.message?.includes('Invitation not found')) {
        toastService.error('This invitation has already been accepted or expired');
        // Refresh the lists to remove stale data
        loadMembersAndInvitations();
      } else {
        toastService.error('Failed to resend invitation');
      }
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const orgId = organizationIdRef.current;
    if (!orgId) return;

    try {
      await cancelInvitation(orgId, invitationId);
      toastService.success(t('orgSettings.invitations.cancelled'));
      await loadMembersAndInvitations();
    } catch (error: any) {
      console.error('[INVITE] Failed to cancel invitation:', error);

      // If invitation not found, it was likely already accepted - refresh the list
      if (error.message?.includes('Invitation not found')) {
        toastService.error('This invitation has already been accepted or deleted');
        loadMembersAndInvitations();
      } else {
        toastService.error('Failed to cancel invitation');
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const orgId = organizationIdRef.current;
    if (!orgId) return;

    if (!window.confirm(t('orgSettings.members.confirmRemove'))) {
      return;
    }

    try {
      const result = await removeMember(orgId, memberId);
      toastService.success(t('orgSettings.members.removed'));

      // Check if the removed user is the current user
      const currentUser = getCurrentUser();
      console.log('[MEMBERS] Checking if current user was removed');
      console.log('[MEMBERS] Current user:', currentUser);
      console.log('[MEMBERS] Removed userId:', result.userId);
      console.log('[MEMBERS] Match:', currentUser?.id === result.userId);

      if (currentUser && result.userId === currentUser.id) {
        // User removed themselves or was removed - log them out
        console.log('[MEMBERS] Current user was removed from organization - logging out');
        toastService.info('You have been removed from the organization. Logging out...');

        // Wait a moment for the toast to show
        setTimeout(() => {
          clearAuthToken();
          window.location.href = '/auth';
        }, 2000);
      } else {
        // Reload members list if it wasn't current user
        console.log('[MEMBERS] Different user was removed, reloading members list');
        await loadMembersAndInvitations();
      }
    } catch (error) {
      console.error('[MEMBERS] Failed to remove member:', error);
      toastService.error('Failed to remove member');
    }
  };

  const formatRole = (role: string) => {
    return t(`orgSettings.members.roles.${role}`);
  };

  if (!hasOrganization) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          {t('orgSettings.noOrganization')}
        </Alert>
      </Container>
    );
  }

  if (!canManageSettings) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {t('orgSettings.noPermission')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('orgSettings.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('orgSettings.subtitle')}
        </Typography>
      </Box>

      {/* Organization Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={previewLogo}
              sx={{
                width: 64,
                height: 64,
                bgcolor: primaryColor,
              }}
            >
              {!previewLogo && <BusinessIcon sx={{ fontSize: 32 }} />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {organization?.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  label={organization?.plan?.toUpperCase() || 'FREE'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={organization?.slug}
                  size="small"
                  variant="outlined"
                />
                {organization?.sport?.name && (
                  <Chip
                    label={organization.sport.name}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label={t('orgSettings.tabs.general')}
          />
          <Tab
            icon={<PaletteIcon />}
            iconPosition="start"
            label={t('orgSettings.tabs.branding')}
          />
          <Tab
            icon={<ImageIcon />}
            iconPosition="start"
            label={t('orgSettings.tabs.logo')}
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label={t('orgSettings.tabs.members')}
          />
          <Tab
            icon={<GroupsIcon />}
            iconPosition="start"
            label={t('orgSettings.tabs.teams')}
          />
        </Tabs>

        {/* General Settings Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('orgSettings.organizationName')}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  helperText={t('orgSettings.organizationNameHint')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('orgSettings.slug')}
                  value={organization?.slug || ''}
                  disabled
                  helperText={t('orgSettings.slugHint')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sport"
                  value={(organization as any)?.sport?.name || 'Not selected'}
                  disabled
                  helperText="Sport selected during signup (cannot be changed)"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Season Phase"
                  value={seasonPhase}
                  onChange={(e) => setSeasonPhase(e.target.value as any)}
                  helperText="Current training season phase"
                  SelectProps={{ native: true }}
                >
                  <option value="off-season">Off-Season</option>
                  <option value="pre-season">Pre-Season</option>
                  <option value="in-season">In-Season</option>
                  <option value="post-season">Post-Season</option>
                </TextField>
              </Grid>

              {/* Age Categories */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Age Categories
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Available age categories for {(organization as any)?.sport?.name || 'your sport'}
                </Typography>
                {isLoadingOrg ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">Loading...</Typography>
                  </Box>
                ) : (organization as any)?.sport?.ageCategories && (organization as any).sport.ageCategories.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(organization as any).sport.ageCategories.map((category: any) => {
                      const displayName = category.nameTranslations?.[locale as 'en' | 'de'] || category.name;
                      return (
                        <Chip
                          key={category.id}
                          label={`${displayName} (${category.code})`}
                          color="default"
                          variant="outlined"
                          size="small"
                        />
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No age categories available
                  </Typography>
                )}
              </Grid>

              {/* Teams */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Teams
                </Typography>
                {(organization as any)?.teams && (organization as any).teams.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(organization as any).teams.map((team: any) => (
                      <Chip
                        key={team.id}
                        icon={<SportsIcon />}
                        label={`${team.name} (${team.ageCategory?.name || 'No category'})`}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No teams created yet
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2">
                    {t('orgSettings.generalInfo')}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Branding Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('orgSettings.themeColors')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    {t('orgSettings.primaryColor')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{
                        width: 60,
                        height: 40,
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      size="small"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      sx={{ width: 120 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('orgSettings.primaryColorHint')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    {t('orgSettings.secondaryColor')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{
                        width: 60,
                        height: 40,
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      size="small"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      sx={{ width: 120 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('orgSettings.secondaryColorHint')}
                  </Typography>
                </Box>
              </Grid>

              {/* Color Preview */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('orgSettings.colorPreview')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: primaryColor } }}
                  >
                    {t('orgSettings.previewPrimary')}
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: secondaryColor, '&:hover': { bgcolor: secondaryColor } }}
                  >
                    {t('orgSettings.previewSecondary')}
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    {t('orgSettings.previewOutlined')}
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="warning">
                  {t('orgSettings.colorChangeNote')}
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Logo Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('orgSettings.uploadLogo')}
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {t('orgSettings.logoRequirements')}
                  </Typography>
                </Alert>

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <Button
                  variant="outlined"
                  startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploading}
                  sx={{ mb: 2 }}
                >
                  {isUploading ? t('orgSettings.uploading') : t('orgSettings.selectFile')}
                </Button>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  {t('orgSettings.orEnterUrl')}
                </Typography>
                <TextField
                  fullWidth
                  label={t('orgSettings.logoUrl')}
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  helperText={t('orgSettings.logoUrlHint')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('orgSettings.logoPreview')}
                </Typography>
                <Card
                  variant="outlined"
                  sx={{
                    p: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                    bgcolor: 'grey.50',
                  }}
                >
                  {previewLogo ? (
                    <Avatar
                      src={previewLogo}
                      alt="Logo Preview"
                      sx={{ width: 150, height: 150 }}
                      variant="square"
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <ImageIcon sx={{ fontSize: 64, mb: 1 }} />
                      <Typography variant="body2">
                        {t('orgSettings.noLogoSelected')}
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Members Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ px: 3 }}>
            {isLoadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Members Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{t('orgSettings.members.title')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('orgSettings.members.subtitle')}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => setInviteModalOpen(true)}
                    >
                      {t('orgSettings.members.inviteButton')}
                    </Button>
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('orgSettings.members.name')}</TableCell>
                          <TableCell>{t('orgSettings.members.email')}</TableCell>
                          <TableCell>{t('orgSettings.members.role')}</TableCell>
                          <TableCell>{t('orgSettings.members.joinedAt')}</TableCell>
                          <TableCell align="right">{t('orgSettings.members.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {members.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              {t('orgSettings.members.noMembers')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar
                                    src={member.user.avatarUrl}
                                    sx={{ width: 32, height: 32 }}
                                  >
                                    {member.user.name.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {member.user.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{member.user.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={formatRole(member.role)}
                                  size="small"
                                  color={member.role === 'owner' ? 'primary' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell align="right">
                                {member.role !== 'owner' && (
                                  <Tooltip title={t('orgSettings.members.remove')}>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveMember(member.id)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Pending Invitations Section */}
                {invitations.length > 0 && (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6">{t('orgSettings.invitations.title')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('orgSettings.invitations.subtitle')}
                      </Typography>
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('orgSettings.invitations.email')}</TableCell>
                            <TableCell>{t('orgSettings.invitations.role')}</TableCell>
                            <TableCell>{t('orgSettings.invitations.expires')}</TableCell>
                            <TableCell align="right">{t('orgSettings.invitations.actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {invitations.map((invitation) => (
                            <TableRow key={invitation.id}>
                              <TableCell>{invitation.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={formatRole(invitation.role)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(invitation.expiresAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title={t('orgSettings.invitations.resend')}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleResendInvitation(invitation.id)}
                                  >
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('orgSettings.invitations.cancel')}>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleCancelInvitation(invitation.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </>
            )}
          </Box>
        </TabPanel>

        {/* Teams Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ px: 3 }}>
            {isLoadingTeams ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Teams Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6">{t('orgSettings.teams.title')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orgSettings.teams.subtitle')}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenTeamModal()}
                  >
                    {t('orgSettings.teams.addButton')}
                  </Button>
                </Box>

                {/* Teams Table */}
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('orgSettings.teams.name')}</TableCell>
                        <TableCell>{t('orgSettings.teams.ageCategory')}</TableCell>
                        <TableCell>{t('orgSettings.teams.members')}</TableCell>
                        <TableCell>{t('orgSettings.teams.status')}</TableCell>
                        <TableCell align="right">{t('orgSettings.teams.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            {t('orgSettings.teams.noTeams')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        teams.map((team) => (
                          <TableRow key={team.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <GroupsIcon color="primary" />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {team.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={team.ageCategory ? `${getAgeCategoryDisplayName(team.ageCategory)} (${team.ageCategory.code})` : '-'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {team._count?.members || 0}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={team.isActive ? t('orgSettings.teams.active') : t('orgSettings.teams.inactive')}
                                size="small"
                                color={team.isActive ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title={t('orgSettings.teamMembers.manageMembers')}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenTeamMembersModal(team)}
                                >
                                  <ManageAccountsIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('orgSettings.teams.edit')}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenTeamModal(team)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('orgSettings.teams.delete')}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteTeam(team)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Team Limits Info */}
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    {t('orgSettings.teams.limitInfo', {
                      current: teams.length,
                      limit: organization?.plan === 'enterprise' ? 'unlimited' :
                             organization?.plan === 'pro' ? '20' :
                             organization?.plan === 'starter' ? '5' : '2'
                    })}
                  </Typography>
                </Alert>
              </>
            )}
          </Box>
        </TabPanel>

        {/* Action Buttons */}
        <Divider />
        <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={isSaving}
          >
            {t('orgSettings.reset')}
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('orgSettings.saving') : t('orgSettings.save')}
          </Button>
        </Box>
      </Card>

      {/* Invite Member Modal */}
      <Dialog
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('orgSettings.invite.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label={t('orgSettings.invite.email')}
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t('orgSettings.invite.emailPlaceholder')}
              disabled={isSendingInvite}
            />

            <FormControl fullWidth disabled={isSendingInvite}>
              <InputLabel>{t('orgSettings.invite.role')}</InputLabel>
              <Select
                value={inviteRole}
                label={t('orgSettings.invite.role')}
                onChange={(e) => setInviteRole(e.target.value as any)}
              >
                <MenuItem value="player">{formatRole('player')}</MenuItem>
                <MenuItem value="coach">{formatRole('coach')}</MenuItem>
                <MenuItem value="admin">{formatRole('admin')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setInviteModalOpen(false);
              setInviteEmail('');
              setInviteRole('player');
            }}
            disabled={isSendingInvite}
          >
            {t('orgSettings.invite.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSendInvite}
            disabled={isSendingInvite || !inviteEmail}
            startIcon={isSendingInvite ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {isSendingInvite ? t('orgSettings.invite.sending') : t('orgSettings.invite.send')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Team Modal */}
      <Dialog
        open={teamModalOpen}
        onClose={handleCloseTeamModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTeam ? t('orgSettings.teams.editTitle') : t('orgSettings.teams.createTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label={t('orgSettings.teams.teamName')}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={t('orgSettings.teams.teamNamePlaceholder')}
              disabled={isSavingTeam}
            />

            <FormControl fullWidth disabled={isSavingTeam}>
              <InputLabel>{t('orgSettings.teams.ageCategory')}</InputLabel>
              <Select
                value={teamAgeCategoryId}
                label={t('orgSettings.teams.ageCategory')}
                onChange={(e) => setTeamAgeCategoryId(e.target.value)}
              >
                {(organization as any)?.sport?.ageCategories?.map((category: any) => (
                  <MenuItem key={category.id} value={category.id}>
                    {getAgeCategoryDisplayName(category)} ({category.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={isSavingTeam}>
              <InputLabel>{t('orgSettings.teams.status')}</InputLabel>
              <Select
                value={teamIsActive ? 'active' : 'inactive'}
                label={t('orgSettings.teams.status')}
                onChange={(e) => setTeamIsActive(e.target.value === 'active')}
              >
                <MenuItem value="active">{t('orgSettings.teams.active')}</MenuItem>
                <MenuItem value="inactive">{t('orgSettings.teams.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseTeamModal}
            disabled={isSavingTeam}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTeam}
            disabled={isSavingTeam || !teamName || !teamAgeCategoryId}
            startIcon={isSavingTeam ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isSavingTeam ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team Members Modal */}
      <Dialog
        open={teamMembersModalOpen}
        onClose={handleCloseTeamMembersModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ManageAccountsIcon color="primary" />
            {t('orgSettings.teamMembers.title', { teamName: selectedTeamForMembers?.name || '' })}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {isLoadingTeamMembers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Add Member Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  {t('orgSettings.teamMembers.addMember')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 250 }} disabled={isAddingMember}>
                    <InputLabel>{t('orgSettings.teamMembers.selectMember')}</InputLabel>
                    <Select
                      value={selectedMemberToAdd}
                      label={t('orgSettings.teamMembers.selectMember')}
                      onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                    >
                      {availableMembersToAdd.length === 0 ? (
                        <MenuItem disabled>
                          {t('orgSettings.teamMembers.noAvailableMembers')}
                        </MenuItem>
                      ) : (
                        availableMembersToAdd.map((member) => (
                          <MenuItem key={member.user.id} value={member.user.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                src={member.user.avatarUrl}
                                sx={{ width: 24, height: 24 }}
                              >
                                {member.user.name.charAt(0)}
                              </Avatar>
                              {member.user.name}
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 150 }} disabled={isAddingMember}>
                    <InputLabel>{t('orgSettings.teamMembers.role')}</InputLabel>
                    <Select
                      value={memberRole}
                      label={t('orgSettings.teamMembers.role')}
                      onChange={(e) => setMemberRole(e.target.value as any)}
                    >
                      <MenuItem value="player">{formatTeamMemberRole('player')}</MenuItem>
                      <MenuItem value="assistant_coach">{formatTeamMemberRole('assistant_coach')}</MenuItem>
                      <MenuItem value="head_coach">{formatTeamMemberRole('head_coach')}</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Position dropdown - only show for players */}
                  {memberRole === 'player' && (organization as any)?.sport?.positions?.length > 0 && (
                    <FormControl sx={{ minWidth: 150 }} disabled={isAddingMember}>
                      <InputLabel>{t('orgSettings.teamMembers.position')}</InputLabel>
                      <Select
                        value={memberPositionId}
                        label={t('orgSettings.teamMembers.position')}
                        onChange={(e) => setMemberPositionId(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>{t('orgSettings.teamMembers.noPosition')}</em>
                        </MenuItem>
                        {(organization as any)?.sport?.positions?.map((pos: any) => (
                          <MenuItem key={pos.id} value={pos.id}>
                            {pos.abbreviation} - {pos.nameTranslations?.[locale as 'en' | 'de'] || pos.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Jersey Number - only show for players */}
                  {memberRole === 'player' && (
                    <TextField
                      sx={{ width: 100 }}
                      label={t('orgSettings.teamMembers.jerseyNumber')}
                      type="number"
                      value={memberJerseyNumber}
                      onChange={(e) => setMemberJerseyNumber(e.target.value)}
                      disabled={isAddingMember}
                      inputProps={{ min: 0, max: 99 }}
                      placeholder="--"
                    />
                  )}

                  <Button
                    variant="contained"
                    onClick={handleAddTeamMember}
                    disabled={isAddingMember || !selectedMemberToAdd}
                    startIcon={isAddingMember ? <CircularProgress size={20} /> : <PersonAddIcon />}
                  >
                    {t('orgSettings.teamMembers.add')}
                  </Button>
                </Box>

                {availableMembersToAdd.length === 0 && members.length > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t('orgSettings.teamMembers.allMembersAssigned')}
                  </Alert>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Current Members Section */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  {t('orgSettings.teamMembers.currentMembers')} ({teamMembers.length})
                </Typography>

                {teamMembers.length === 0 ? (
                  <Alert severity="info">
                    {t('orgSettings.teamMembers.noMembers')}
                  </Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('orgSettings.teamMembers.memberName')}</TableCell>
                          <TableCell>{t('orgSettings.teamMembers.role')}</TableCell>
                          <TableCell>{t('orgSettings.teamMembers.position')}</TableCell>
                          <TableCell align="center">#</TableCell>
                          <TableCell>{t('orgSettings.teamMembers.joinedAt')}</TableCell>
                          <TableCell align="right">{t('orgSettings.teamMembers.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teamMembers.map((member) => {
                          // Use position data directly from team member (now returned from backend)
                          const positionDisplay = member.position
                            ? member.position.abbreviation
                            : '-';

                          return (
                            <TableRow key={member.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar
                                    src={member.user.avatarUrl}
                                    sx={{ width: 32, height: 32 }}
                                  >
                                    {member.user.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2">
                                      {member.user.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {member.user.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatTeamMemberRole(member.role)}
                                  size="small"
                                  color={
                                    member.role === 'head_coach' ? 'primary' :
                                    member.role === 'assistant_coach' ? 'secondary' :
                                    'default'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {member.role === 'player' ? positionDisplay : '-'}
                              </TableCell>
                              <TableCell align="center">
                                {member.role === 'player' && member.jerseyNumber != null
                                  ? member.jerseyNumber
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title={t('orgSettings.teamMembers.remove')}>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveTeamMember(member.userId)}
                                  >
                                    <PersonRemoveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTeamMembersModal}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizationSettings;
