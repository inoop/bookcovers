import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { cognitoConfig } from './config';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(params.get('error_description') || errorParam);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      return;
    }

    const verifier = sessionStorage.getItem('pkce_verifier');
    if (!verifier) {
      setError('Missing PKCE verifier — please try logging in again');
      return;
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: cognitoConfig.clientId,
      code,
      redirect_uri: cognitoConfig.redirectUri,
      code_verifier: verifier,
    });

    fetch(cognitoConfig.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        localStorage.setItem('auth_token', data.id_token);
        sessionStorage.removeItem('pkce_verifier');
        const redirect = sessionStorage.getItem('auth_redirect') || '/';
        sessionStorage.removeItem('auth_redirect');
        navigate(redirect, { replace: true });
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [navigate]);

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
        <Typography color="error">Authentication failed: {error}</Typography>
        <Typography variant="body2">
          <a href="/">Return home</a>
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
