import React, { useState, useEffect, useRef } from 'react';
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
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import SportsIcon from '@mui/icons-material/Sports';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { useOrganization, useOrgPermission } from '../contexts/OrganizationContext';
import { useI18n } from '../i18n/I18nProvider';
import { toastService } from '../services/toast';
import { getAuthToken } from '../services/api';
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

export const OrganizationSettings: React.FC = () => {
  const { t } = useI18n();
  const { organization, refreshOrganization, hasOrganization } = useOrganization();
  const canManageSettings = useOrgPermission('canManageSettings');

  // Debug: Log organization data
  useEffect(() => {
    console.log('[OrganizationSettings] Organization data:', organization);
    console.log('[OrganizationSettings] Sport data:', (organization as any)?.sport);
  }, [organization]);

  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);

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
          logoUrl,
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

  // Load members and invitations when Members tab is active
  useEffect(() => {
    if (activeTab === 3 && organization) {
      loadMembersAndInvitations();
    }
  }, [activeTab, organization]);

  const loadMembersAndInvitations = async () => {
    if (!organization) return;

    setIsLoadingMembers(true);
    try {
      const [membersData, invitationsData] = await Promise.all([
        getOrganizationMembers(organization.id),
        getOrganizationInvitations(organization.id),
      ]);
      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Failed to load members:', error);
      toastService.error('Failed to load members');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleSendInvite = async () => {
    if (!organization || !inviteEmail || !inviteRole) {
      toastService.error(t('orgSettings.invite.errors.emailRequired'));
      return;
    }

    setIsSendingInvite(true);
    try {
      await inviteMember(organization.id, {
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
      console.error('Failed to send invite:', error);
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
    if (!organization) return;

    try {
      await resendInvitation(organization.id, invitationId);
      toastService.success(t('orgSettings.invitations.resent'));
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      toastService.error('Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!organization) return;

    try {
      await cancelInvitation(organization.id, invitationId);
      toastService.success(t('orgSettings.invitations.cancelled'));
      await loadMembersAndInvitations();
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      toastService.error('Failed to cancel invitation');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!organization) return;

    if (!window.confirm(t('orgSettings.members.confirmRemove'))) {
      return;
    }

    try {
      await removeMember(organization.id, memberId);
      toastService.success(t('orgSettings.members.removed'));
      await loadMembersAndInvitations();
    } catch (error) {
      console.error('Failed to remove member:', error);
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
                  Available age categories for {(organization as any)?.sport?.name}
                </Typography>
                {(organization as any)?.sport?.ageCategories && (organization as any).sport.ageCategories.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(organization as any).sport.ageCategories.map((category: any) => (
                      <Chip
                        key={category.id}
                        label={`${category.name} (${category.code})`}
                        color="default"
                        variant="outlined"
                        size="small"
                      />
                    ))}
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
    </Container>
  );
};

export default OrganizationSettings;
