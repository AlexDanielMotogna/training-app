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
import type { Position } from '../../types/exercise';

interface SportPosition {
  id: string;
  abbreviation: string;
  name: string;
  group: string;
  nameTranslations?: {
    en?: string;
    de?: string;
  };
}

interface InvitationDetails {
  organizationId: string;
  organizationName: string;
  sportId: string;
  sportName: string;
  positions: SportPosition[];
  email: string;
  role: string;
  expiresAt: string;
  isExpired: boolean;
  isAccepted: boolean;
}

const Join: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
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
  const [position, setPosition] = useState<string>('');
  const [jerseyNumber, setJerseyNumber] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Set default position when invitation loads
  useEffect(() => {
    if (invitation && invitation.positions && invitation.positions.length > 0 && !position) {
      console.log('[JOIN] Setting default position:', invitation.positions[0].abbreviation);
      console.log('[JOIN] Current locale:', locale);
      setPosition(invitation.positions[0].abbreviation);
    }
  }, [invitation, position, locale]);

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
      if (!position) {
        toastService.error('Please select your position');
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
        requestBody.position = position;
        if (jerseyNumber) {
          requestBody.jerseyNumber = jerseyNumber;
        }
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

      // Save auth token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

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
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !invitation) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Invalid Invitation
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {error || 'This invitation link is not valid.'}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (invitation.isExpired) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ErrorIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Invitation Expired
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              This invitation expired on {new Date(invitation.expiresAt).toLocaleDateString()}.
              Please contact the organization administrator for a new invitation.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (invitation.isAccepted) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Already Accepted
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              This invitation has already been accepted. Please log in to access the organization.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Logged in user - show accept button
  if (isLoggedIn) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <CheckCircleIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                You're Invited!
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>{invitation.organizationName}</strong> has invited you to join as a{' '}
                <strong>{invitation.role}</strong>.
              </Typography>
            </Alert>

            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email
              </Typography>
              <Typography variant="body1" gutterBottom>
                {invitation.email}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Role
              </Typography>
              <Typography variant="body1">
                {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleAcceptInvitation}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Accepting...' : 'Accept Invitation'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Not you?{' '}
                <Link
                  component="button"
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userRole');
                    window.location.reload();
                  }}
                >
                  Log out
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Not logged in - show signup form
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircleIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Join {invitation.organizationName}
            </Typography>
            <Typography color="text.secondary">
              Create your account to accept the invitation
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
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
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={t('auth.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              sx={{ mb: 2 }}
            />

            {/* Player-specific fields */}
            {invitation.role === 'player' && (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField
                    label={t('auth.jerseyNumber')}
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="--"
                    helperText={t('auth.jerseyNumberOptional')}
                  />

                  <FormControl required fullWidth>
                    <InputLabel>{t('auth.position')}</InputLabel>
                    <Select
                      value={position}
                      label={t('auth.position')}
                      onChange={(e) => {
                        console.log('[JOIN] Position changed to:', e.target.value);
                        setPosition(e.target.value);
                      }}
                      disabled={isSubmitting}
                    >
                      {invitation.positions?.map((pos) => {
                        const displayName = (pos.nameTranslations as any)?.[locale] || pos.name;
                        console.log('[JOIN] Rendering position:', pos.abbreviation, displayName);
                        return (
                          <MenuItem key={pos.id} value={pos.abbreviation}>
                            {displayName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>

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
                  sx={{ mb: 2 }}
                />

                <FormControl required fullWidth sx={{ mb: 2 }}>
                  <InputLabel>{t('auth.gender')}</InputLabel>
                  <Select
                    value={sex}
                    label={t('auth.gender')}
                    onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                    disabled={isSubmitting}
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
                  />

                  <TextField
                    label={t('auth.heightCm')}
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                    disabled={isSubmitting}
                    required
                    inputProps={{ min: 150, max: 220 }}
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
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isSubmitting}
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
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={isSubmitting}
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
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account & Join'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link onClick={() => navigate(`/login?redirect=/join?token=${token}`)}>
                Log in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Join;
