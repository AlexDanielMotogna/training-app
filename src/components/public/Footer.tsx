import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  IconButton,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useI18n } from '../../i18n/I18nProvider';

interface FooterProps {
  showGradientTransition?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showGradientTransition = true }) => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        py: 8,
        px: 3,
        bgcolor: '#050505',
      }}
    >
      {/* Smooth transition from CTA gradient to dark footer */}
      {showGradientTransition && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 150,
            background: 'linear-gradient(180deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.2) 20%, rgba(50,50,70,0.1) 50%, rgba(5,5,5,0) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6}>
          {/* Logo & Description */}
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

          {/* Product Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              {t('landing.footer.product')}
            </Typography>
            <Stack spacing={1.5}>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.features')}
              </Typography>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
                onClick={() => navigate('/pricing')}
              >
                {t('landing.footer.pricing')}
              </Typography>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.integrations')}
              </Typography>
            </Stack>
          </Grid>

          {/* Company Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              {t('landing.footer.company')}
            </Typography>
            <Stack spacing={1.5}>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.about')}
              </Typography>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.blog')}
              </Typography>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.careers')}
              </Typography>
            </Stack>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              {t('landing.footer.legal')}
            </Typography>
            <Stack spacing={1.5}>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.privacy')}
              </Typography>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.terms')}
              </Typography>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.cookies')}
              </Typography>
            </Stack>
          </Grid>

          {/* Support Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              {t('landing.footer.support')}
            </Typography>
            <Stack spacing={1.5}>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.help')}
              </Typography>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.contact')}
              </Typography>
              <Typography
                variant="body2"
                color="grey.500"
                sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}
              >
                {t('landing.footer.status')}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
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
            <Typography
              variant="body2"
              color="grey.600"
              sx={{ cursor: 'pointer', '&:hover': { color: 'grey.400' } }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="body2"
              color="grey.600"
              sx={{ cursor: 'pointer', '&:hover': { color: 'grey.400' } }}
            >
              Terms of Service
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
