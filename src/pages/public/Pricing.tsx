import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useI18n } from '../../i18n/I18nProvider';
import { Footer } from '../../components/public/Footer';

interface PlanFeature {
  name: string;
  free: boolean | string;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Team members', free: '15', starter: '50', pro: '200', enterprise: 'Unlimited' },
  { name: 'Coaches', free: '2', starter: '5', pro: '20', enterprise: 'Unlimited' },
  { name: 'Teams', free: '1', starter: '3', pro: '10', enterprise: 'Unlimited' },
  { name: 'Storage', free: '1 GB', starter: '10 GB', pro: '50 GB', enterprise: '500 GB' },
  { name: 'Custom exercises', free: '20', starter: '100', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Video library', free: '10', starter: '50', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Drills library', free: '10', starter: '50', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Workout templates', free: '5', starter: '25', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Basic analytics', free: true, starter: true, pro: true, enterprise: true },
  { name: 'Advanced analytics', free: false, starter: true, pro: true, enterprise: true },
  { name: 'AI insights', free: false, starter: false, pro: true, enterprise: true },
  { name: 'Custom branding', free: false, starter: 'Logo only', pro: 'Full', enterprise: 'White-label' },
  { name: 'Custom domain', free: false, starter: false, pro: true, enterprise: true },
  { name: 'API access', free: false, starter: false, pro: true, enterprise: true },
  { name: 'SSO/SAML', free: false, starter: false, pro: false, enterprise: true },
  { name: 'Data export', free: false, starter: 'CSV', pro: 'CSV + API', enterprise: 'Full' },
  { name: 'Support', free: 'Community', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
];

const FAQS = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.',
  },
  {
    question: 'What happens when I reach my limits?',
    answer: 'We\'ll notify you when you\'re approaching your limits. You can upgrade your plan or remove some items to stay within your current plan.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact us for a full refund.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes, you can save 20% by choosing annual billing instead of monthly.',
  },
  {
    question: 'What sports are supported?',
    answer: 'We support American Football, Basketball, Soccer, Volleyball, Handball, Rugby, Ice Hockey, Baseball, and Lacrosse. Each sport has its own positions, age categories, and metrics.',
  },
];

export const Pricing: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useI18n();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(false);

  const getPrice = (monthly: number) => {
    if (annual) {
      return Math.round(monthly * 0.8); // 20% discount
    }
    return monthly;
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
      ) : (
        <CancelIcon sx={{ color: 'grey.600', fontSize: 20 }} />
      );
    }
    return <Typography variant="body2" sx={{ color: 'grey.300' }}>{value}</Typography>;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'white', overflow: 'hidden' }}>
      {/* Navigation - Same as Landing */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          bgcolor: 'rgba(10, 10, 10, 0.7)',
          backdropFilter: 'blur(12px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: 64,
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                '&:hover .logo-icon': {
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => navigate('/')}
            >
              <Box
                className="logo-icon"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease',
                }}
              >
                <FitnessCenterIcon sx={{ color: 'white', fontSize: 18 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  letterSpacing: '-0.025em',
                  background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TeamTrainer
              </Typography>
            </Box>

            {/* Desktop Nav */}
            {!isMobile && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Button
                  onClick={() => navigate('/')}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    px: 2.5,
                    py: 1,
                    textTransform: 'none',
                    '&:hover': {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  Home
                </Button>
                <Button
                  sx={{
                    color: 'white',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    px: 2.5,
                    py: 1,
                    textTransform: 'none',
                    bgcolor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {t('landing.nav.pricing')}
                </Button>

                <Box sx={{ width: 24 }} />

                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    px: 2.5,
                    py: 1,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  {t('landing.nav.login')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/signup')}
                  sx={{
                    bgcolor: 'white',
                    color: '#0a0a0a',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 4px 12px rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  {t('landing.nav.getStarted')}
                </Button>
              </Stack>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{ color: 'white' }}
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Box>
        </Container>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              bgcolor: 'rgba(10, 10, 10, 0.98)',
              py: 3,
              px: 2,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Stack spacing={2}>
              <Button
                fullWidth
                onClick={() => navigate('/')}
                sx={{ color: 'white', justifyContent: 'flex-start' }}
              >
                Home
              </Button>
              <Button
                fullWidth
                sx={{ color: 'white', justifyContent: 'flex-start', bgcolor: 'rgba(255,255,255,0.05)' }}
              >
                {t('landing.nav.pricing')}
              </Button>
              <Box sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{ mb: 2, borderColor: 'grey.700', color: 'white' }}
                >
                  {t('landing.nav.login')}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/signup')}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                >
                  {t('landing.nav.getStarted')}
                </Button>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 16, md: 20 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(15,12,22,1) 100%)',
        }}
      >
        {/* Gradient Orb */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              color: '#a78bfa',
              fontWeight: 600,
              letterSpacing: 2,
              mb: 2,
            }}
          >
            SIMPLE PRICING
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #ffffff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('pricing.title')}
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'grey.400', mb: 4, maxWidth: 500, mx: 'auto' }}
          >
            {t('pricing.subtitle')}
          </Typography>

          {/* Annual Toggle */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              px: 3,
              py: 1.5,
            }}
          >
            <Typography sx={{ color: annual ? 'grey.500' : 'white', fontWeight: 500 }}>
              Monthly
            </Typography>
            <Switch
              checked={annual}
              onChange={(e) => setAnnual(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#6366f1',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#6366f1',
                },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: annual ? 'white' : 'grey.500', fontWeight: 500 }}>
                {t('pricing.annual')}
              </Typography>
              <Box
                sx={{
                  bgcolor: '#10b981',
                  color: 'white',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {t('pricing.save20')}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 4, md: 8 },
          background: 'linear-gradient(180deg, rgba(15,12,22,1) 0%, rgba(20,15,30,1) 50%, rgba(15,12,22,1) 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="stretch">
            {/* Free */}
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: 'white' }}>
                    Free
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, minHeight: 40, color: 'grey.400' }}>
                    {t('pricing.free.desc')}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 3, color: 'white' }}>
                    $0
                    <Typography component="span" variant="body1" sx={{ color: 'grey.500' }}>
                      /{t('pricing.month')}
                    </Typography>
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 4, flexGrow: 1 }}>
                    <Feature text="15 team members" />
                    <Feature text="2 coaches" />
                    <Feature text="1 team" />
                    <Feature text="1 GB storage" />
                    <Feature text="Basic analytics" />
                    <Feature text="Community support" />
                  </Stack>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/signup')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    {t('pricing.getStarted')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Starter - Popular */}
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.25) 100%)',
                  border: '2px solid #6366f1',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(99,102,241,0.3)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: '#6366f1',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" fontWeight={600} sx={{ color: 'white' }}>
                    {t('pricing.popular')}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: 'white' }}>
                    Starter
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, minHeight: 40, color: 'grey.300' }}>
                    {t('pricing.starter.desc')}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 3, color: 'white' }}>
                    ${getPrice(29)}
                    <Typography component="span" variant="body1" sx={{ color: 'grey.400' }}>
                      /{t('pricing.month')}
                    </Typography>
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 4, flexGrow: 1 }}>
                    <Feature text="50 team members" />
                    <Feature text="5 coaches" />
                    <Feature text="3 teams" />
                    <Feature text="10 GB storage" />
                    <Feature text="Advanced analytics" />
                    <Feature text="Email support" />
                  </Stack>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/signup?plan=starter')}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5558e8 0%, #7c4fe0 100%)',
                      },
                    }}
                  >
                    {t('pricing.startTrial')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Pro */}
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: 'white' }}>
                    Pro
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, minHeight: 40, color: 'grey.400' }}>
                    {t('pricing.pro.desc')}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 3, color: 'white' }}>
                    ${getPrice(79)}
                    <Typography component="span" variant="body1" sx={{ color: 'grey.500' }}>
                      /{t('pricing.month')}
                    </Typography>
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 4, flexGrow: 1 }}>
                    <Feature text="200 team members" />
                    <Feature text="20 coaches" />
                    <Feature text="10 teams" />
                    <Feature text="50 GB storage" />
                    <Feature text="AI insights" />
                    <Feature text="Priority support" />
                  </Stack>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/signup?plan=pro')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    {t('pricing.startTrial')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Enterprise */}
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: 'white' }}>
                    Enterprise
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, minHeight: 40, color: 'grey.400' }}>
                    {t('pricing.enterprise.desc')}
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 3, color: 'white' }}>
                    {t('pricing.custom')}
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 4, flexGrow: 1 }}>
                    <Feature text="Unlimited members" />
                    <Feature text="Unlimited coaches" />
                    <Feature text="Unlimited teams" />
                    <Feature text="500 GB storage" />
                    <Feature text="White-label" />
                    <Feature text="Dedicated support" />
                  </Stack>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => window.location.href = 'mailto:sales@teamtrainer.com'}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    {t('pricing.contactSales')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Feature Comparison Table */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, rgba(15,12,22,1) 0%, rgba(12,12,14,1) 50%, rgba(10,10,10,1) 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#6366f1',
              fontWeight: 600,
              letterSpacing: 2,
              mb: 2,
            }}
          >
            DETAILED COMPARISON
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 6,
              color: 'white',
            }}
          >
            {t('pricing.compare')}
          </Typography>

          <TableContainer
            sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'grey.400', borderColor: 'rgba(255,255,255,0.1)' }}>
                    {t('pricing.feature')}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'grey.400', borderColor: 'rgba(255,255,255,0.1)' }}>
                    Free
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#a5b4fc', borderColor: 'rgba(255,255,255,0.1)' }}>
                    Starter
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'grey.400', borderColor: 'rgba(255,255,255,0.1)' }}>
                    Pro
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'grey.400', borderColor: 'rgba(255,255,255,0.1)' }}>
                    Enterprise
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PLAN_FEATURES.map((feature, index) => (
                  <TableRow
                    key={feature.name}
                    sx={{
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                      bgcolor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}
                  >
                    <TableCell sx={{ color: 'grey.300', borderColor: 'rgba(255,255,255,0.05)' }}>
                      {feature.name}
                    </TableCell>
                    <TableCell align="center" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {renderFeatureValue(feature.free)}
                    </TableCell>
                    <TableCell align="center" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {renderFeatureValue(feature.starter)}
                    </TableCell>
                    <TableCell align="center" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {renderFeatureValue(feature.pro)}
                    </TableCell>
                    <TableCell align="center" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {renderFeatureValue(feature.enterprise)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* FAQs */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(12,12,14,1) 50%, rgba(10,10,10,1) 100%)',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#6366f1',
              fontWeight: 600,
              letterSpacing: 2,
              mb: 2,
            }}
          >
            GOT QUESTIONS?
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 6,
              color: 'white',
            }}
          >
            {t('pricing.faq')}
          </Typography>

          {FAQS.map((faq, index) => (
            <Accordion
              key={index}
              elevation={0}
              sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 1.5,
                '&:before': { display: 'none' },
                borderRadius: '8px !important',
                overflow: 'hidden',
                '&.Mui-expanded': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(99,102,241,0.3)',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'grey.400' }} />}
                sx={{
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                }}
              >
                <Typography fontWeight={600} sx={{ color: 'white' }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: 'grey.400', lineHeight: 1.7 }}>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Smooth transition overlay from dark to gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            background: 'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(10,10,10,0.7) 30%, rgba(10,10,10,0) 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
        {/* Background Gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            opacity: 0.9,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2rem', md: '3rem' },
              letterSpacing: '-1px',
            }}
          >
            {t('pricing.cta.title')}
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 5, opacity: 0.9, maxWidth: 500, mx: 'auto' }}
          >
            {t('pricing.cta.subtitle')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{
              bgcolor: 'white',
              color: '#6366f1',
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)',
              },
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
          >
            {t('pricing.cta.button')}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

// Helper component
const Feature: React.FC<{ text: string }> = ({ text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{text}</Typography>
  </Box>
);
