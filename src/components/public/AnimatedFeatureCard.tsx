import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, alpha } from '@mui/material';
import {
  TrainingPlansMiniDemo,
  SchedulingMiniDemo,
  AnalyticsMiniDemo,
  TeamMiniDemo,
  LeaderboardMiniDemo,
  NotificationsMiniDemo,
} from './FeatureMiniDemos';

export type FeatureType = 'plans' | 'schedule' | 'analytics' | 'team' | 'leaderboard' | 'notifications';

interface AnimatedFeatureCardProps {
  type: FeatureType;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const getMiniDemo = (type: FeatureType, isHovered: boolean) => {
  switch (type) {
    case 'plans':
      return <TrainingPlansMiniDemo isHovered={isHovered} />;
    case 'schedule':
      return <SchedulingMiniDemo isHovered={isHovered} />;
    case 'analytics':
      return <AnalyticsMiniDemo isHovered={isHovered} />;
    case 'team':
      return <TeamMiniDemo isHovered={isHovered} />;
    case 'leaderboard':
      return <LeaderboardMiniDemo isHovered={isHovered} />;
    case 'notifications':
      return <NotificationsMiniDemo isHovered={isHovered} />;
    default:
      return null;
  }
};

export const AnimatedFeatureCard: React.FC<AnimatedFeatureCardProps> = ({
  type,
  icon: Icon,
  title,
  description,
  color,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        bgcolor: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: color,
          boxShadow: `0 20px 40px ${alpha(color, 0.2)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Icon / Mini Demo Container */}
        <Box
          sx={{
            width: '100%',
            height: 120,
            borderRadius: 2,
            mb: 2.5,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Static Icon (visible when not hovered) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.05)',
              opacity: isHovered ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: alpha(color, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <Icon sx={{ fontSize: 28, color: color }} />
            </Box>
          </Box>

          {/* Mini Demo (visible when hovered) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
          >
            {getMiniDemo(type, isHovered)}
          </Box>
        </Box>

        {/* Title and Description */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            mb: 1.5,
            color: 'white',
            transition: 'color 0.3s ease',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'grey.500',
            lineHeight: 1.7,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AnimatedFeatureCard;
