import { AppBar, Box, Container, Link, Toolbar, Typography } from '@mui/material';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { colors, fonts } from '../theme/tokens';

const navItems = [
  { label: 'Freelancers', path: '/freelancers' },
  { label: 'Book Covers', path: '/covers' },
  { label: 'Post a Brief', path: '/briefs/new' },
  { label: 'Resources', path: '/resources' },
];

export default function WebsiteLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: colors.surface.canvas,
          borderBottom: `1px solid ${colors.border.default}`,
          height: { xs: 72, md: 96 },
          justifyContent: 'center',
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1200 }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Link component={RouterLink} to="/" underline="none">
              <Typography
                variant="h2"
                sx={{
                  fontFamily: fonts.display,
                  color: colors.text.primary,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                Book Cover Marketplace
              </Typography>
            </Link>

            <Box sx={{ display: 'flex', gap: 4 }}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  underline="none"
                  sx={{
                    fontFamily: fonts.utility,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: colors.text.primary,
                    '&:hover': { color: colors.action.primary },
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: colors.brand.charcoal,
          color: colors.text.inverse,
          py: 12,
          px: 6,
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1200 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 8,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{ color: colors.text.inverse, mb: 4, fontFamily: fonts.display }}
              >
                Book Cover Marketplace
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.muted }}>
                Connecting publishers with creative talent.
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: fonts.utility,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.text.inverse,
                  mb: 3,
                }}
              >
                Navigate
              </Typography>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    display: 'block',
                    color: colors.text.muted,
                    mb: 2,
                    fontSize: '0.875rem',
                    '&:hover': { color: colors.text.inverse },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: fonts.utility,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.text.inverse,
                  mb: 3,
                }}
              >
                For Freelancers
              </Typography>
              <Link
                component={RouterLink}
                to="/portal"
                sx={{
                  display: 'block',
                  color: colors.text.muted,
                  mb: 2,
                  fontSize: '0.875rem',
                  '&:hover': { color: colors.text.inverse },
                }}
              >
                Create Your Profile
              </Link>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 12,
              pt: 6,
              borderTop: `1px solid ${colors.border.strong}`,
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: colors.text.muted }}>
              &copy; {new Date().getFullYear()} Penguin Random House
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Link href="#" sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                Privacy Policy
              </Link>
              <Link href="#" sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>
                Terms of Use
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
