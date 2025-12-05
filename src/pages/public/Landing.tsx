import React, { useState, useEffect } from 'react';
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
  Avatar,
  IconButton,
  Chip,
  useMediaQuery,
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useI18n } from '../../i18n/I18nProvider';

// Hero images from Unsplash (free to use)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1461896836934- voices-from-above-69a7f3a21a3a?w=1920&q=80', // Soccer
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80', // Soccer team
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&q=80', // Basketball
  'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1920&q=80', // Football
];

const FEATURES = [
  {
    icon: AssignmentIcon,
    titleKey: 'landing.features.plans.title',
    descKey: 'landing.features.plans.desc',
    color: '#6366f1',
  },
  {
    icon: CalendarMonthIcon,
    titleKey: 'landing.features.schedule.title',
    descKey: 'landing.features.schedule.desc',
    color: '#f59e0b',
  },
  {
    icon: AnalyticsIcon,
    titleKey: 'landing.features.analytics.title',
    descKey: 'landing.features.analytics.desc',
    color: '#10b981',
  },
  {
    icon: GroupsIcon,
    titleKey: 'landing.features.team.title',
    descKey: 'landing.features.team.desc',
    color: '#ec4899',
  },
  {
    icon: EmojiEventsIcon,
    titleKey: 'landing.features.leaderboard.title',
    descKey: 'landing.features.leaderboard.desc',
    color: '#8b5cf6',
  },
  {
    icon: NotificationsActiveIcon,
    titleKey: 'landing.features.notifications.title',
    descKey: 'landing.features.notifications.desc',
    color: '#06b6d4',
  },
];

const SPORTS = [
  { icon: SportsFootballIcon, name: 'American Football', color: '#8B4513' },
  { icon: SportsBasketballIcon, name: 'Basketball', color: '#FF6B00' },
  { icon: SportsSoccerIcon, name: 'Soccer', color: '#00A36C' },
  { icon: SportsVolleyballIcon, name: 'Volleyball', color: '#FFD700' },
  { icon: SportsHandballIcon, name: 'Handball', color: '#FF4500' },
  { icon: SportsRugbyIcon, name: 'Rugby', color: '#228B22' },
  { icon: SportsHockeyIcon, name: 'Ice Hockey', color: '#4169E1' },
  { icon: SportsBaseballIcon, name: 'Baseball', color: '#DC143C' },
  { icon: SportsCricketIcon, name: 'Lacrosse', color: '#9932CC' },
];

// Athlete images for each sport (from Unsplash)
const ATHLETE_IMAGES = [
  'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=600&fit=crop', // American Football
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=600&fit=crop', // Basketball
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=600&fit=crop', // Soccer
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=600&fit=crop', // Volleyball
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=600&fit=crop', // Handball
  'https://images.unsplash.com/photo-1513028179155-324cfec2dc78?w=400&h=600&fit=crop', // Rugby
  'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=400&h=600&fit=crop', // Ice Hockey
  'https://images.unsplash.com/photo-1529013994172-7e3f7eaf7de7?w=400&h=600&fit=crop', // Baseball
  'https://images.unsplash.com/photo-1531415074968-7b2a7f6a6f1f?w=400&h=600&fit=crop', // Lacrosse
];

const STATS = [
  { value: '10,000+', label: 'Athletes Trained' },
  { value: '500+', label: 'Teams Worldwide' },
  { value: '50,000+', label: 'Workouts Completed' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const TESTIMONIALS = [
  {
    name: 'Marcus Johnson',
    role: 'Head Coach, FC Phoenix',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    text: 'TeamTrainer transformed how we manage our training programs. The analytics alone helped us improve our team\'s performance by 30%.',
    rating: 5,
  },
  {
    name: 'Sarah Martinez',
    role: 'Athletic Director, Tigers Academy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    text: 'Managing multiple teams across different sports used to be a nightmare. Now everything is centralized and our coaches love it.',
    rating: 5,
  },
  {
    name: 'Coach David Kim',
    role: 'Basketball Coach, Elite Hoops',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    text: 'The player progress tracking is incredible. Parents love the transparency and players are more motivated than ever.',
    rating: 5,
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Create Your Team',
    desc: 'Set up your organization, add your sport, and invite your coaching staff in minutes.',
    icon: GroupsIcon,
  },
  {
    step: 2,
    title: 'Build Training Plans',
    desc: 'Design custom workouts using our exercise library or create your own. Assign to players.',
    icon: AssignmentIcon,
  },
  {
    step: 3,
    title: 'Track & Analyze',
    desc: 'Monitor attendance, workout completion, and performance metrics in real-time.',
    icon: TrendingUpIcon,
  },
  {
    step: 4,
    title: 'Improve Performance',
    desc: 'Use AI-powered insights to optimize training and achieve better results.',
    icon: EmojiEventsIcon,
  },
];

const PLAN_FEATURES = {
  free: ['15 team members', '2 coaches', 'Basic analytics', 'Exercise library'],
  starter: ['50 team members', '5 coaches', 'Advanced analytics', 'Video library', 'Email support'],
  pro: ['200 team members', '20 coaches', 'AI insights', 'Custom branding', 'Priority support'],
};

export const Landing: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useI18n();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [hoveredSportIndex, setHoveredSportIndex] = useState<number | null>(null);

  // Rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'white', overflow: 'hidden' }}>
      {/* Navigation */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          py: 2,
          px: { xs: 2, md: 6 },
          bgcolor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FitnessCenterIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
                TeamTrainer
              </Typography>
            </Box>

            {/* Desktop Nav */}
            {!isMobile && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                  Features
                </Button>
                <Button sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}>
                  Sports
                </Button>
                <Button
                  onClick={() => navigate('/pricing')}
                  sx={{ color: 'grey.300', '&:hover': { color: 'white' } }}
                >
                  {t('landing.nav.pricing')}
                </Button>
                <Box sx={{ width: 1, height: 24, bgcolor: 'grey.800', mx: 2 }} />
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{ color: 'white' }}
                >
                  {t('landing.nav.login')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/signup')}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    px: 3,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5558e8 0%, #7c4fe0 100%)',
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
              <Button fullWidth sx={{ color: 'white', justifyContent: 'flex-start' }}>
                Features
              </Button>
              <Button fullWidth sx={{ color: 'white', justifyContent: 'flex-start' }}>
                Sports
              </Button>
              <Button
                fullWidth
                onClick={() => navigate('/pricing')}
                sx={{ color: 'white', justifyContent: 'flex-start' }}
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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          pt: 10,
          overflow: 'hidden',
        }}
      >
        {/* Background Image with Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.7) 50%, rgba(10,10,10,0.5) 100%)',
              zIndex: 1,
            },
          }}
        >
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
            alt="Sports Team Training"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.6,
              transition: 'opacity 1s ease-in-out',
            }}
          />
        </Box>

        {/* Animated Gradient Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) scale(1)' },
              '50%': { transform: 'translateY(-20px) scale(1.05)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={7}>
              <Box sx={{ maxWidth: 700 }}>
                <Chip
                  label="Now supporting 9+ sports"
                  sx={{
                    mb: 3,
                    bgcolor: 'rgba(99,102,241,0.2)',
                    color: '#a5b4fc',
                    fontWeight: 600,
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 3,
                    letterSpacing: '-2px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #ffffff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('landing.hero.title')}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'grey.400',
                    mb: 4,
                    lineHeight: 1.6,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    maxWidth: 600,
                  }}
                >
                  {t('landing.hero.subtitle')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/signup')}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      px: 4,
                      py: 1.75,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5558e8 0%, #7c4fe0 100%)',
                        boxShadow: '0 12px 40px rgba(99,102,241,0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {t('landing.hero.cta')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      px: 4,
                      py: 1.75,
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>

                {/* Trust Badges */}
                <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ color: 'grey.500', fontSize: 20 }} />
                    <Typography variant="body2" color="grey.500">
                      SOC 2 Compliant
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DevicesIcon sx={{ color: 'grey.500', fontSize: 20 }} />
                    <Typography variant="body2" color="grey.500">
                      Works on all devices
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon sx={{ color: 'grey.500', fontSize: 20 }} />
                    <Typography variant="body2" color="grey.500">
                      99.9% Uptime
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Dashboard Preview */}
            <Grid item xs={12} lg={5} sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                  },
                  transition: 'transform 0.5s ease',
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Fake Browser Header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f57' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#febc2e' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28c840' }} />
                  </Box>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80"
                    alt="Dashboard Preview"
                    sx={{
                      width: '100%',
                      display: 'block',
                    }}
                  />
                </Box>
                {/* Floating Stats Card */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 2,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    minWidth: 180,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Team Performance
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    +27%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    vs last month
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Scroll Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
              '50%': { transform: 'translateX(-50%) translateY(10px)' },
            },
          }}
        >
          <Typography variant="caption" color="grey.500">
            Scroll to explore
          </Typography>
          <Box
            sx={{
              width: 24,
              height: 40,
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: 12,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 4,
                height: 8,
                bgcolor: 'grey.500',
                borderRadius: 2,
                animation: 'scrollDown 1.5s infinite',
              },
              '@keyframes scrollDown': {
                '0%': { opacity: 1, top: 6 },
                '100%': { opacity: 0, top: 20 },
              },
            }}
          />
        </Box>
      </Box>

      {/* Stats & Sports Combined Section with Gradient */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 10, md: 14 },
          background: 'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(20,15,30,1) 30%, rgba(30,20,45,1) 70%, rgba(10,10,10,1) 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Stats */}
          <Grid container spacing={4} sx={{ mb: 12 }}>
            {STATS.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="grey.500">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Sports Section with Athlete Images */}
          <Box sx={{ position: 'relative' }}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: '#a78bfa',
                fontWeight: 600,
                letterSpacing: 2,
                mb: 2,
              }}
            >
              MULTI-SPORT PLATFORM
            </Typography>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontWeight: 800,
                mb: 2,
                letterSpacing: '-1px',
              }}
            >
              {t('landing.sports.title')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: 'grey.500',
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Each sport comes pre-configured with positions, age categories, and sport-specific metrics.
            </Typography>

            {/* Athletes Left Side (5 images) */}
            <Box
              sx={{
                position: 'absolute',
                left: { xs: -60, sm: -80, md: -120, lg: -180 },
                top: '50%',
                transform: 'translateY(-50%)',
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                gap: 3,
                zIndex: 0,
              }}
            >
              {ATHLETE_IMAGES.slice(0, 5).map((img, index) => (
                <Box
                  key={`left-${index}`}
                  sx={{
                    width: 120,
                    height: 160,
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: hoveredSportIndex === index ? SPORTS[index].color : 'rgba(255,255,255,0.1)',
                    opacity: hoveredSportIndex === null ? 0.4 : hoveredSportIndex === index ? 1 : 0.2,
                    transform: hoveredSportIndex === index ? 'scale(1.15) translateX(10px)' : 'scale(1)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: hoveredSportIndex === index
                      ? `drop-shadow(0 8px 24px ${SPORTS[index].color}60) brightness(1.2)`
                      : 'brightness(0.8)',
                    '&:hover': {
                      transform: 'scale(1.15) translateX(10px)',
                      opacity: 1,
                      filter: `drop-shadow(0 8px 24px ${SPORTS[index].color}60) brightness(1.2)`,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={SPORTS[index].name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Box>

            {/* Athletes Right Side (4 images) */}
            <Box
              sx={{
                position: 'absolute',
                right: { xs: -60, sm: -80, md: -120, lg: -180 },
                top: '50%',
                transform: 'translateY(-50%)',
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                gap: 3,
                zIndex: 0,
              }}
            >
              {ATHLETE_IMAGES.slice(5, 9).map((img, index) => {
                const sportIndex = index + 5;
                return (
                  <Box
                    key={`right-${index}`}
                    sx={{
                      width: 120,
                      height: 160,
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: hoveredSportIndex === sportIndex ? SPORTS[sportIndex].color : 'rgba(255,255,255,0.1)',
                      opacity: hoveredSportIndex === null ? 0.4 : hoveredSportIndex === sportIndex ? 1 : 0.2,
                      transform: hoveredSportIndex === sportIndex ? 'scale(1.15) translateX(-10px)' : 'scale(1)',
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      filter: hoveredSportIndex === sportIndex
                        ? `drop-shadow(0 8px 24px ${SPORTS[sportIndex].color}60) brightness(1.2)`
                        : 'brightness(0.8)',
                      '&:hover': {
                        transform: 'scale(1.15) translateX(-10px)',
                        opacity: 1,
                        filter: `drop-shadow(0 8px 24px ${SPORTS[sportIndex].color}60) brightness(1.2)`,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={SPORTS[sportIndex].name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                );
              })}
            </Box>

            {/* Sports Icons in Single Row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 3, sm: 4, md: 5, lg: 6 },
                flexWrap: 'wrap',
                maxWidth: 1100,
                mx: 'auto',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {SPORTS.map((sport, index) => (
                <Box
                  key={sport.name}
                  onMouseEnter={() => setHoveredSportIndex(index)}
                  onMouseLeave={() => setHoveredSportIndex(null)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.1)',
                      '& .sport-icon': {
                        color: sport.color,
                        filter: `drop-shadow(0 4px 12px ${sport.color}40)`,
                      },
                    },
                  }}
                >
                  <sport.icon
                    className="sport-icon"
                    sx={{
                      fontSize: { xs: 36, sm: 42, md: 48 },
                      color: 'grey.600',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'grey.600',
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                      fontWeight: 500,
                      transition: 'color 0.3s ease',
                      '.sport-icon:hover ~ &': {
                        color: 'grey.400',
                      },
                    }}
                  >
                    {sport.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'rgba(255,255,255,0.02)' }}>
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
            POWERFUL FEATURES
          </Typography>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 2,
              letterSpacing: '-1px',
            }}
          >
            {t('landing.features.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'grey.500',
              mb: 8,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            {t('landing.features.subtitle')}
          </Typography>

          <Grid container spacing={4}>
            {FEATURES.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: feature.color,
                      boxShadow: `0 20px 40px ${alpha(feature.color, 0.2)}`,
                      '& .feature-icon-box': {
                        bgcolor: alpha(feature.color, 0.2),
                        '& svg': { color: feature.color },
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      className="feature-icon-box"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <feature.icon sx={{ fontSize: 28, color: 'grey.400', transition: 'all 0.3s ease' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: 'white' }}>
                      {t(feature.titleKey as any)}
                    </Typography>
                    <Typography variant="body2" color="grey.500" sx={{ lineHeight: 1.7 }}>
                      {t(feature.descKey as any)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
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
            SIMPLE PROCESS
          </Typography>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 8,
              letterSpacing: '-1px',
            }}
          >
            How It Works
          </Typography>

          <Grid container spacing={4}>
            {HOW_IT_WORKS.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'rgba(99,102,241,0.1)',
                      border: '2px solid rgba(99,102,241,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      position: 'relative',
                    }}
                  >
                    <item.icon sx={{ fontSize: 36, color: '#6366f1' }} />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {item.step}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="grey.500" sx={{ lineHeight: 1.7 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'rgba(255,255,255,0.02)' }}>
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
            TESTIMONIALS
          </Typography>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 8,
              letterSpacing: '-1px',
            }}
          >
            Trusted by Coaches Worldwide
          </Typography>

          <Grid container spacing={4}>
            {TESTIMONIALS.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <FormatQuoteIcon
                      sx={{
                        position: 'absolute',
                        top: -20,
                        left: 24,
                        fontSize: 48,
                        color: '#6366f1',
                        opacity: 0.5,
                      }}
                    />
                    <Stack direction="row" spacing={0.5} sx={{ mb: 3 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} sx={{ fontSize: 20, color: '#fbbf24' }} />
                      ))}
                    </Stack>
                    <Typography
                      variant="body1"
                      sx={{ mb: 4, color: 'grey.300', lineHeight: 1.8, fontStyle: 'italic' }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        sx={{ width: 48, height: 48 }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="caption" color="grey.500">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Preview */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
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
            SIMPLE PRICING
          </Typography>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 2,
              letterSpacing: '-1px',
            }}
          >
            {t('landing.pricing.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'grey.500',
              mb: 8,
            }}
          >
            {t('landing.pricing.subtitle')}
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {/* Free Plan */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    Free
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ mb: 3 }}>
                    $0
                    <Typography component="span" variant="body1" color="grey.500">
                      /month
                    </Typography>
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {PLAN_FEATURES.free.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                        <Typography variant="body2" color="grey.400">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
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
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                  border: '2px solid #6366f1',
                  position: 'relative',
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
                  <Typography variant="caption" fontWeight={600}>
                    {t('landing.pricing.popular')}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    Starter
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ mb: 3 }}>
                    $29
                    <Typography component="span" variant="body1" color="grey.500">
                      /month
                    </Typography>
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {PLAN_FEATURES.starter.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                        <Typography variant="body2" color="grey.300">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
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
                    {t('landing.pricing.startTrial')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Pro Plan */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    Pro
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ mb: 3 }}>
                    $79
                    <Typography component="span" variant="body1" color="grey.500">
                      /month
                    </Typography>
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {PLAN_FEATURES.pro.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
                        <Typography variant="body2" color="grey.400">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
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
              sx={{ color: '#6366f1' }}
            >
              {t('landing.pricing.viewAll')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            opacity: 0.9,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2rem', md: '3rem' },
              letterSpacing: '-1px',
            }}
          >
            {t('landing.cta.title')}
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 5, opacity: 0.9, maxWidth: 500, mx: 'auto' }}
          >
            {t('landing.cta.subtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
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
              {t('landing.cta.button')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/pricing')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 2,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              View Pricing
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 8,
          px: 3,
          bgcolor: '#050505',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FitnessCenterIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h5" fontWeight={800}>
                  TeamTrainer
                </Typography>
              </Box>
              <Typography variant="body2" color="grey.500" sx={{ mb: 3, maxWidth: 300 }}>
                {t('landing.footer.tagline')}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: '#1DA1F2' } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: '#0A66C2' } }}>
                  <LinkedInIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: 'grey.500', '&:hover': { color: '#E4405F' } }}>
                  <InstagramIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                {t('landing.footer.product')}
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.features')}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/pricing')}>
                  {t('landing.footer.pricing')}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.integrations')}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                {t('landing.footer.company')}
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.about')}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.blog')}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.careers')}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                {t('landing.footer.legal')}
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.privacy')}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.terms')}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.cookies')}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                {t('landing.footer.support')}
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.help')}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.contact')}
                </Typography>
                <Typography variant="body2" color="grey.500" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {t('landing.footer.status')}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 8,
              pt: 4,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="grey.600">
              © {new Date().getFullYear()} TeamTrainer. {t('landing.footer.rights')}
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography variant="body2" color="grey.600" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.400' } }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" color="grey.600" sx={{ cursor: 'pointer', '&:hover': { color: 'grey.400' } }}>
                Terms of Service
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
