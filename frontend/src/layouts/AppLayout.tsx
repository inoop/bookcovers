import { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  PhotoLibrary as CoversIcon,
  RateReview as ReviewIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Category as TaxonomyIcon,
} from '@mui/icons-material';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import DevRoleSwitcher from '../components/shared/DevRoleSwitcher';
import { colors, fonts } from '../theme/tokens';

const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED = 88;

const navSections = [
  {
    items: [
      { label: 'Talent Database', path: '/app/talent', icon: <PeopleIcon /> },
      { label: 'Cover Archive', path: '/app/covers', icon: <CoversIcon /> },
      { label: 'Review Queue', path: '/app/review', icon: <ReviewIcon /> },
      { label: 'Folders', path: '/app/folders', icon: <FolderIcon /> },
    ],
  },
  {
    items: [
      { label: 'Taxonomy', path: '/app/admin/taxonomy', icon: <TaxonomyIcon /> },
      { label: 'Settings', path: '/app/admin/settings', icon: <SettingsIcon /> },
    ],
  },
];

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const location = useLocation();
  const drawerWidth = drawerOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: colors.surface.canvas,
          borderBottom: `1px solid ${colors.border.default}`,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, color: colors.text.primary }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h3"
            component={RouterLink}
            to="/app"
            sx={{
              textDecoration: 'none',
              color: colors.text.primary,
              fontFamily: fonts.display,
              fontSize: '1.25rem',
            }}
          >
            Book Cover Marketplace
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Side Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 180ms cubic-bezier(0.2, 0, 0, 1)',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 180ms cubic-bezier(0.2, 0, 0, 1)',
            overflowX: 'hidden',
            borderRight: `1px solid ${colors.border.default}`,
            backgroundColor: colors.surface.canvas,
          },
        }}
      >
        <Toolbar /> {/* Spacer for app bar */}
        <Box sx={{ py: 2 }}>
          {navSections.map((section, si) => (
            <Box key={si}>
              {si > 0 && (
                <Box sx={{ mx: 4, my: 2, borderTop: `1px solid ${colors.border.default}` }} />
              )}
              <List disablePadding>
                {section.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <ListItem key={item.path} disablePadding>
                      <ListItemButton
                        component={RouterLink}
                        to={item.path}
                        sx={{
                          py: 2,
                          px: 4,
                          borderLeft: isActive
                            ? `3px solid ${colors.action.primary}`
                            : '3px solid transparent',
                          backgroundColor: isActive ? colors.surface.soft : 'transparent',
                          '&:hover': { backgroundColor: colors.surface.soft },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: isActive ? colors.text.primary : colors.text.secondary,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {drawerOpen && (
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontFamily: fonts.bodyStrong,
                              fontSize: '0.875rem',
                              color: isActive ? colors.text.primary : colors.text.body,
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
          {drawerOpen && (
            <Box sx={{ px: 4, mt: 4 }}>
              <DevRoleSwitcher />
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 8,
          mt: '64px',
          maxWidth: 1440,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
