import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { FreelancerCardResponse } from '../../api/types';
import { colors, fonts } from '../../theme/tokens';

interface FreelancerCardProps {
  freelancer: FreelancerCardResponse;
}

export default function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const link = `/freelancers/${freelancer.slug || freelancer.id}`;

  return (
    <Card
      component={RouterLink}
      to={link}
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'border-color 180ms cubic-bezier(0.2, 0, 0, 1)',
        '&:hover': {
          borderColor: colors.border.strong,
        },
      }}
    >
      {/* Hero image placeholder */}
      <Box
        sx={{
          height: 200,
          backgroundColor: colors.surface.raised,
          backgroundImage: freelancer.hero_image_url
            ? `url(${freelancer.hero_image_url})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!freelancer.hero_image_url && (
          <Typography variant="body2" sx={{ color: colors.text.muted }}>
            No image
          </Typography>
        )}
      </Box>

      <CardContent sx={{ flex: 1, p: 5 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: fonts.bodyStrong,
            fontSize: '1.125rem',
            mb: 1,
            color: colors.text.primary,
          }}
        >
          {freelancer.name}
        </Typography>

        {freelancer.pronouns && (
          <Typography variant="body2" sx={{ color: colors.text.muted, mb: 2 }}>
            {freelancer.pronouns}
          </Typography>
        )}

        {freelancer.current_locations && freelancer.current_locations.length > 0 && (
          <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
            {freelancer.current_locations.join(' / ')}
          </Typography>
        )}

        {freelancer.summary && (
          <Typography
            variant="body1"
            sx={{
              color: colors.text.body,
              mb: 3,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {freelancer.summary}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {freelancer.style_tags?.slice(0, 3).map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
          {freelancer.audience_tags?.slice(0, 2).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border.default}`,
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
