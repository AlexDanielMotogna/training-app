import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GroupIcon from '@mui/icons-material/Group';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { useI18n } from '../i18n/I18nProvider';
import { getUser } from '../services/userProfile';

const ONBOARDING_STORAGE_KEY = 'teamtrainer_onboarding_completed';

interface OnboardingStep {
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  imageUrl?: string;
}

export const OnboardingTour: React.FC = () => {
  const { t } = useI18n();
  const theme = useTheme();
  const user = getUser();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const isCoach = user?.role === 'coach';

  // Define steps based on user role
  const steps: OnboardingStep[] = [
    {
      titleKey: 'onboarding.welcome.title',
      descriptionKey: 'onboarding.welcome.description',
      icon: <CelebrationIcon sx={{ fontSize: 64, color: 'primary.main' }} />,
    },
    {
      titleKey: 'onboarding.training.title',
      descriptionKey: 'onboarding.training.description',
      icon: <FitnessCenterIcon sx={{ fontSize: 64, color: 'primary.main' }} />,
    },
    {
      titleKey: 'onboarding.team.title',
      descriptionKey: 'onboarding.team.description',
      icon: <GroupIcon sx={{ fontSize: 64, color: 'primary.main' }} />,
    },
    {
      titleKey: 'onboarding.leaderboard.title',
      descriptionKey: 'onboarding.leaderboard.description',
      icon: <LeaderboardIcon sx={{ fontSize: 64, color: 'primary.main' }} />,
    },
    {
      titleKey: 'onboarding.tests.title',
      descriptionKey: 'onboarding.tests.description',
      icon: <AssessmentIcon sx={{ fontSize: 64, color: 'primary.main' }} />,
    },
    ...(isCoach ? [{
      titleKey: 'onboarding.admin.title',
      descriptionKey: 'onboarding.admin.description',
      icon: <SettingsIcon sx={{ fontSize: 64, color: 'primary.main' }} />,
    }] : []),
  ];

  // Check if user has completed onboarding
  useEffect(() => {
    if (!user) return;

    const completedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const userId = user.id;

    // Check if this specific user has completed onboarding
    if (completedOnboarding) {
      try {
        const completed = JSON.parse(completedOnboarding);
        if (completed[userId]) {
          return; // User already completed onboarding
        }
      } catch {
        // Invalid JSON, show onboarding
      }
    }

    // Show onboarding for new users after a brief delay
    const timer = setTimeout(() => {
      setOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleComplete = () => {
    if (!user) return;

    // Mark onboarding as completed for this user
    const completedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    let completed: Record<string, boolean> = {};

    if (completedOnboarding) {
      try {
        completed = JSON.parse(completedOnboarding);
      } catch {
        completed = {};
      }
    }

    completed[user.id] = true;
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(completed));

    setOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentStep = steps[activeStep];

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header with close button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 1,
        }}
      >
        <IconButton onClick={handleSkip} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Progress stepper */}
        <Box sx={{ px: 3, pt: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((_, index) => (
              <Step key={index}>
                <StepLabel />
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            px: 4,
            py: 4,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            {currentStep.icon}
          </Box>

          {/* Title */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {t(currentStep.titleKey as any)}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400 }}
          >
            {t(currentStep.descriptionKey as any)}
          </Typography>
        </Box>

        {/* Navigation buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={handleSkip}
            color="inherit"
            sx={{ visibility: activeStep === steps.length - 1 ? 'hidden' : 'visible' }}
          >
            {t('onboarding.skip')}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} variant="outlined">
                {t('onboarding.back')}
              </Button>
            )}
            <Button onClick={handleNext} variant="contained">
              {activeStep === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
