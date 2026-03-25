import {
  AppBar,
  Box,
  Container,
  Link,
  Toolbar,
  Typography,
} from '@mui/material';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Button } from '@mui/material';
import DevRoleSwitcher from '../components/shared/DevRoleSwitcher';
import { useAuth } from '../auth/AuthContext';
import { cognitoConfig } from '../auth/config';
import { colors, fonts } from '../theme/tokens';

const navItems = [
  { label: 'My Profile', path: '/portal/profile' },
  { label: 'Portfolio', path: '/portal/portfolio' },
];

export default function FreelancerLayout() {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: colors.surface.canvas,
          borderBottom: `1px solid ${colors.border.default}`,
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1200 }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Link component={RouterLink} to="/portal" underline="none">
              <Typography
                variant="h3"
                sx={{
                  fontFamily: fonts.display,
                  color: colors.text.primary,
                  fontSize: '1.25rem',
                }}
              >
                Freelancer Portal
              </Typography>
            </Link>

            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
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
      <Box
        component="main"
        sx={{ flex: 1, py: 8, px: { xs: 4, md: 8 } }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1080 }}>
          <Box sx={{ display: 'flex', gap: 6 }}>
            <Box sx={{ flex: 1 }}>
              <Outlet />
            </Box>
            <Box sx={{ width: 200, flexShrink: 0, display: { xs: 'none', lg: 'block' } }}>
              {cognitoConfig.enabled ? (
                <Button size="small" onClick={logout} sx={{ color: colors.text.secondary }}>
                  {user?.email || 'Sign out'}
                </Button>
              ) : (
                <DevRoleSwitcher />
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
