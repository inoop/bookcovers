import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '../api/client';
import { cognitoConfig } from './config';
import { generateCodeVerifier, generateCodeChallenge } from './pkce';

interface AuthUser {
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

function hasValidToken(): boolean {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  try {
    const payload = decodeJwtPayload(token);
    const exp = payload.exp as number;
    if (exp && Date.now() / 1000 > exp) {
      localStorage.removeItem('auth_token');
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('auth_token');
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasValidToken()) {
      setIsLoading(false);
      return;
    }

    // Fetch authoritative role from the backend
    apiClient.get('/api/me')
      .then((res) => {
        setUser({
          email: res.data.email,
          name: res.data.display_name,
          role: res.data.role,
        });
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async () => {
    if (!cognitoConfig.enabled) return;

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    sessionStorage.setItem('pkce_verifier', verifier);
    sessionStorage.setItem('auth_redirect', window.location.pathname);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: cognitoConfig.clientId,
      redirect_uri: cognitoConfig.redirectUri,
      scope: 'openid email profile',
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    window.location.href = `${cognitoConfig.authorizeUrl}?${params}`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');

    if (cognitoConfig.enabled) {
      const params = new URLSearchParams({
        client_id: cognitoConfig.clientId,
        logout_uri: window.location.origin + '/',
      });
      window.location.href = `${cognitoConfig.logoutUrl}?${params}`;
    } else {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
