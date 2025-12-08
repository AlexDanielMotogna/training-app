import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, LinearProgress, keyframes } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

// Keyframes for animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
`;

const countUp = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px);
    opacity: 0;
  }
  51% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

interface Exercise {
  name: string;
  sets: string;
  weight?: string;
  complete: boolean;
}

const COMPOUND_EXERCISES: Exercise[] = [
  { name: 'Back Squat', sets: '4x5', weight: '140kg', complete: false },
  { name: 'Bench Press', sets: '4x5', weight: '100kg', complete: false },
  { name: 'Deadlift', sets: '3x5', weight: '160kg', complete: false },
];

const ACCESSORY_EXERCISES: Exercise[] = [
  { name: 'Pull-ups', sets: '3x8', complete: false },
  { name: 'Dumbbell Rows', sets: '3x10', complete: false },
];

export const AnimatedHeroDemo: React.FC = () => {
  const [compoundExercises, setCompoundExercises] = useState<Exercise[]>(
    COMPOUND_EXERCISES.map((ex, i) => ({ ...ex, complete: i < 2 })) // Start with 2 complete
  );
  const [accessoryExercises, setAccessoryExercises] = useState<Exercise[]>(ACCESSORY_EXERCISES);
  const [completedCount, setCompletedCount] = useState(8);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [animatingSection, setAnimatingSection] = useState<'compound' | 'accessory' | null>(null);
  const [showCountAnimation, setShowCountAnimation] = useState(false);

  // Animation cycle
  useEffect(() => {
    const runAnimation = () => {
      // Find next exercise to complete
      const nextCompoundIndex = compoundExercises.findIndex((ex) => !ex.complete);
      const nextAccessoryIndex = accessoryExercises.findIndex((ex) => !ex.complete);

      if (nextCompoundIndex !== -1) {
        // Animate compound exercise
        setAnimatingSection('compound');
        setAnimatingIndex(nextCompoundIndex);

        setTimeout(() => {
          setCompoundExercises((prev) =>
            prev.map((ex, i) => (i === nextCompoundIndex ? { ...ex, complete: true } : ex))
          );
          setShowCountAnimation(true);
          setTimeout(() => {
            setCompletedCount((prev) => Math.min(prev + 1, 12));
            setShowCountAnimation(false);
          }, 200);
          setAnimatingIndex(null);
          setAnimatingSection(null);
        }, 800);
      } else if (nextAccessoryIndex !== -1) {
        // Animate accessory exercise
        setAnimatingSection('accessory');
        setAnimatingIndex(nextAccessoryIndex);

        setTimeout(() => {
          setAccessoryExercises((prev) =>
            prev.map((ex, i) => (i === nextAccessoryIndex ? { ...ex, complete: true } : ex))
          );
          setShowCountAnimation(true);
          setTimeout(() => {
            setCompletedCount((prev) => Math.min(prev + 1, 12));
            setShowCountAnimation(false);
          }, 200);
          setAnimatingIndex(null);
          setAnimatingSection(null);
        }, 800);
      } else {
        // Reset all exercises after a pause
        setTimeout(() => {
          setCompoundExercises(COMPOUND_EXERCISES.map((ex, i) => ({ ...ex, complete: i < 2 })));
          setAccessoryExercises(ACCESSORY_EXERCISES);
          setCompletedCount(8);
        }, 2000);
      }
    };

    const interval = setInterval(runAnimation, 2000);
    return () => clearInterval(interval);
  }, [compoundExercises, accessoryExercises]);

  const totalExercises = compoundExercises.length + accessoryExercises.length;
  const completedExercises =
    compoundExercises.filter((ex) => ex.complete).length +
    accessoryExercises.filter((ex) => ex.complete).length;
  const progress = (completedExercises / totalExercises) * 100;

  return (
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
          bgcolor: 'rgba(20,20,25,0.95)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* App Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            My Training
          </Typography>
          <Chip
            label="Week 3"
            size="small"
            sx={{
              bgcolor: 'rgba(99,102,241,0.2)',
              color: '#a5b4fc',
              borderRadius: 1.5,
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Progress Bar */}
        <Box sx={{ px: 3, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Today's Progress
            </Typography>
            <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 600 }}>
              {completedExercises}/{totalExercises} exercises
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
                transition: 'transform 0.5s ease',
              },
            }}
          />
        </Box>

        {/* Workout Content */}
        <Box sx={{ p: 3 }}>
          {/* Compound Lifts Block */}
          <Box
            sx={{
              mb: 2.5,
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                bgcolor: 'rgba(99,102,241,0.15)',
                borderBottom: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#a5b4fc', fontWeight: 600, fontSize: '0.8rem' }}
              >
                COMPOUND LIFTS
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {compoundExercises.map((ex, i) => {
                const isAnimating = animatingSection === 'compound' && animatingIndex === i;
                return (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1.25,
                      borderBottom: i < compoundExercises.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      opacity: ex.complete ? 0.6 : 1,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: ex.complete ? 'none' : '2px solid rgba(255,255,255,0.3)',
                          bgcolor: ex.complete ? '#10b981' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          animation: isAnimating
                            ? `${pulse} 0.8s ease-in-out`
                            : ex.complete
                            ? `${scaleIn} 0.3s ease-out`
                            : 'none',
                        }}
                      >
                        {ex.complete && (
                          <CheckIcon
                            sx={{
                              color: 'white',
                              fontSize: '0.875rem',
                              animation: `${fadeInUp} 0.3s ease-out`,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'white',
                          fontWeight: 500,
                          textDecoration: ex.complete ? 'line-through' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {ex.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        {ex.sets}
                      </Typography>
                      {ex.weight && (
                        <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 600 }}>
                          {ex.weight}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Accessory Work Block */}
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                bgcolor: 'rgba(236,72,153,0.15)',
                borderBottom: '1px solid rgba(236,72,153,0.2)',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#f9a8d4', fontWeight: 600, fontSize: '0.8rem' }}
              >
                ACCESSORY WORK
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {accessoryExercises.map((ex, i) => {
                const isAnimating = animatingSection === 'accessory' && animatingIndex === i;
                return (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1.25,
                      borderBottom: i < accessoryExercises.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      opacity: ex.complete ? 0.6 : 1,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: ex.complete ? 'none' : '2px solid rgba(255,255,255,0.3)',
                          bgcolor: ex.complete ? '#10b981' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          animation: isAnimating
                            ? `${pulse} 0.8s ease-in-out`
                            : ex.complete
                            ? `${scaleIn} 0.3s ease-out`
                            : 'none',
                        }}
                      >
                        {ex.complete && (
                          <CheckIcon
                            sx={{
                              color: 'white',
                              fontSize: '0.875rem',
                              animation: `${fadeInUp} 0.3s ease-out`,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'white',
                          fontWeight: 500,
                          textDecoration: ex.complete ? 'line-through' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {ex.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {ex.sets}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
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
          Weekly Progress
        </Typography>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: '#10b981',
            animation: showCountAnimation ? `${countUp} 0.4s ease-out` : 'none',
          }}
        >
          {completedCount}/12
        </Typography>
        <Typography variant="body2" color="text.secondary">
          workouts completed
        </Typography>
      </Box>
    </Box>
  );
};

export default AnimatedHeroDemo;
