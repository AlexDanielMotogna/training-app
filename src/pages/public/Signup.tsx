import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  FormHelperText,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GoogleIcon from '@mui/icons-material/Google';
import { useI18n } from '../../i18n/I18nProvider';
import { authService, setAuthToken } from '../../services/api';
import { saveUser } from '../../services/userProfile';
import { backgrounds, gradients, brand, borders, radius, text } from '../../designTokens';

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  sportId: string;
  timezone: string;
  teamName: string;
  ageCategoryId: string;
  userRole: 'owner' | 'head_coach';
}

const STEPS = ['Account', 'Organization', 'First Team'];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

// Dark input styles matching the Landing page
const darkInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#ffffff',
    '& fieldset': {
      borderColor: borders.dark.light,
    },
    '&:hover fieldset': {
      borderColor: borders.dark.medium,
    },
    '&.Mui-focused fieldset': {
      borderColor: brand.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: text.dark.secondary,
    '&.Mui-focused': {
      color: brand.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
  },
  '& .MuiFormHelperText-root': {
    color: text.dark.muted,
  },
};

const darkSelectStyles = {
  borderRadius: radius.sm,
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#ffffff',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: borders.dark.light,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: borders.dark.medium,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: brand.primary.main,
  },
  '& .MuiSelect-icon': {
    color: text.dark.secondary,
  },
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: backgrounds.dark.elevated,
      border: `1px solid ${borders.dark.light}`,
      '& .MuiMenuItem-root': {
        color: text.dark.primary,
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.05)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(99,102,241,0.2)',
        },
      },
    },
  },
};

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, locale } = useI18n();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [ageCategories, setAgeCategories] = useState<{
    id: string;
    name: string;
    code: string;
    nameTranslations?: { en?: string; es?: string; de?: string };
  }[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);

  const selectedPlan = searchParams.get('plan') || 'free';

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    sportId: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid',
    teamName: '',
    ageCategoryId: '',
    userRole: 'owner',
  });

  useEffect(() => {
    const loadSports = async () => {
      try {
        setLoadingSports(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/organizations/sports`);
        if (response.ok) {
          const data = await response.json();
          setSports(data);
        } else {
          setSports([
            { id: '1', name: 'American Football', slug: 'american-football' },
            { id: '2', name: 'Basketball', slug: 'basketball' },
            { id: '3', name: 'Soccer', slug: 'soccer' },
            { id: '4', name: 'Volleyball', slug: 'volleyball' },
            { id: '5', name: 'Handball', slug: 'handball' },
            { id: '6', name: 'Rugby', slug: 'rugby' },
            { id: '7', name: 'Ice Hockey', slug: 'ice-hockey' },
            { id: '8', name: 'Baseball', slug: 'baseball' },
            { id: '9', name: 'Lacrosse', slug: 'lacrosse' },
          ]);
        }
      } catch {
        setSports([
          { id: '1', name: 'American Football', slug: 'american-football' },
          { id: '2', name: 'Basketball', slug: 'basketball' },
          { id: '3', name: 'Soccer', slug: 'soccer' },
          { id: '4', name: 'Volleyball', slug: 'volleyball' },
          { id: '5', name: 'Handball', slug: 'handball' },
          { id: '6', name: 'Rugby', slug: 'rugby' },
          { id: '7', name: 'Ice Hockey', slug: 'ice-hockey' },
          { id: '8', name: 'Baseball', slug: 'baseball' },
          { id: '9', name: 'Lacrosse', slug: 'lacrosse' },
        ]);
      } finally {
        setLoadingSports(false);
      }
    };
    loadSports();
  }, []);

  const AGE_CATEGORIES_BY_SPORT: Record<string, { id: string; name: string; code: string }[]> = {
    '1': [
      { id: 'u6', name: 'Under 6', code: 'U6' },
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
    ],
    '2': [
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
    ],
    '3': [
      { id: 'u6', name: 'Under 6', code: 'U6' },
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
    ],
  };

  useEffect(() => {
    if (formData.sportId) {
      const selectedSport = sports.find(s => s.id === formData.sportId);
      if (selectedSport && 'ageCategories' in selectedSport && Array.isArray((selectedSport as any).ageCategories)) {
        setAgeCategories((selectedSport as any).ageCategories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          code: cat.code
        })));
      } else {
        const categories = AGE_CATEGORIES_BY_SPORT[formData.sportId];
        if (categories) {
          setAgeCategories(categories);
        } else {
          setAgeCategories([
            { id: 'u12', name: 'Under 12', code: 'U12' },
            { id: 'u14', name: 'Under 14', code: 'U14' },
            { id: 'u16', name: 'Under 16', code: 'U16' },
            { id: 'u18', name: 'Under 18', code: 'U18' },
            { id: 'senior', name: 'Senior', code: 'SEN' },
          ]);
        }
      }
      setFormData(prev => ({ ...prev, ageCategoryId: '' }));
    }
  }, [formData.sportId, sports]);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
          setError(t('signup.errors.requiredFields'));
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError(t('signup.errors.invalidEmail'));
          return false;
        }
        if (formData.password.length < 8) {
          setError(t('signup.errors.passwordLength'));
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError(t('signup.errors.passwordMismatch'));
          return false;
        }
        return true;
      case 1:
        if (!formData.organizationName || !formData.sportId) {
          setError(t('signup.errors.requiredFields'));
          return false;
        }
        return true;
      case 2:
        if (!formData.teamName || !formData.ageCategoryId) {
          setError(t('signup.errors.requiredFields'));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const signupResponse = await authService.signup({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        role: 'coach',
      });

      setAuthToken(signupResponse.token);
      const userForStorage = {
        ...signupResponse.user,
        age: signupResponse.user.age || 0,
        weightKg: signupResponse.user.weightKg || 0,
        heightCm: signupResponse.user.heightCm || 0,
        position: (signupResponse.user.position || 'RB') as 'RB' | 'WR' | 'LB' | 'OL' | 'DB' | 'QB' | 'DL' | 'TE' | 'K/P',
      };
      saveUser(userForStorage as Parameters<typeof saveUser>[0]);

      const orgResponse = await fetch(`${API_URL}/organizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${signupResponse.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.organizationName,
          slug: formData.organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          sportId: formData.sportId,
          primaryColor: brand.primary.main,
          secondaryColor: brand.secondary.main,
          timezone: formData.timezone || 'Europe/Madrid',
        }),
      });

      if (!orgResponse.ok) {
        const errorData = await orgResponse.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }

      const organization = await orgResponse.json();
      const authToken = organization.token || signupResponse.token;
      if (organization.token) {
        setAuthToken(organization.token);
      }

      const teamResponse = await fetch(`${API_URL}/organizations/${organization.id}/teams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.teamName,
          ageCategoryId: formData.ageCategoryId,
          isActive: true,
        }),
      });

      if (!teamResponse.ok) {
        const errorData = await teamResponse.json();
        throw new Error(errorData.error || 'Failed to create team');
      }

      const team = await teamResponse.json();

      const orgContext = { ...organization, role: 'owner' };
      localStorage.setItem('teamtrainer_organization', JSON.stringify(orgContext));
      localStorage.setItem('teamtrainer_teams', JSON.stringify([{ id: team.id }]));
      localStorage.setItem('teamtrainer_active_team', team.id);

      navigate('/training');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || t('signup.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: text.dark.primary }}>
              {t('signup.step1.title')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: text.dark.secondary }}>
              {t('signup.step1.subtitle')}
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              sx={{
                mb: 2,
                borderColor: borders.dark.light,
                color: text.dark.primary,
                '&:hover': {
                  borderColor: borders.dark.medium,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
              disabled
            >
              {t('signup.continueWithGoogle')}
            </Button>

            <Divider sx={{ my: 3, borderColor: borders.dark.light }}>
              <Typography variant="body2" sx={{ color: text.dark.muted }}>
                {t('signup.orEmail')}
              </Typography>
            </Divider>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('signup.firstName')}
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  fullWidth
                  required
                  autoFocus
                  sx={darkInputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('signup.lastName')}
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  fullWidth
                  required
                  sx={darkInputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('signup.email')}
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  fullWidth
                  required
                  sx={darkInputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('signup.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  fullWidth
                  required
                  helperText={t('signup.passwordHint')}
                  sx={darkInputStyles}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: text.dark.secondary }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('signup.confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  fullWidth
                  required
                  sx={darkInputStyles}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: text.dark.primary }}>
              {t('signup.step2.title')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: text.dark.secondary }}>
              {t('signup.step2.subtitle')}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label={t('signup.organizationName')}
                  value={formData.organizationName}
                  onChange={handleChange('organizationName')}
                  fullWidth
                  required
                  placeholder="e.g. Madrid Lions FC"
                  autoFocus
                  sx={darkInputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: text.dark.secondary, '&.Mui-focused': { color: brand.primary.main } }}>
                    {t('signup.sport')}
                  </InputLabel>
                  <Select
                    value={formData.sportId}
                    label={t('signup.sport')}
                    onChange={(e) => setFormData({ ...formData, sportId: e.target.value as string })}
                    disabled={loadingSports}
                    sx={darkSelectStyles}
                    MenuProps={selectMenuProps}
                  >
                    {sports.map((sport) => (
                      <MenuItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText sx={{ color: text.dark.muted }}>{t('signup.sportHint')}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: text.dark.secondary, '&.Mui-focused': { color: brand.primary.main } }}>
                    {t('signup.timezone')}
                  </InputLabel>
                  <Select
                    value={formData.timezone}
                    label={t('signup.timezone')}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value as string })}
                    sx={darkSelectStyles}
                    MenuProps={selectMenuProps}
                  >
                    {TIMEZONES.map((tz) => (
                      <MenuItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {selectedPlan !== 'free' && (
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  background: 'rgba(99,102,241,0.1)',
                  borderRadius: radius.md,
                  border: `1px solid ${borders.dark.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CheckCircleIcon sx={{ color: brand.primary.main }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: text.dark.primary }}>
                    {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                  </Typography>
                  <Typography variant="body2" sx={{ color: text.dark.secondary }}>
                    {t('signup.trialInfo')}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: text.dark.primary }}>
              {t('signup.step3.title')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: text.dark.secondary }}>
              {t('signup.step3.subtitle')}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label={t('signup.teamName')}
                  value={formData.teamName}
                  onChange={handleChange('teamName')}
                  fullWidth
                  required
                  placeholder="e.g. Seniors, U15 Team"
                  autoFocus
                  sx={darkInputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required disabled={!formData.sportId}>
                  <InputLabel sx={{ color: text.dark.secondary, '&.Mui-focused': { color: brand.primary.main } }}>
                    {t('signup.ageCategory')}
                  </InputLabel>
                  <Select
                    value={formData.ageCategoryId}
                    label={t('signup.ageCategory')}
                    onChange={(e) => setFormData({ ...formData, ageCategoryId: e.target.value as string })}
                    sx={darkSelectStyles}
                    MenuProps={selectMenuProps}
                  >
                    {ageCategories.map((cat) => {
                      const displayName = cat.nameTranslations?.[locale as 'en' | 'de'] || cat.name;
                      return (
                        <MenuItem key={cat.id} value={cat.id}>
                          {displayName} ({cat.code})
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: text.dark.secondary, '&.Mui-focused': { color: brand.primary.main } }}>
                    {t('signup.yourRole')}
                  </InputLabel>
                  <Select
                    value={formData.userRole}
                    label={t('signup.yourRole')}
                    onChange={(e) => setFormData({ ...formData, userRole: e.target.value as 'owner' | 'head_coach' })}
                    sx={darkSelectStyles}
                    MenuProps={selectMenuProps}
                  >
                    <MenuItem value="owner">{t('signup.roleOwner')}</MenuItem>
                    <MenuItem value="head_coach">{t('signup.roleHeadCoach')}</MenuItem>
                  </Select>
                  <FormHelperText sx={{ color: text.dark.muted }}>{t('signup.roleHint')}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 4,
                p: 3,
                backgroundColor: backgrounds.dark.card,
                borderRadius: radius.md,
                border: `1px solid ${borders.dark.light}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: text.dark.primary }}>
                {t('signup.summary')}
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: text.dark.secondary }}>
                    {t('signup.summaryOrg')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: text.dark.primary }}>
                    {formData.organizationName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: text.dark.secondary }}>
                    {t('signup.summarySport')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: text.dark.primary }}>
                    {sports.find((s) => s.id === formData.sportId)?.name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: text.dark.secondary }}>
                    {t('signup.summaryTeam')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: text.dark.primary }}>
                    {formData.teamName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: text.dark.secondary }}>
                    {t('signup.summaryPlan')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: text.dark.primary }}>
                    {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: backgrounds.dark.primary,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient effect */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '800px',
          background: gradients.purpleGlow,
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo - TeamTrainer style */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 4,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <FitnessCenterIcon sx={{ color: brand.primary.main, fontSize: 40 }} />
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TeamTrainer
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            '& .MuiStepLabel-label': {
              color: text.dark.muted,
              '&.Mui-active': { color: text.dark.primary },
              '&.Mui-completed': { color: text.dark.secondary },
            },
            '& .MuiStepIcon-root': {
              color: borders.dark.medium,
              '&.Mui-active': { color: brand.primary.main },
              '&.Mui-completed': { color: brand.primary.main },
            },
            '& .MuiStepConnector-line': {
              borderColor: borders.dark.light,
            },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Card */}
        <Card
          sx={{
            backgroundColor: backgrounds.dark.card,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${borders.dark.light}`,
            borderRadius: radius.md,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  '& .MuiAlert-icon': { color: '#f87171' },
                }}
              >
                {error}
              </Alert>
            )}

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={activeStep === 0 ? () => navigate('/') : handleBack}
                disabled={loading}
                sx={{
                  color: text.dark.secondary,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                }}
              >
                {activeStep === 0 ? t('signup.backToHome') : t('signup.back')}
              </Button>

              {activeStep === STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    minWidth: 140,
                    background: gradients.primary,
                    '&:hover': { background: gradients.primaryHover },
                    '&.Mui-disabled': {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : t('signup.createAccount')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                  sx={{
                    background: gradients.primary,
                    '&:hover': { background: gradients.primaryHover },
                  }}
                >
                  {t('signup.next')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Login Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: text.dark.secondary }}>
            {t('signup.haveAccount')}{' '}
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                color: brand.primary.light,
                '&:hover': { backgroundColor: 'rgba(99,102,241,0.1)' },
              }}
            >
              {t('signup.login')}
            </Button>
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 4,
            px: 2,
            color: text.dark.muted,
          }}
        >
          {t('signup.terms')}
        </Typography>
      </Container>
    </Box>
  );
};
