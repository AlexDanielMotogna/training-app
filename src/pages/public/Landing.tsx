import React from 'react';
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
  useTheme,
  alpha,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GroupsIcon from '@mui/icons-material/Groups';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';
import SportsRugbyIcon from '@mui/icons-material/SportsRugby';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useI18n } from '../../i18n/I18nProvider';

const FEATURES = [
  {
    icon: FitnessCenterIcon,
    titleKey: 'landing.features.training.title',
    descKey: 'landing.features.training.desc',
  },
  {
    icon: GroupsIcon,
    titleKey: 'landing.features.team.title',
    descKey: 'landing.features.team.desc',
  },
  {
    icon: AnalyticsIcon,
    titleKey: 'landing.features.analytics.title',
    descKey: 'landing.features.analytics.desc',
  },
];

const SPORTS = [
  { icon: SportsFootballIcon, name: 'American Football' },
  { icon: SportsBasketballIcon, name: 'Basketball' },
  { icon: SportsSoccerIcon, name: 'Soccer' },
  { icon: SportsVolleyballIcon, name: 'Volleyball' },
  { icon: SportsHandballIcon, name: 'Handball' },
  { icon: SportsRugbyIcon, name: 'Rugby' },
  { icon: SportsHockeyIcon, name: 'Ice Hockey' },
  { icon: SportsBaseballIcon, name: 'Baseball' },
  { icon: SportsCricketIcon, name: 'Lacrosse' },
];

const PLAN_FEATURES = {
  free: [
    '15 team members',
    '2 coaches',
    '1 team',
    'Basic analytics',
    'Exercise library',
  ],
  starter: [
    '50 team members',
    '5 coaches',
    '3 teams',
    'Advanced analytics',
    'Custom exercises',
    'Video library',
    'Email support',
  ],
  pro: [
    '200 team members',
    '20 coaches',
    '10 teams',
    'Full analytics suite',
    'AI insights',
    'Custom branding',
    'API access',
    'Priority support',
  ],
};

export const Landing: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useI18n();

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
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700} color="primary">
            TeamTrainer
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="text"
            onClick={() => navigate('/pricing')}
          >
            {t('landing.nav.pricing')}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
          >
            {t('landing.nav.login')}
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/signup')}
          >
            {t('landing.nav.getStarted')}
          </Button>
        </Stack>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                fontWeight={800}
                sx={{ mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
              >
                {t('landing.hero.title')}
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, lineHeight: 1.6 }}
              >
                {t('landing.hero.subtitle')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/signup')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {t('landing.hero.cta')}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/pricing')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {t('landing.hero.viewPricing')}
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 4,
                  p: 4,
                  boxShadow: 6,
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  {t('landing.hero.demoTitle')}
                </Typography>
                <Box
                  component="img"
                  src="/demo-dashboard.png"
                  alt="Dashboard preview"
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Placeholder if no image */}
                <Box
                  sx={{
                    width: '100%',
                    height: 250,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sports Section */}
      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            {t('landing.sports.title')}
          </Typography>
          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            {SPORTS.map((sport) => (
              <Box
                key={sport.name}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  opacity: 0.7,
                  transition: 'all 0.2s',
                  '&:hover': { opacity: 1, transform: 'scale(1.1)' },
                }}
              >
                <sport.icon sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {sport.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            sx={{ mb: 2 }}
          >
            {t('landing.features.title')}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            {t('landing.features.subtitle')}
          </Typography>
          <Grid container spacing={4}>
            {FEATURES.map((feature) => (
              <Grid item xs={12} md={4} key={feature.titleKey}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <feature.icon sx={{ fontSize: 30, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                      {t(feature.titleKey as any)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {t(feature.descKey as any)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Preview */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            sx={{ mb: 2 }}
          >
            {t('landing.pricing.title')}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6 }}
          >
            {t('landing.pricing.subtitle')}
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {/* Free Plan */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    Free
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
                    $0
                    <Typography component="span" variant="body1" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 4 }}>
                    {PLAN_FEATURES.free.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/signup')}
                  >
                    {t('landing.pricing.getStarted')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Starter Plan */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
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
                    {t('landing.pricing.popular')}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    Starter
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
                    $29
                    <Typography component="span" variant="body1" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 4 }}>
                    {PLAN_FEATURES.starter.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/signup?plan=starter')}
                  >
                    {t('landing.pricing.startTrial')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Pro Plan */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    Pro
                  </Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
                    $79
                    <Typography component="span" variant="body1" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 4 }}>
                    {PLAN_FEATURES.pro.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/signup?plan=pro')}
                  >
                    {t('landing.pricing.startTrial')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="text"
              onClick={() => navigate('/pricing')}
              endIcon={<ArrowForwardIcon />}
            >
              {t('landing.pricing.viewAll')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            fontWeight={700}
            textAlign="center"
            sx={{ mb: 2 }}
          >
            {t('landing.cta.title')}
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            sx={{ mb: 4, opacity: 0.9 }}
          >
            {t('landing.cta.subtitle')}
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              {t('landing.cta.button')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          px: 3,
          bgcolor: 'grey.900',
          color: 'grey.400',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FitnessCenterIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700} color="white">
                  TeamTrainer
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t('landing.footer.tagline')}
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" color="white" sx={{ mb: 2 }}>
                {t('landing.footer.product')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.features')}
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.pricing')}
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.integrations')}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" color="white" sx={{ mb: 2 }}>
                {t('landing.footer.company')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.about')}
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.blog')}
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.careers')}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" color="white" sx={{ mb: 2 }}>
                {t('landing.footer.legal')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.privacy')}
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.terms')}
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.cookies')}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" color="white" sx={{ mb: 2 }}>
                {t('landing.footer.support')}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.help')}
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.contact')}
                </Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.status')}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: 1,
              borderColor: 'grey.800',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">
              © {new Date().getFullYear()} TeamTrainer. {t('landing.footer.rights')}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
