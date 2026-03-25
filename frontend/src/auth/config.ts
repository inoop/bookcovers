const domain = import.meta.env.VITE_COGNITO_DOMAIN || '';
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '';
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI || '';

export const cognitoConfig = {
  domain,
  clientId,
  redirectUri,
  authorizeUrl: `https://${domain}/oauth2/authorize`,
  tokenUrl: `https://${domain}/oauth2/token`,
  logoutUrl: `https://${domain}/logout`,
  enabled: !!domain && !!clientId,
};
