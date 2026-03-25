import { useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useAuth } from './AuthContext';
import { cognitoConfig } from './config';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoading, login, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && cognitoConfig.enabled) {
      login();
    }
  }, [isLoading, user, login]);

  // In local dev without Cognito, pass through
  if (!cognitoConfig.enabled) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
        <Typography variant="h5">Access Denied</Typography>
        <Typography color="text.secondary">
          Your account ({user.email}) does not have permission to access this area.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="outlined" href="/">Go Home</Button>
          <Button variant="text" onClick={logout}>Sign Out</Button>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}
