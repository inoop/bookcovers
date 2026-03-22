import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, Chip, CircularProgress, Container, Link, Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useFreelancerDetail } from '../../api/hooks/useFreelancers';
import { colors, fonts } from '../../theme/tokens';

export default function FreelancerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, error } = useFreelancerDetail(id || '');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 24 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth={false} sx={{ maxWidth: 1080, py: 16, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ mb: 3 }}>Freelancer not found</Typography>
        <Button component={RouterLink} to="/freelancers" variant="outlined">
          Back to Directory
        </Button>
      </Container>
    );
  }

  const allTags = [
    ...(profile.audience_tags || []),
    ...(profile.style_tags || []),
    ...(profile.genre_tags || []),
  ];

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1080, py: 8, px: 6 }}>
      {/* Hero Band */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h1" sx={{ fontFamily: fonts.display, mb: 2 }}>
          {profile.name}
        </Typography>
        {profile.pronouns && (
          <Typography variant="body1" sx={{ color: colors.text.secondary, mb: 3 }}>
            {profile.pronouns}
          </Typography>
        )}

        {allTags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {allTags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
        )}

        {profile.current_locations && profile.current_locations.length > 0 && (
          <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 3 }}>
            {profile.current_locations.join(' / ')}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 8 }}>
        {/* Left: Summary + Links */}
        <Box>
          {profile.summary && (
            <Box sx={{ mb: 6 }}>
              <Typography
                sx={{
                  fontFamily: fonts.utility,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.text.secondary,
                  mb: 2,
                }}
              >
                About
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6, color: colors.text.body }}>
                {profile.summary}
              </Typography>
            </Box>
          )}

          {profile.profile_statement && (
            <Box sx={{ mb: 6 }}>
              <Typography
                sx={{
                  fontFamily: fonts.utility,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.text.secondary,
                  mb: 2,
                }}
              >
                Statement
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6, color: colors.text.body }}>
                {profile.profile_statement}
              </Typography>
            </Box>
          )}

          {profile.website_links && profile.website_links.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography
                sx={{
                  fontFamily: fonts.utility,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.text.secondary,
                  mb: 2,
                }}
              >
                Links
              </Typography>
              {profile.website_links.map((link, i) => (
                <Link
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    color: colors.link.utility,
                  }}
                >
                  {link.label || link.url}
                  <OpenInNewIcon sx={{ fontSize: 14 }} />
                </Link>
              ))}
            </Box>
          )}

          {profile.uses_ai && (
            <Typography variant="body2" sx={{ color: colors.text.muted }}>
              This artist uses AI tools in their workflow.
            </Typography>
          )}
        </Box>

        {/* Right: Portfolio Gallery */}
        <Box>
          <Typography
            sx={{
              fontFamily: fonts.utility,
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: colors.text.secondary,
              mb: 4,
            }}
          >
            Portfolio
          </Typography>

          {profile.portfolio_assets.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 4,
              }}
            >
              {profile.portfolio_assets.map((asset) => (
                <Box
                  key={asset.id}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${colors.border.default}`,
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      backgroundColor: colors.surface.raised,
                      backgroundImage: asset.media_url
                        ? `url(${asset.media_url})`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  {asset.title && (
                    <Box sx={{ p: 3 }}>
                      <Typography variant="body2" sx={{ fontFamily: fonts.bodyStrong }}>
                        {asset.title}
                      </Typography>
                      {asset.description && (
                        <Typography variant="body2" sx={{ color: colors.text.muted, mt: 1 }}>
                          {asset.description}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ color: colors.text.muted }}>
              No portfolio samples available.
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}
