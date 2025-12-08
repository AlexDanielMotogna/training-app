import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useI18n } from '../../i18n/I18nProvider';
import { toastService } from '../../services/toast';
import { backgrounds, borders, brand, text, radius, gradients } from '../../designTokens';

interface InvitationDetails {
  organizationId: string;
  organizationName: string;
  sportId: string;
  sportName: string;
  email: string;
  role: string;
  expiresAt: string;
  isExpired: boolean;
  isAccepted: boolean;
}

// Dark input styles matching other public pages
const darkInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: radius.xs,
    backgroundColor: '#14141a',
    color: '#ffffff',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255,255,255,0.35)',
    },
    '&.Mui-focused fieldset': {
      borderColor: brand.primary.main,
    },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(20,20,25,0.7)',
      '& fieldset': {
        borderColor: 'rgba(255,255,255,0.1)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.7)',
    '&.Mui-focused': {
      color: brand.primary.light,
    },
    '&.MuiInputLabel-shrink': {
      color: 'rgba(255,255,255,0.9)',
      backgroundColor: 'transparent',
    },
    '&.Mui-disabled': {
      color: 'rgba(255,255,255,0.5)',
    },
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
    '&::placeholder': {
      color: 'rgba(255,255,255,0.5)',
      opacity: 1,
    },
    '&.Mui-disabled': {
      color: 'rgba(255,255,255,0.5)',
      WebkitTextFillColor: 'rgba(255,255,255,0.5)',
    },
    '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
      WebkitBoxShadow: '0 0 0 100px #14141a inset !important',
      WebkitTextFillColor: '#ffffff !important',
    },
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255,255,255,0.6)',
  },
};

const darkSelectStyles = {
  borderRadius: radius.xs,
  backgroundColor: '#14141a',
  color: '#ffffff',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255,255,255,0.35)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: brand.primary.main,
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255,255,255,0.7)',
  },
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: backgrounds.dark.elevated,
      border: `1px solid rgba(255,255,255,0.15)`,
      '& .MuiMenuItem-root': {
        color: text.dark.primary,
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(99,102,241,0.25)',
        },
      },
    },
  },
};

// Page wrapper styles
const pageStyles = {
  minHeight: '100vh',
  background: backgrounds.dark.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  py: 4,
};

const cardStyles = {
  backgroundColor: backgrounds.dark.card,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${borders.dark.light}`,
  borderRadius: radius.sm,
};

const Join: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Signup form state
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Player-specific fields
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    setIsLoggedIn(!!authToken);

    // Verify invitation token
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    if (!token) return;

    try {
      const response = await fetch(`/api/invitations/verify/${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify invitation');
      }

      const data = await response.json();
      console.log('[JOIN] Invitation data received:', data);
      console.log('[JOIN] Positions:', data.positions);
      setInvitation(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to verify invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token || !invitation) return;

    setIsSubmitting(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invitation');
      }

      toastService.success('Invitation accepted! Welcome to the organization.');

      // Redirect to organization dashboard
      navigate('/');
      window.location.reload(); // Reload to update organization context
    } catch (err: any) {
      toastService.error(err.message || 'Failed to accept invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !invitation) return;

    // Validation
    if (!name.trim()) {
      toastService.error('Please enter your name');
      return;
    }

    if (password.length < 6) {
      toastService.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toastService.error('Passwords do not match');
      return;
    }

    // Player-specific validation
    if (invitation.role === 'player') {
      if (!birthDate) {
        toastService.error('Please enter your birth date');
        return;
      }
      if (!weightKg) {
        toastService.error('Please enter your weight');
        return;
      }
      if (!heightCm) {
        toastService.error('Please enter your height');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Prepare request body
      const requestBody: any = {
        token,
        name,
        password,
      };

      // Add player-specific fields if role is player
      if (invitation.role === 'player') {
        requestBody.birthDate = birthDate;
        requestBody.sex = sex;
        requestBody.weightKg = weightKg;
        requestBody.heightCm = heightCm;
        // Note: position and jerseyNumber are assigned by coaches via team member management
      }

      const response = await fetch('/api/invitations/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const data = await response.json();

      // Save auth token, user data, and organization
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      // Save organization for theming and branding
      if (data.organization) {
        localStorage.setItem('teamtrainer_organization', JSON.stringify(data.organization));
      }

      toastService.success('Account created! Welcome to the organization.');

      // Redirect to dashboard with full page reload to initialize auth context
      window.location.href = '/dashboard';
    } catch (err: any) {
      toastService.error(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={pageStyles}>
        <Container maxWidth="sm">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress sx={{ color: brand.primary.main }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !invitation) {
    return (
      <Box sx={pageStyles}>
        <Container maxWidth="sm">
          <Card sx={cardStyles}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ErrorIcon sx={{ fontSize: 64, mb: 2, color: '#ef5350' }} />
              <Typography variant="h5" gutterBottom sx={{ color: text.dark.primary }}>
                Invalid Invitation
              </Typography>
              <Typography sx={{ mb: 3, color: text.dark.secondary }}>
                {error || 'This invitation link is not valid.'}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  background: gradients.primary,
                  '&:hover': {
                    background: gradients.primaryHover,
                  },
                }}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (invitation.isExpired) {
    return (
      <Box sx={pageStyles}>
        <Container maxWidth="sm">
          <Card sx={cardStyles}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ErrorIcon sx={{ fontSize: 64, mb: 2, color: '#ffa726' }} />
              <Typography variant="h5" gutterBottom sx={{ color: text.dark.primary }}>
                Invitation Expired
              </Typography>
              <Typography sx={{ mb: 3, color: text.dark.secondary }}>
                This invitation expired on {new Date(invitation.expiresAt).toLocaleDateString()}.
                Please contact the organization administrator for a new invitation.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  background: gradients.primary,
                  '&:hover': {
                    background: gradients.primaryHover,
                  },
                }}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (invitation.isAccepted) {
    return (
      <Box sx={pageStyles}>
        <Container maxWidth="sm">
          <Card sx={cardStyles}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircleIcon sx={{ fontSize: 64, mb: 2, color: '#4caf50' }} />
              <Typography variant="h5" gutterBottom sx={{ color: text.dark.primary }}>
                Already Accepted
              </Typography>
              <Typography sx={{ mb: 3, color: text.dark.secondary }}>
                This invitation has already been accepted. Please log in to access the organization.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  background: gradients.primary,
                  '&:hover': {
                    background: gradients.primaryHover,
                  },
                }}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Logged in user - show accept button
  if (isLoggedIn) {
    return (
      <Box sx={pageStyles}>
        <Container maxWidth="sm">
          <Card sx={cardStyles}>
            <CardContent sx={{ py: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 64, mb: 2, color: brand.primary.main }} />
                <Typography variant="h4" gutterBottom sx={{ color: text.dark.primary }}>
                  You're Invited!
                </Typography>
              </Box>

              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(99,102,241,0.15)',
                  color: text.dark.primary,
                  border: `1px solid ${brand.primary.main}`,
                  '& .MuiAlert-icon': {
                    color: brand.primary.main,
                  },
                }}
              >
                <Typography variant="body2">
                  <strong>{invitation.organizationName}</strong> has invited you to join as a{' '}
                  <strong>{invitation.role}</strong>.
                </Typography>
              </Alert>

              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                p: 2,
                borderRadius: radius.xs,
                mb: 3,
                border: `1px solid ${borders.dark.light}`,
              }}>
                <Typography variant="body2" sx={{ color: text.dark.secondary }} gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ color: text.dark.primary }} gutterBottom>
                  {invitation.email}
                </Typography>

                <Typography variant="body2" sx={{ color: text.dark.secondary, mt: 2 }} gutterBottom>
                  Role
                </Typography>
                <Typography variant="body1" sx={{ color: text.dark.primary }}>
                  {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAcceptInvitation}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : null}
                sx={{
                  background: gradients.primary,
                  '&:hover': {
                    background: gradients.primaryHover,
                  },
                }}
              >
                {isSubmitting ? 'Accepting...' : 'Accept Invitation'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: text.dark.secondary }}>
                  Not you?{' '}
                  <Link
                    component="button"
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('userRole');
                      window.location.reload();
                    }}
                    sx={{ color: brand.primary.light }}
                  >
                    Log out
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Not logged in - show signup form
  return (
    <Box sx={pageStyles}>
      <Container maxWidth="sm">
        <Card sx={cardStyles}>
          <CardContent sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, mb: 2, color: brand.primary.main }} />
              <Typography variant="h4" gutterBottom sx={{ color: text.dark.primary }}>
                Join {invitation.organizationName}
              </Typography>
              <Typography sx={{ color: text.dark.secondary }}>
                Create your account to accept the invitation
              </Typography>
            </Box>

            <Alert
              severity="info"
              sx={{
                mb: 3,
                backgroundColor: 'rgba(99,102,241,0.15)',
                color: text.dark.primary,
                border: `1px solid ${brand.primary.main}`,
                '& .MuiAlert-icon': {
                  color: brand.primary.main,
                },
              }}
            >
              <Typography variant="body2">
                You've been invited to join as a <strong>{invitation.role}</strong>.
              </Typography>
            </Alert>

            <form onSubmit={handleSignup}>
              <TextField
                fullWidth
                label={t('auth.email')}
                value={invitation.email}
                disabled
                sx={{ ...darkInputStyles, mb: 2 }}
              />

              <TextField
                fullWidth
                label={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
                sx={{ ...darkInputStyles, mb: 2 }}
              />

              {/* Player-specific fields */}
              {invitation.role === 'player' && (
                <>
                  <TextField
                    fullWidth
                    label={t('auth.birthDate')}
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    disabled={isSubmitting}
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0],
                      min: new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]
                    }}
                    sx={{ ...darkInputStyles, mb: 2 }}
                  />

                  <FormControl required fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-focused': { color: brand.primary.light }
                    }}>
                      {t('auth.gender')}
                    </InputLabel>
                    <Select
                      value={sex}
                      label={t('auth.gender')}
                      onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                      disabled={isSubmitting}
                      sx={darkSelectStyles}
                      MenuProps={selectMenuProps}
                    >
                      <MenuItem value="male">{t('auth.male')}</MenuItem>
                      <MenuItem value="female">{t('auth.female')}</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <TextField
                      label={t('auth.weightKg')}
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                      disabled={isSubmitting}
                      required
                      inputProps={{ min: 50, max: 200 }}
                      sx={darkInputStyles}
                    />

                    <TextField
                      label={t('auth.heightCm')}
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                      disabled={isSubmitting}
                      required
                      inputProps={{ min: 150, max: 220 }}
                      sx={darkInputStyles}
                    />
                  </Box>
                </>
              )}

              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                helperText={t('auth.passwordMinLength')}
                sx={{ ...darkInputStyles, mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isSubmitting}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('auth.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
                sx={{ ...darkInputStyles, mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={isSubmitting}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : null}
                sx={{
                  background: gradients.primary,
                  '&:hover': {
                    background: gradients.primaryHover,
                  },
                }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account & Join'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: text.dark.secondary }}>
                Already have an account?{' '}
                <Link
                  onClick={() => navigate(`/login?redirect=/join?token=${token}`)}
                  sx={{ color: brand.primary.light, cursor: 'pointer' }}
                >
                  Log in
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Join;
