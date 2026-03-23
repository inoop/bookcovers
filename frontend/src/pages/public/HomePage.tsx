import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { colors, fonts } from '../../theme/tokens';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Box sx={{ py: { xs: 12, md: 20 }, px: 6, backgroundColor: colors.surface.canvas }}>
        <Container maxWidth={false} sx={{ maxWidth: 1200 }}>
          {/* Shared headline */}
          <Box sx={{ textAlign: 'center', mb: { xs: 10, md: 14 } }}>
            <Typography
              sx={{
                fontFamily: fonts.bodyBold,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: colors.action.primary,
                mb: 3,
              }}
            >
              Penguin Random House
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontFamily: fonts.display,
                fontSize: { xs: '2.25rem', md: '3.25rem' },
                lineHeight: 1.1,
                mb: 5,
              }}
            >
              The Book Cover Artist Database
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: colors.text.body,
                maxWidth: 560,
                mx: 'auto',
              }}
            >
              Connecting PRH publishers and editors with curated freelance talent
              for book cover illustration and design.
            </Typography>
          </Box>

          {/* Two-audience cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 6,
            }}
          >
            {/* Card: Publishers & Editors */}
            <Box
              sx={{
                border: `1px solid ${colors.border.default}`,
                borderRadius: 3,
                p: { xs: 8, md: 10 },
                backgroundColor: colors.surface.soft,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                sx={{
                  fontFamily: fonts.utility,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.action.primary,
                  mb: 4,
                }}
              >
                For Publishers &amp; Editors
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontFamily: fonts.display, fontSize: '1.75rem', mb: 4, lineHeight: 1.2 }}
              >
                Search &amp; discover freelance artists
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: colors.text.body, lineHeight: 1.6, mb: 8, flex: 1 }}
              >
                Log in with your PRH credentials to browse our curated database of
                illustrators, designers, and lettering artists — searchable by style,
                genre, and audience.
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/app/talent"
                  sx={{ borderRadius: 999 }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>

            {/* Card: Freelance Artists */}
            <Box
              sx={{
                border: `1px solid ${colors.border.default}`,
                borderRadius: 3,
                p: { xs: 8, md: 10 },
                backgroundColor: colors.surface.raised,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                sx={{
                  fontFamily: fonts.utility,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.action.secondary,
                  mb: 4,
                }}
              >
                For Freelance Artists
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontFamily: fonts.display, fontSize: '1.75rem', mb: 4, lineHeight: 1.2 }}
              >
                Join the database &amp; get discovered
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: colors.text.body, lineHeight: 1.6, mb: 8, flex: 1 }}
              >
                Create a profile to showcase your portfolio to publishers and editors at
                Penguin Random House. Upload work samples, list your style and specialties,
                and be considered for upcoming projects.
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/portal/profile"
                  sx={{ borderRadius: 999 }}
                >
                  Create a Profile
                </Button>
              </Box>
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
