import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useI18n } from '../i18n/I18nProvider';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ForgotPasswordDialog } from '../components/ForgotPasswordDialog';
import { calculateAge } from '../services/userProfile';
import { authService } from '../services/api';
import type { Position } from '../types/exercise';
import { toastService } from '../services/toast';
import { backgrounds, gradients, brand, borders, radius, text } from '../designTokens';

// Dark input styles matching the Landing page
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
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
    '&::placeholder': {
      color: 'rgba(255,255,255,0.5)',
      opacity: 1,
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
  backgroundColor: 'rgba(20,20,25,0.8)',
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
const positions: Position[] = ['RB', 'WR', 'LB', 'OL', 'DB', 'QB', 'DL', 'TE', 'K/P'];

export const Auth: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [position, setPosition] = useState<Position>('RB');
  const [role, setRole] = useState<'player' | 'coach'>('player');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [coachCode, setCoachCode] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // Validate password confirmation
        if (password !== confirmPassword) {
          setError(t('auth.passwordMismatch'));
          toastService.validationError(t('auth.passwordMismatch'));
          setLoading(false);
          return;
        }

        // Calculate age from birth date
        const calculatedAge = birthDate ? calculateAge(birthDate) : 0;

        // SIGNUP via backend API
        await authService.signup({
          email,
          password,
          name,
          role,
          coachCode: role === 'coach' ? coachCode : undefined,
          jerseyNumber: role === 'player' && jerseyNumber && jerseyNumber !== '--'
            ? Number(jerseyNumber)
            : undefined,
          birthDate: birthDate || undefined,
          age: calculatedAge || undefined,
          weightKg: weightKg ? Number(weightKg) : undefined,
          heightCm: heightCm ? Number(heightCm) : undefined,
          position: role === 'player' ? position : undefined,
          sex,
        });
        toastService.success(`Welcome, ${name}! Account created successfully`);
      } else {
        // LOGIN via backend API
        const response = await authService.login({ email, password });
        toastService.loginSuccess(name || email);
      }

      // Redirect to dashboard (using window.location to ensure reload and proper state update)
      window.location.href = '/dashboard';
    } catch (err: any) {
      const errorMsg = err.message || (isSignup ? 'Failed to create account' : 'Failed to login');
      setError(errorMsg);
      toastService.authError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isValid = isSignup
    ? role === 'coach'
      ? name && email && password.length >= 6 && confirmPassword && password === confirmPassword && coachCode && birthDate && weightKg && heightCm
      : name && email && password.length >= 6 && confirmPassword && password === confirmPassword && birthDate && weightKg && heightCm
    : email && password;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: backgrounds.dark.primary,
        p: 2,
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

      <Box sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}>
        <LanguageSwitcher />
      </Box>

      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mb: 4,
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1,
        }}
        onClick={() => navigate('/')}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FitnessCenterIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
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

      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          backgroundColor: backgrounds.dark.card,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${borders.dark.light}`,
          borderRadius: radius.sm,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            align="center"
            fontWeight={600}
            sx={{ mb: 1, color: text.dark.primary }}
          >
            {isSignup ? t('auth.createAccount') : t('auth.welcomeBack')}
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 3, color: text.dark.secondary }}
          >
            {isSignup ? 'Join your team and start training' : 'Sign in to continue to your dashboard'}
          </Typography>

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

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {isSignup && (
              <>
                <TextField
                  label={t('auth.name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  sx={darkInputStyles}
                />

                <FormControl required fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.8)', '&.Mui-focused': { color: brand.primary.light } }}>
                    {t('auth.role')}
                  </InputLabel>
                  <Select
                    value={role}
                    label={t('auth.role')}
                    onChange={(e) => setRole(e.target.value as 'player' | 'coach')}
                    sx={darkSelectStyles}
                    MenuProps={selectMenuProps}
                  >
                    <MenuItem value="player">{t('auth.rolePlayer')}</MenuItem>
                    <MenuItem value="coach">{t('auth.roleCoach')}</MenuItem>
                  </Select>
                </FormControl>

                {role === 'coach' && (
                  <TextField
                    label="Coach Code"
                    value={coachCode}
                    onChange={(e) => setCoachCode(e.target.value)}
                    required
                    fullWidth
                    placeholder="Enter the code provided by administrator"
                    helperText="Contact administrator if you don't have the coach code"
                    sx={darkInputStyles}
                  />
                )}

                {/* Player-specific fields */}
                {role === 'player' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      label={t('auth.jerseyNumber')}
                      value={jerseyNumber}
                      onChange={(e) => setJerseyNumber(e.target.value)}
                      placeholder="--"
                      helperText={t('auth.jerseyNumberOptional')}
                      sx={darkInputStyles}
                    />

                    <FormControl required fullWidth>
                      <InputLabel sx={{ color: 'rgba(255,255,255,0.8)', '&.Mui-focused': { color: brand.primary.light } }}>
                        {t('auth.position')}
                      </InputLabel>
                      <Select
                        value={position}
                        label={t('auth.position')}
                        onChange={(e) => setPosition(e.target.value as Position)}
                        sx={darkSelectStyles}
                        MenuProps={selectMenuProps}
                      >
                        {positions.map((pos) => (
                          <MenuItem key={pos} value={pos}>
                            {t(`position.${pos}` as any)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* Common fields for both players and coaches */}
                <TextField
                  label={t('auth.birthDate')}
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: new Date().toISOString().split('T')[0],
                    min: new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]
                  }}
                  sx={darkInputStyles}
                />

                <FormControl required fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.8)', '&.Mui-focused': { color: brand.primary.light } }}>
                    {t('auth.gender')}
                  </InputLabel>
                  <Select
                    value={sex}
                    label={t('auth.gender')}
                    onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                    sx={darkSelectStyles}
                    MenuProps={selectMenuProps}
                  >
                    <MenuItem value="male">{t('auth.male')}</MenuItem>
                    <MenuItem value="female">{t('auth.female')}</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    label={t('auth.weightKg')}
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                    required
                    inputProps={{ min: 50, max: 200 }}
                    sx={darkInputStyles}
                  />

                  <TextField
                    label={t('auth.heightCm')}
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                    required
                    inputProps={{ min: 150, max: 220 }}
                    sx={darkInputStyles}
                  />
                </Box>
              </>
            )}

            <TextField
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={darkInputStyles}
            />

            <TextField
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              inputProps={{ minLength: 6 }}
              error={isSignup && password.length > 0 && password.length < 6}
              helperText={
                isSignup
                  ? password.length > 0 && password.length < 6
                    ? "Password must be at least 6 characters"
                    : "Minimum 6 characters"
                  : ""
              }
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

            {isSignup && (
              <TextField
                label={t('auth.confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
                error={confirmPassword !== '' && password !== confirmPassword}
                helperText={confirmPassword !== '' && password !== confirmPassword ? t('auth.passwordMismatch') : ''}
                sx={darkInputStyles}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: text.dark.secondary }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!isValid || loading}
              fullWidth
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
              sx={{
                mt: 1,
                py: 1.5,
                background: gradients.primary,
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  background: gradients.primaryHover,
                },
                '&.Mui-disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              {loading ? (isSignup ? 'Creating account...' : 'Logging in...') : (isSignup ? t('auth.signup') : t('auth.login'))}
            </Button>

            {!isSignup && (
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: brand.primary.light,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {t('auth.forgotPassword')}
                </Link>
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ color: text.dark.secondary }}>
                {isSignup ? t('auth.haveAccount') : t('auth.noAccount')}
                {' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  sx={{
                    cursor: 'pointer',
                    color: brand.primary.light,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {isSignup ? t('auth.loginLink') : t('auth.signupLink')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </Box>
  );
};
