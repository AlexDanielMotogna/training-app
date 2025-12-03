import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import {
  FitnessCenter as TrainingIcon,
  EmojiEvents as TrophyIcon,
  Group as TeamIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import { getUser } from '../services/userProfile';
import { useOrganization } from '../contexts';

export const Dashboard: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const currentUser = getUser();
  const { organization } = useOrganization();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(t('dashboard.goodMorning'));
    } else if (hour < 18) {
      setGreeting(t('dashboard.goodAfternoon'));
    } else {
      setGreeting(t('dashboard.goodEvening'));
    }
  }, [t]);

  if (!currentUser) {
    return null;
  }

  const isCoach = currentUser.role === 'coach';

  // Quick action cards for players
  const playerQuickActions = [
    {
      title: t('dashboard.myTraining'),
      description: t('dashboard.myTrainingDesc'),
      icon: <TrainingIcon fontSize="large" />,
      color: '#1976d2',
      path: '/training',
    },
    {
      title: t('dashboard.myStats'),
      description: t('dashboard.myStatsDesc'),
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#9c27b0',
      path: '/stats',
    },
    {
      title: t('dashboard.leaderboard'),
      description: t('dashboard.leaderboardDesc'),
      icon: <TrophyIcon fontSize="large" />,
      color: '#f57c00',
      path: '/leaderboard',
    },
    {
      title: t('dashboard.tests'),
      description: t('dashboard.testsDesc'),
      icon: <CheckIcon fontSize="large" />,
      color: '#388e3c',
      path: '/tests',
    },
  ];

  // Quick action cards for coaches
  const coachQuickActions = [
    {
      title: t('dashboard.team'),
      description: t('dashboard.teamDesc'),
      icon: <TeamIcon fontSize="large" />,
      color: '#1976d2',
      path: '/team',
    },
    {
      title: t('dashboard.reports'),
      description: t('dashboard.reportsDesc'),
      icon: <ReportsIcon fontSize="large" />,
      color: '#9c27b0',
      path: '/reports',
    },
    {
      title: t('dashboard.admin'),
      description: t('dashboard.adminDesc'),
      icon: <SettingsIcon fontSize="large" />,
      color: '#f57c00',
      path: '/admin',
    },
    {
      title: t('dashboard.trainingSessions'),
      description: t('dashboard.trainingSessionsDesc'),
      icon: <CalendarIcon fontSize="large" />,
      color: '#388e3c',
      path: '/training-sessions',
    },
  ];

  const quickActions = isCoach ? coachQuickActions : playerQuickActions;

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {greeting}, {currentUser.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {organization?.name || 'teamTraining'}
        </Typography>
      </Box>

      {/* Quick Actions Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: action.color,
                      color: 'white',
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {action.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Role-specific content */}
      <Grid container spacing={3}>
        {isCoach ? (
          <>
            {/* Coach: Team Overview */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{t('dashboard.teamOverview')}</Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowIcon />}
                      onClick={() => navigate('/team')}
                    >
                      {t('dashboard.viewAll')}
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Paper sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {organization?._count?.members || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('dashboard.totalMembers')}
                      </Typography>
                    </Paper>
                    <Paper sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {organization?._count?.teams || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('dashboard.totalTeams')}
                      </Typography>
                    </Paper>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Coach: Quick Stats */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('dashboard.quickActions')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    <ListItem button onClick={() => navigate('/org-settings')}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <SettingsIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={t('dashboard.orgSettings')}
                        secondary={t('dashboard.orgSettingsDesc')}
                      />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/admin')}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <TrainingIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={t('dashboard.managePlans')}
                        secondary={t('dashboard.managePlansDesc')}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            {/* Player: Training Progress */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('dashboard.trainingProgress')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('dashboard.weeklyProgress')}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        75%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 1 }} />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/training')}
                    endIcon={<ArrowIcon />}
                  >
                    {t('dashboard.continueTraining')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Player: Quick Stats */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('dashboard.myProgress')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Typography variant="h4">
                        {currentUser.jerseyNumber || '--'}
                      </Typography>
                      <Typography variant="body2">
                        {t('dashboard.jerseyNumber')}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="h4">
                        {currentUser.position || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {t('dashboard.position')}
                      </Typography>
                    </Paper>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
