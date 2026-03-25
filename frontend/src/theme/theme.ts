import { createTheme } from '@mui/material/styles';
import { colors, fonts, radii } from './tokens';

const theme = createTheme({
  spacing: 4,
  shape: { borderRadius: radii.md },
  palette: {
    mode: 'light',
    primary: {
      main: colors.action.primary,
      dark: colors.action.primaryHover,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.action.secondary,
      dark: colors.action.secondaryHover,
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.surface.canvas,
      paper: colors.surface.canvas,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.body,
      disabled: colors.text.muted,
    },
    divider: colors.border.default,
    error: { main: colors.status.error },
    warning: { main: colors.status.warning },
    info: { main: colors.status.info },
    success: { main: colors.status.success },
  },
  typography: {
    fontFamily: fonts.body,
    h1: {
      fontFamily: fonts.display,
      fontSize: '2.25rem',
      lineHeight: 1.1,
      fontWeight: 300,
    },
    h2: {
      fontFamily: fonts.display,
      fontSize: '1.75rem',
      lineHeight: 1.15,
      fontWeight: 300,
    },
    h3: {
      fontFamily: fonts.bodyStrong,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      fontWeight: 500,
    },
    h4: {
      fontFamily: fonts.bodyStrong,
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    h5: {
      fontFamily: fonts.bodyStrong,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      fontWeight: 500,
    },
    h6: {
      fontFamily: fonts.bodyStrong,
      fontSize: '0.75rem',
      lineHeight: 1.33,
      fontWeight: 500,
    },
    body1: {
      fontFamily: fonts.body,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      fontWeight: 300,
    },
    body2: {
      fontFamily: fonts.body,
      fontSize: '0.75rem',
      lineHeight: 1.33,
      fontWeight: 300,
    },
    button: {
      fontFamily: fonts.bodyBold,
      fontSize: '0.75rem',
      lineHeight: 1.33,
      fontWeight: 700,
      textTransform: 'none' as const,
    },
    overline: {
      fontFamily: fonts.utility,
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontFamily: fonts.body,
      fontSize: '0.75rem',
      lineHeight: 1.33,
      fontWeight: 300,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.surface.canvas,
          color: colors.text.body,
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          body1: 'p',
          body2: 'p',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.link.default,
          textDecoration: 'none',
          '&:hover': {
            color: colors.link.accent,
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: radii.md,
          minHeight: 40,
          padding: '10px 18px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: colors.action.primaryHover,
          },
        },
        outlinedPrimary: {
          borderColor: colors.action.primary,
          color: colors.action.primary,
          '&:hover': {
            backgroundColor: 'rgba(255, 102, 0, 0.04)',
            borderColor: colors.action.primary,
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'inherit',
      },
      styleOverrides: {
        root: {
          backgroundColor: colors.surface.canvas,
          borderBottom: `1px solid ${colors.border.default}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px !important',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${colors.border.default}`,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: radii.md,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: `1px solid #E1E1E1`,
          borderRadius: radii.sm,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily: fonts.bodyStrong,
          fontSize: '0.8125rem',
          color: colors.text.primary,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radii.md,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.border.strong,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.focus.ring,
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: colors.border.default,
        },
        input: {
          height: '44px',
          boxSizing: 'border-box',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radii.pill,
          height: 28,
          fontFamily: fonts.bodyStrong,
          fontSize: '0.75rem',
        },
        colorDefault: {
          backgroundColor: colors.surface.soft,
          border: `1px solid ${colors.border.default}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: colors.action.primary,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: fonts.bodyStrong,
          textTransform: 'none',
          color: colors.text.secondary,
          '&.Mui-selected': {
            color: colors.text.primary,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border.default}`,
          padding: '12px 16px',
        },
        head: {
          fontFamily: fonts.bodyStrong,
          fontSize: '0.75rem',
          color: colors.text.primary,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.surface.soft,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radii.md,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radii.lg,
          padding: 0,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: radii.md,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.brand.charcoal,
          fontSize: '0.75rem',
          borderRadius: radii.sm,
        },
      },
    },
  },
});

export default theme;
