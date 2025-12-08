import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, LinearProgress, keyframes } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0); }
  to { transform: scale(1); }
`;

const growBar = keyframes`
  from { width: 0%; }
  to { width: var(--target-width); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// 1. Training Plans Mini Demo
export const TrainingPlansMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [exercises, setExercises] = useState<string[]>([]);

  useEffect(() => {
    if (isHovered) {
      setExercises([]);
      const items = ['Squats 4x8', 'Bench 3x10', 'Deadlift 3x5'];
      items.forEach((item, i) => {
        setTimeout(() => {
          setExercises(prev => [...prev, item]);
        }, i * 300);
      });
    } else {
      setExercises([]);
    }
  }, [isHovered]);

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 600, fontSize: '0.65rem' }}>
          NEW PLAN
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {exercises.map((ex, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              animation: `${slideIn} 0.3s ease-out`,
              bgcolor: 'rgba(99,102,241,0.15)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
          >
            <AddIcon sx={{ fontSize: 12, color: '#6366f1' }} />
            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
              {ex}
            </Typography>
          </Box>
        ))}
        {exercises.length < 3 && (
          <Box sx={{
            border: '1px dashed rgba(255,255,255,0.2)',
            borderRadius: 1,
            py: 0.5,
            textAlign: 'center',
            animation: `${pulse} 1s ease-in-out infinite`
          }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
              Drop exercise here...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// 2. Session Scheduling Mini Demo
export const SchedulingMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [filledDays, setFilledDays] = useState<number[]>([]);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  useEffect(() => {
    if (isHovered) {
      setFilledDays([]);
      const schedule = [0, 2, 4]; // Mon, Wed, Fri
      schedule.forEach((day, i) => {
        setTimeout(() => {
          setFilledDays(prev => [...prev, day]);
        }, i * 250);
      });
    } else {
      setFilledDays([]);
    }
  }, [isHovered]);

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden'
    }}>
      <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.65rem', mb: 1, display: 'block' }}>
        THIS WEEK
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between' }}>
        {days.map((day, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>
              {day}
            </Typography>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: filledDays.includes(i) ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                animation: filledDays.includes(i) ? `${scaleIn} 0.3s ease-out` : 'none',
              }}
            >
              {filledDays.includes(i) && (
                <CheckIcon sx={{ fontSize: 12, color: 'white' }} />
              )}
            </Box>
          </Box>
        ))}
      </Box>
      {filledDays.length > 0 && (
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.6rem',
            mt: 1,
            display: 'block',
            textAlign: 'center',
            animation: `${fadeIn} 0.3s ease-out`
          }}
        >
          {filledDays.length} sessions scheduled
        </Typography>
      )}
    </Box>
  );
};

// 3. Analytics Mini Demo
export const AnalyticsMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [progress, setProgress] = useState([0, 0, 0, 0]);
  const targets = [85, 60, 95, 45];
  const labels = ['Squat', 'Bench', 'Dead', 'OHP'];

  useEffect(() => {
    if (isHovered) {
      setProgress([0, 0, 0, 0]);
      targets.forEach((target, i) => {
        setTimeout(() => {
          setProgress(prev => {
            const newProgress = [...prev];
            newProgress[i] = target;
            return newProgress;
          });
        }, i * 200);
      });
    } else {
      setProgress([0, 0, 0, 0]);
    }
  }, [isHovered]);

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <TrendingUpIcon sx={{ fontSize: 12, color: '#10b981' }} />
        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.65rem' }}>
          STRENGTH PROGRESS
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {labels.map((label, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', width: 30 }}>
              {label}
            </Typography>
            <Box sx={{ flex: 1, height: 6, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  bgcolor: '#10b981',
                  borderRadius: 3,
                  width: `${progress[i]}%`,
                  transition: 'width 0.5s ease-out',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem', width: 24, textAlign: 'right' }}>
              {progress[i]}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// 4. Team Management Mini Demo
export const TeamMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [members, setMembers] = useState<number[]>([]);
  const avatarColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];
  const names = ['JD', 'SM', 'AK', 'MR', 'CL'];

  useEffect(() => {
    if (isHovered) {
      setMembers([]);
      [0, 1, 2, 3, 4].forEach((i) => {
        setTimeout(() => {
          setMembers(prev => [...prev, i]);
        }, i * 150);
      });
    } else {
      setMembers([]);
    }
  }, [isHovered]);

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden'
    }}>
      <Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 600, fontSize: '0.65rem', mb: 1, display: 'block' }}>
        TEAM ROSTER
      </Typography>
      <Box sx={{ display: 'flex', gap: -0.5, mb: 1 }}>
        {members.map((i) => (
          <Avatar
            key={i}
            sx={{
              width: 28,
              height: 28,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: avatarColors[i],
              border: '2px solid rgba(20,20,25,1)',
              marginLeft: i > 0 ? '-8px' : 0,
              animation: `${scaleIn} 0.2s ease-out`,
              zIndex: 5 - i,
            }}
          >
            {names[i]}
          </Avatar>
        ))}
        {members.length > 0 && (
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: '0.6rem',
              bgcolor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(20,20,25,1)',
              marginLeft: '-8px',
              animation: `${fadeIn} 0.3s ease-out`,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            +12
          </Avatar>
        )}
      </Box>
      {members.length > 0 && (
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.6rem',
            animation: `${fadeIn} 0.3s ease-out`
          }}
        >
          17 active members
        </Typography>
      )}
    </Box>
  );
};

// 5. Leaderboard Mini Demo
export const LeaderboardMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [positions, setPositions] = useState<{ name: string; points: number; pos: number }[]>([]);
  const initialData = [
    { name: 'Alex M.', points: 2450, pos: 1 },
    { name: 'Sarah K.', points: 2380, pos: 2 },
    { name: 'John D.', points: 2290, pos: 3 },
  ];

  useEffect(() => {
    if (isHovered) {
      setPositions([]);
      initialData.forEach((item, i) => {
        setTimeout(() => {
          setPositions(prev => [...prev, item]);
        }, i * 200);
      });
    } else {
      setPositions([]);
    }
  }, [isHovered]);

  const getMedalColor = (pos: number) => {
    if (pos === 1) return '#fbbf24';
    if (pos === 2) return '#9ca3af';
    return '#cd7f32';
  };

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden'
    }}>
      <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.65rem', mb: 1, display: 'block' }}>
        TOP PERFORMERS
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {positions.map((item, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              animation: `${slideUp} 0.3s ease-out`,
              bgcolor: i === 0 ? 'rgba(251,191,36,0.1)' : 'transparent',
              borderRadius: 1,
              px: 1,
              py: 0.25,
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: getMedalColor(item.pos),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.55rem',
                fontWeight: 700,
                color: item.pos === 1 ? '#000' : '#fff',
              }}
            >
              {item.pos}
            </Box>
            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.65rem', flex: 1 }}>
              {item.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#a78bfa', fontSize: '0.6rem', fontWeight: 600 }}>
              {item.points}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// 6. Notifications Mini Demo
export const NotificationsMiniDemo: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
  const [notifications, setNotifications] = useState<{ text: string; type: string }[]>([]);
  const notifData = [
    { text: 'New workout assigned', type: 'info' },
    { text: 'Session in 30 min', type: 'warning' },
    { text: 'PR achieved!', type: 'success' },
  ];

  useEffect(() => {
    if (isHovered) {
      setNotifications([]);
      notifData.forEach((notif, i) => {
        setTimeout(() => {
          setNotifications(prev => [...prev, notif]);
        }, i * 300);
      });
    } else {
      setNotifications([]);
    }
  }, [isHovered]);

  const getNotifColor = (type: string) => {
    if (type === 'success') return '#10b981';
    if (type === 'warning') return '#f59e0b';
    return '#06b6d4';
  };

  return (
    <Box sx={{
      width: '100%',
      height: 120,
      bgcolor: 'rgba(0,0,0,0.3)',
      borderRadius: 1.5,
      p: 1.5,
      overflow: 'hidden'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <NotificationsIcon sx={{ fontSize: 12, color: '#06b6d4' }} />
        <Typography variant="caption" sx={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.65rem' }}>
          ALERTS
        </Typography>
        {notifications.length > 0 && (
          <Box sx={{
            bgcolor: '#ef4444',
            borderRadius: '50%',
            width: 14,
            height: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${scaleIn} 0.2s ease-out`,
          }}>
            <Typography sx={{ fontSize: '0.55rem', color: 'white', fontWeight: 700 }}>
              {notifications.length}
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {notifications.map((notif, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              animation: `${slideIn} 0.3s ease-out`,
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              borderLeft: `2px solid ${getNotifColor(notif.type)}`,
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.65rem' }}>
              {notif.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
