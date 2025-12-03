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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useI18n } from '../../i18n/I18nProvider';
import { toastService } from '../../services/toast';

interface InvitationDetails {
  organizationId: string;
  organizationName: string;
  email: string;
  role: string;
  expiresAt: string;
  isExpired: boolean;
  isAccepted: boolean;
}

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

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/invitations/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, name, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const data = await response.json();

      // Save auth token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);

      toastService.success('Account created! Welcome to the organization.');

      // Redirect to dashboard
      navigate('/');
      window.location.reload(); // Reload to initialize auth context
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
              label="Email"
              value={invitation.email}
              disabled
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              helperText="At least 6 characters"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              required
              sx={{ mb: 3 }}
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
