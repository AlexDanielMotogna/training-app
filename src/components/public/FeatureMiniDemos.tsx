import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Chip, Badge, keyframes } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

// Keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-15px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const growWidth = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const scaleIn = keyframes`
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

// Real app workout type colors
const workoutTypeColors = {
  coach: '#4caf50',      // Green for team workouts
  player: '#ffc107',     // Yellow for free sessions
  team: '#ff9800',       // Orange for team sessions
  personal: '#9c27b0',   // Purple for personal sessions
};

// 1. Training Plans Mini Demo - matches PlanCard from MyTraining
export const TrainingPlansMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setShowCard(false);
      setTimeout(() => setShowCard(true), 100);
    } else {
      setShowCard(false);
    }
  }, [isHovered]);

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(255,255,255,0.05)',
      borderRadius: 1.5,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {showCard && (
        <Box sx={{ animation: `${fadeIn} 0.4s ease-out` }}>
          {/* Gradient header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 1.5,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>
              Strength Plan
            </Typography>
            <Chip
              label="Week 3/8"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>

          {/* Exercise list */}
          <Box sx={{ px: 1.5, py: 1 }}>
            {['Back Squat', 'Bench Press'].map((exercise, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: i === 0 ? 0.75 : 0,
                  animation: `${fadeIn} 0.3s ease-out ${i * 0.15}s both`
                }}
              >
                <Box sx={{
                  width: 30,
                  height: 20,
                  bgcolor: '#2196F3',
                  borderRadius: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FitnessCenterIcon sx={{ fontSize: 12, color: 'white' }} />
                </Box>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: 'white', flex: 1 }}>
                  {exercise}
                </Typography>
                <Chip label="Compound" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }} />
                <Chip label="4 sets" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
              </Box>
            ))}
            <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', mt: 1 }}>
              Last used: 2 days ago
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// 2. Session Scheduling Mini Demo - matches TrainingSessions cards
export const SchedulingMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [showSessions, setShowSessions] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setShowSessions(false);
      setTimeout(() => setShowSessions(true), 100);
    } else {
      setShowSessions(false);
    }
  }, [isHovered]);

  const sessions = [
    { title: 'Team Training', time: '18:00', location: 'Main Gym' },
  ];

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden'
    }}>
      {showSessions && sessions.map((session, i) => (
        <Box
          key={i}
          sx={{
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 1,
            p: 1.5,
            border: '1px solid rgba(255,255,255,0.1)',
            animation: `${slideInLeft} 0.4s ease-out`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', flex: 1 }}>
              {session.title}
            </Typography>
            <Chip
              label="Team"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: workoutTypeColors.team,
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} />
            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
              {session.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} />
            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
              {session.time} - 20:00
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ display: 'flex', marginLeft: -0.5 }}>
              {[1, 2, 3].map((num) => (
                <Avatar
                  key={num}
                  sx={{
                    width: 20,
                    height: 20,
                    fontSize: '0.6rem',
                    bgcolor: '#2196F3',
                    border: '2px solid rgba(0,0,0,0.3)',
                    ml: -0.5,
                    fontWeight: 600
                  }}
                >
                  {num * 7}
                </Avatar>
              ))}
            </Box>
            <CheckCircleIcon sx={{ fontSize: 16, color: workoutTypeColors.coach, ml: 0.5 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// 3. Analytics Mini Demo - matches MyStats calendar day cards
export const AnalyticsMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [showDays, setShowDays] = useState<number[]>([]);

  useEffect(() => {
    if (isHovered) {
      setShowDays([]);
      [0, 1, 2, 3, 4, 5, 6].forEach((day) => {
        setTimeout(() => {
          setShowDays(prev => [...prev, day]);
        }, day * 80);
      });
    } else {
      setShowDays([]);
    }
  }, [isHovered]);

  const days = [
    { day: 15, workouts: ['coach', 'player'] },
    { day: 16, workouts: [] },
    { day: 17, workouts: ['team'] },
    { day: 18, workouts: ['coach'] },
    { day: 19, workouts: ['player', 'team'] },
    { day: 20, workouts: [] },
    { day: 21, workouts: ['coach', 'player'] },
  ];

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden'
    }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', mb: 1 }}>
        Training Week
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between' }}>
        {days.map((dayData, i) => {
          const isVisible = showDays.includes(i);
          return (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: 70,
                bgcolor: dayData.workouts.length > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                borderRadius: 0.75,
                border: '1px solid rgba(255,255,255,0.1)',
                p: 0.5,
                display: 'flex',
                flexDirection: 'column',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'white', mb: 'auto' }}>
                {dayData.day}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {dayData.workouts.map((type, j) => (
                  <Box
                    key={j}
                    sx={{
                      height: 3,
                      borderRadius: 1,
                      bgcolor: workoutTypeColors[type as keyof typeof workoutTypeColors],
                      animation: isVisible ? `${growWidth} 0.3s ease-out ${j * 0.1}s both` : 'none'
                    }}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// 4. Team Management Mini Demo - matches Team.tsx player cards
export const TeamMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [showPlayers, setShowPlayers] = useState<number[]>([]);

  useEffect(() => {
    if (isHovered) {
      setShowPlayers([]);
      [0, 1, 2].forEach((i) => {
        setTimeout(() => {
          setShowPlayers(prev => [...prev, i]);
        }, i * 200);
      });
    } else {
      setShowPlayers([]);
    }
  }, [isHovered]);

  const players = [
    { name: 'Alex M.', position: 'Forward', jersey: 23, age: 23, weight: 82, height: 185 },
    { name: 'Sarah K.', position: 'Midfielder', jersey: 10, age: 21, weight: 68, height: 170 },
    { name: 'John D.', position: 'Defense', jersey: 5, age: 25, weight: 85, height: 188 },
  ];

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden',
      display: 'flex',
      gap: 1
    }}>
      {players.slice(0, 3).map((player, i) => {
        const isVisible = showPlayers.includes(i);
        return (
          <Box
            key={i}
            sx={{
              flex: 1,
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.1)',
              p: 0.75,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: isVisible ? 1 : 0,
              animation: isVisible ? `${fadeIn} 0.3s ease-out` : 'none'
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: '#2196F3',
                fontSize: '0.65rem',
                fontWeight: 700,
                mb: 0.5
              }}
            >
              {player.jersey}
            </Avatar>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'white', textAlign: 'center', lineHeight: 1.2, mb: 0.25 }}>
              {player.name}
            </Typography>
            <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>
              {player.position}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip label={`${player.age}y`} size="small" sx={{ height: 14, fontSize: '0.5rem', bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
              <Chip label={`${player.weight}kg`} size="small" sx={{ height: 14, fontSize: '0.5rem', bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

// 5. Leaderboard Mini Demo - matches Leaderboard.tsx table styling
export const LeaderboardMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [showRows, setShowRows] = useState<number[]>([]);

  useEffect(() => {
    if (isHovered) {
      setShowRows([]);
      [0, 1, 2].forEach((i) => {
        setTimeout(() => {
          setShowRows(prev => [...prev, i]);
        }, i * 150);
      });
    } else {
      setShowRows([]);
    }
  }, [isHovered]);

  const players = [
    { rank: 1, name: 'Alex M.', position: 'FW', points: 2450 },
    { rank: 2, name: 'Sarah K.', position: 'MF', points: 2380 },
    { rank: 3, name: 'John D.', position: 'DF', points: 2290 },
  ];

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{
        bgcolor: '#2196F3',
        px: 1.5,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'white', width: 30 }}>
          Rank
        </Typography>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'white', flex: 1 }}>
          Player
        </Typography>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'white', width: 50, textAlign: 'right' }}>
          Points
        </Typography>
      </Box>

      {/* Rows */}
      {players.map((player, i) => {
        const isVisible = showRows.includes(i);
        return (
          <Box
            key={i}
            sx={{
              px: 1.5,
              py: 0.75,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: i === 0 ? 'rgba(251,191,36,0.1)' : i % 2 === 1 ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              opacity: isVisible ? 1 : 0,
              animation: isVisible ? `${slideUp} 0.3s ease-out` : 'none'
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 20,
                borderRadius: 0.5,
                bgcolor: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : '#cd7f32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: i === 0 ? '#000' : '#fff' }}>
                {player.rank}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: i === 0 ? 700 : 500, color: 'white' }}>
                {player.name}
              </Typography>
              <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)' }}>
                {player.position}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#2196F3', width: 50, textAlign: 'right' }}>
              {player.points}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

// 6. Notifications Mini Demo - matches NotificationBell dropdown
export const NotificationsMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [showNotifs, setShowNotifs] = useState<number[]>([]);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setShowNotifs([]);
      setShowBadge(false);
      [0, 1, 2].forEach((i) => {
        setTimeout(() => {
          setShowNotifs(prev => [...prev, i]);
          if (i === 2) setTimeout(() => setShowBadge(true), 100);
        }, i * 200);
      });
    } else {
      setShowNotifs([]);
      setShowBadge(false);
    }
  }, [isHovered]);

  const notifications = [
    { icon: AddCircleIcon, title: 'New plan assigned', time: '2h ago', color: '#2196F3' },
    { icon: CheckCircleIcon, title: 'Workout completed', time: '5h ago', color: '#4caf50' },
    { icon: EventIcon, title: 'Session tomorrow', time: '1d ago', color: '#ff9800' },
  ];

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{
        px: 1.5,
        py: 0.75,
        bgcolor: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'white' }}>
          Notifications
        </Typography>
        {showBadge && (
          <Badge
            badgeContent={3}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#ef5350',
                color: 'white',
                fontSize: '0.6rem',
                height: 16,
                minWidth: 16,
                animation: `${scaleIn} 0.2s ease-out`
              }
            }}
          />
        )}
      </Box>

      {/* Notification items */}
      <Box sx={{ p: 0.75 }}>
        {notifications.map((notif, i) => {
          const isVisible = showNotifs.includes(i);
          const Icon = notif.icon;
          return (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 0.5,
                mb: i < 2 ? 0.5 : 0,
                borderRadius: 0.75,
                bgcolor: i === 0 ? 'rgba(33,150,243,0.1)' : 'transparent',
                borderLeft: i === 0 ? '3px solid #2196F3' : 'none',
                opacity: isVisible ? 1 : 0,
                animation: isVisible ? `${slideUp} 0.3s ease-out` : 'none'
              }}
            >
              <Icon sx={{ fontSize: 14, color: notif.color }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: i === 0 ? 600 : 400, color: 'white', lineHeight: 1.2 }}>
                  {notif.title}
                </Typography>
                <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)' }}>
                  {notif.time}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
