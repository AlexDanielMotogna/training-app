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
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useI18n } from '../../i18n/I18nProvider';

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
        <CheckCircleIcon sx={{ color: 'success.main' }} />
      ) : (
        <CancelIcon sx={{ color: 'grey.400' }} />
      );
    }
    return <Typography variant="body2">{value}</Typography>;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700} color="primary">
            TeamTrainer
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            {t('landing.nav.login')}
          </Button>
          <Button variant="contained" onClick={() => navigate('/signup')}>
            {t('landing.nav.getStarted')}
          </Button>
        </Stack>
      </Box>

      {/* Hero */}
      <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight={800} sx={{ mb: 2 }}>
            {t('pricing.title')}
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            {t('pricing.subtitle')}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={annual}
                onChange={(e) => setAnnual(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{t('pricing.annual')}</Typography>
                <Box
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {t('pricing.save20')}
                </Box>
              </Box>
            }
          />
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={3} alignItems="stretch">
          {/* Free */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  Free
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                  {t('pricing.free.desc')}
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
                  $0
                  <Typography component="span" variant="body1" color="text.secondary">
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
                >
                  {t('pricing.getStarted')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Starter */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: 2,
                borderColor: 'primary.main',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  {t('pricing.popular')}
                </Typography>
              </Box>
              <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  Starter
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                  {t('pricing.starter.desc')}
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
                  ${getPrice(29)}
                  <Typography component="span" variant="body1" color="text.secondary">
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
                >
                  {t('pricing.startTrial')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Pro */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  Pro
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                  {t('pricing.pro.desc')}
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
                  ${getPrice(79)}
                  <Typography component="span" variant="body1" color="text.secondary">
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
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  Enterprise
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                  {t('pricing.enterprise.desc')}
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
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
                >
                  {t('pricing.contactSales')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Feature Comparison Table */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 6 }}>
            {t('pricing.compare')}
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>{t('pricing.feature')}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Free</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Starter
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Pro</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Enterprise</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PLAN_FEATURES.map((feature) => (
                  <TableRow key={feature.name} hover>
                    <TableCell>{feature.name}</TableCell>
                    <TableCell align="center">{renderFeatureValue(feature.free)}</TableCell>
                    <TableCell align="center">{renderFeatureValue(feature.starter)}</TableCell>
                    <TableCell align="center">{renderFeatureValue(feature.pro)}</TableCell>
                    <TableCell align="center">{renderFeatureValue(feature.enterprise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* FAQs */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 6 }}>
            {t('pricing.faq')}
          </Typography>
          {FAQS.map((faq, index) => (
            <Accordion key={index} elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* CTA */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            {t('pricing.cta.title')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            {t('pricing.cta.subtitle')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 6,
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            {t('pricing.cta.button')}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: 'grey.900', color: 'grey.500', textAlign: 'center' }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} TeamTrainer. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

// Helper component
const Feature: React.FC<{ text: string }> = ({ text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
    <Typography variant="body2">{text}</Typography>
  </Box>
);
