import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { colors, fonts } from '../../theme/tokens';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Box sx={{ py: { xs: 12, md: 24 }, px: 6 }}>
        <Container maxWidth={false} sx={{ maxWidth: 1200 }}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography
              sx={{
                fontFamily: fonts.bodyBold,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                color: colors.action.primary,
                mb: 3,
              }}
            >
              Discover Creative Talent
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontFamily: fonts.display,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.1,
                mb: 6,
              }}
            >
              Find the perfect artist for your next book cover
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: '1.125rem', lineHeight: 1.6, color: colors.text.body, mb: 6 }}
            >
              Browse our curated directory of illustrators, designers, photographers, and
              lettering artists ready to bring your book to life.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/freelancers"
                sx={{ borderRadius: 999 }}
              >
                Browse Talent
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Placeholder sections */}
      <Box sx={{ py: 16, px: 6, backgroundColor: colors.surface.soft }}>
        <Container maxWidth={false} sx={{ maxWidth: 1200, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 4 }}>
            Featured Freelancers
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Coming soon — featured talent cards will appear here.
          </Typography>
        </Container>
      </Box>

      <Box sx={{ py: 16, px: 6 }}>
        <Container maxWidth={false} sx={{ maxWidth: 1200, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 4 }}>
            Recent Book Covers
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Coming soon — cover archive highlights will appear here.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
