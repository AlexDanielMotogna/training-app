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
  useTheme,
  alpha,
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

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface FormData {
  // Step 1: Account
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  // Step 2: Organization
  organizationName: string;
  sportId: string;
  timezone: string;
  // Step 3: Team
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

export const Signup: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [ageCategories, setAgeCategories] = useState<{ id: string; name: string; code: string }[]>([]);
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

  // Load sports on mount
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
          // Fallback data for demo - all 9 supported sports
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
      } catch (err) {
        // Fallback data - all 9 supported sports
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

  // Age categories per sport - based on official federation standards
  const AGE_CATEGORIES_BY_SPORT: Record<string, { id: string; name: string; code: string }[]> = {
    '1': [ // American Football
      { id: 'u6', name: 'Under 6', code: 'U6' },
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'u20', name: 'Under 20', code: 'U20' },
      { id: 'u21', name: 'Under 21', code: 'U21' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'veterans35', name: 'Veterans 35+', code: 'V35' },
      { id: 'veterans45', name: 'Veterans 45+', code: 'V45' },
    ],
    '2': [ // Basketball
      { id: 'u6', name: 'Under 6', code: 'U6' },
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u9', name: 'Under 9', code: 'U9' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u13', name: 'Under 13', code: 'U13' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u15', name: 'Under 15', code: 'U15' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u17', name: 'Under 17', code: 'U17' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'u20', name: 'Under 20', code: 'U20' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'veterans35', name: 'Veterans 35+', code: 'V35' },
      { id: 'veterans40', name: 'Veterans 40+', code: 'V40' },
      { id: 'veterans50', name: 'Veterans 50+', code: 'V50' },
    ],
    '3': [ // Soccer
      { id: 'u5', name: 'Under 5', code: 'U5' },
      { id: 'u6', name: 'Under 6', code: 'U6' },
      { id: 'u7', name: 'Under 7', code: 'U7' },
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u9', name: 'Under 9', code: 'U9' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u11', name: 'Under 11', code: 'U11' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u13', name: 'Under 13', code: 'U13' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u15', name: 'Under 15', code: 'U15' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u17', name: 'Under 17', code: 'U17' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'u19', name: 'Under 19', code: 'U19' },
      { id: 'u20', name: 'Under 20', code: 'U20' },
      { id: 'u21', name: 'Under 21', code: 'U21' },
      { id: 'u23', name: 'Under 23', code: 'U23' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'veterans35', name: 'Veterans 35+', code: 'V35' },
      { id: 'veterans40', name: 'Veterans 40+', code: 'V40' },
      { id: 'veterans45', name: 'Veterans 45+', code: 'V45' },
    ],
    '4': [ // Volleyball
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u13', name: 'Under 13', code: 'U13' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u15', name: 'Under 15', code: 'U15' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u17', name: 'Under 17', code: 'U17' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'u20', name: 'Under 20', code: 'U20' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'masters35', name: 'Masters 35+', code: 'M35' },
      { id: 'masters45', name: 'Masters 45+', code: 'M45' },
    ],
    '5': [ // Handball
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u15', name: 'Under 15', code: 'U15' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u17', name: 'Under 17', code: 'U17' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'u20', name: 'Under 20', code: 'U20' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'masters35', name: 'Masters 35+', code: 'M35' },
    ],
    '6': [ // Rugby
      { id: 'u6', name: 'Under 6', code: 'U6' },
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u17', name: 'Under 17', code: 'U17' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'u20', name: 'Under 20', code: 'U20' },
      { id: 'u23', name: 'Under 23', code: 'U23' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'veterans35', name: 'Veterans 35+', code: 'V35' },
      { id: 'veterans45', name: 'Veterans 45+', code: 'V45' },
    ],
    '7': [ // Ice Hockey
      { id: 'u6', name: 'U6 (Mite)', code: 'U6' },
      { id: 'u8', name: 'U8 (Mite)', code: 'U8' },
      { id: 'u10', name: 'U10 (Squirt)', code: 'U10' },
      { id: 'u12', name: 'U12 (Peewee)', code: 'U12' },
      { id: 'u14', name: 'U14 (Bantam)', code: 'U14' },
      { id: 'u15', name: 'Under 15', code: 'U15' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u17', name: 'Under 17', code: 'U17' },
      { id: 'u18', name: 'U18 (Midget Major)', code: 'U18' },
      { id: 'junior', name: 'Junior (16-20)', code: 'JR' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'masters30', name: 'Masters 30+', code: 'M30' },
      { id: 'masters40', name: 'Masters 40+', code: 'M40' },
    ],
    '8': [ // Baseball
      { id: 'u5', name: 'U5 (T-Ball)', code: 'U5' },
      { id: 'u6', name: 'Under 6', code: 'U6' },
      { id: 'u7', name: 'Under 7', code: 'U7' },
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u9', name: 'Under 9', code: 'U9' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u11', name: 'Under 11', code: 'U11' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u13', name: 'Under 13', code: 'U13' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u15', name: 'Under 15', code: 'U15' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u17', name: 'Under 17', code: 'U17' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'u23', name: 'Under 23', code: 'U23' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'masters35', name: 'Masters 35+', code: 'M35' },
    ],
    '9': [ // Lacrosse
      { id: 'u7', name: 'Under 7', code: 'U7' },
      { id: 'u8', name: 'Under 8', code: 'U8' },
      { id: 'u9', name: 'Under 9', code: 'U9' },
      { id: 'u10', name: 'Under 10', code: 'U10' },
      { id: 'u11', name: 'Under 11', code: 'U11' },
      { id: 'u12', name: 'Under 12', code: 'U12' },
      { id: 'u13', name: 'Under 13', code: 'U13' },
      { id: 'u14', name: 'Under 14', code: 'U14' },
      { id: 'u15', name: 'Under 15', code: 'U15' },
      { id: 'u16', name: 'Under 16', code: 'U16' },
      { id: 'u17', name: 'Under 17', code: 'U17' },
      { id: 'u18', name: 'Under 18', code: 'U18' },
      { id: 'u21', name: 'Under 21', code: 'U21' },
      { id: 'senior', name: 'Senior', code: 'SEN' },
      { id: 'veterans35', name: 'Veterans 35+', code: 'V35' },
    ],
  };

  // Load age categories when sport changes
  useEffect(() => {
    if (formData.sportId) {
      // First try to get age categories from the sports API data
      const selectedSport = sports.find(s => s.id === formData.sportId);
      if (selectedSport && 'ageCategories' in selectedSport && Array.isArray(selectedSport.ageCategories)) {
        // Use real age categories from API
        setAgeCategories(selectedSport.ageCategories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          code: cat.code
        })));
      } else {
        // Fallback to hardcoded categories if API data not available
        const categories = AGE_CATEGORIES_BY_SPORT[formData.sportId];
        if (categories) {
          setAgeCategories(categories);
        } else {
          // Fallback to generic categories
          setAgeCategories([
            { id: 'u12', name: 'Under 12', code: 'U12' },
            { id: 'u14', name: 'Under 14', code: 'U14' },
            { id: 'u16', name: 'Under 16', code: 'U16' },
            { id: 'u18', name: 'Under 18', code: 'U18' },
            { id: 'senior', name: 'Senior', code: 'SEN' },
          ]);
        }
      }
      // Reset selected age category when sport changes
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
      case 0: // Account
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

      case 1: // Organization
        if (!formData.organizationName || !formData.sportId) {
          setError(t('signup.errors.requiredFields'));
          return false;
        }
        return true;

      case 2: // Team
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

      // Step 1: Create user account
      const signupResponse = await authService.signup({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        role: 'coach', // Organization creator is always a coach
      });

      // Save auth token and user
      setAuthToken(signupResponse.token);
      saveUser(signupResponse.user);

      // Step 2: Create organization
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
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          timezone: formData.timezone || 'Europe/Madrid',
        }),
      });

      if (!orgResponse.ok) {
        const errorData = await orgResponse.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }

      const organization = await orgResponse.json();

      // Update token if a new one was provided (includes organizationId)
      const authToken = organization.token || signupResponse.token;
      if (organization.token) {
        setAuthToken(organization.token);
      }

      // Step 3: Create first team
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

      // Store organization context with role
      const orgContext = {
        ...organization,
        role: 'owner',
      };
      localStorage.setItem('teamtrainer_organization', JSON.stringify(orgContext));

      // Store team IDs
      localStorage.setItem('teamtrainer_teams', JSON.stringify([{ id: team.id }]));
      localStorage.setItem('teamtrainer_active_team', team.id);

      // Navigate to training page (user is now part of organization)
      navigate('/training');
      window.location.reload(); // Reload to load org context
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
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              {t('signup.step1.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {t('signup.step1.subtitle')}
            </Typography>

            {/* Social Login Buttons */}
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              sx={{ mb: 2 }}
              disabled
            >
              {t('signup.continueWithGoogle')}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('signup.lastName')}
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  fullWidth
                  required
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              {t('signup.step2.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
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
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('signup.sport')}</InputLabel>
                  <Select
                    value={formData.sportId}
                    label={t('signup.sport')}
                    onChange={(e) => setFormData({ ...formData, sportId: e.target.value as string })}
                    disabled={loadingSports}
                  >
                    {sports.map((sport) => (
                      <MenuItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{t('signup.sportHint')}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('signup.timezone')}</InputLabel>
                  <Select
                    value={formData.timezone}
                    label={t('signup.timezone')}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value as string })}
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

            {/* Plan Badge */}
            {selectedPlan !== 'free' && (
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CheckCircleIcon sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              {t('signup.step3.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
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
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required disabled={!formData.sportId}>
                  <InputLabel>{t('signup.ageCategory')}</InputLabel>
                  <Select
                    value={formData.ageCategoryId}
                    label={t('signup.ageCategory')}
                    onChange={(e) => setFormData({ ...formData, ageCategoryId: e.target.value as string })}
                  >
                    {ageCategories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('signup.yourRole')}</InputLabel>
                  <Select
                    value={formData.userRole}
                    label={t('signup.yourRole')}
                    onChange={(e) => setFormData({ ...formData, userRole: e.target.value as 'owner' | 'head_coach' })}
                  >
                    <MenuItem value="owner">{t('signup.roleOwner')}</MenuItem>
                    <MenuItem value="head_coach">{t('signup.roleHeadCoach')}</MenuItem>
                  </Select>
                  <FormHelperText>{t('signup.roleHint')}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            {/* Summary */}
            <Box
              sx={{
                mt: 4,
                p: 3,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: 1,
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                {t('signup.summary')}
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('signup.summaryOrg')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={500}>
                    {formData.organizationName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('signup.summarySport')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={500}>
                    {sports.find((s) => s.id === formData.sportId)?.name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('signup.summaryTeam')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={500}>
                    {formData.teamName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('signup.summaryPlan')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" fontWeight={500}>
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      {/* Header */}
      <Container maxWidth="sm">
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
          <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700} color="primary">
            TeamTrainer
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Card */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={activeStep === 0 ? () => navigate('/') : handleBack}
                disabled={loading}
              >
                {activeStep === 0 ? t('signup.backToHome') : t('signup.back')}
              </Button>

              {activeStep === STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ minWidth: 140 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t('signup.createAccount')
                  )}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} disabled={loading}>
                  {t('signup.next')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Login Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('signup.haveAccount')}{' '}
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none' }}
            >
              {t('signup.login')}
            </Button>
          </Typography>
        </Box>

        {/* Terms */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 4, px: 2 }}
        >
          {t('signup.terms')}
        </Typography>
      </Container>
    </Box>
  );
};
