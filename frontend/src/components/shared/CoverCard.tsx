import { Box, Card, CardContent, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { BookCoverCardResponse } from '../../api/types';
import { colors, fonts } from '../../theme/tokens';

interface CoverCardProps {
  cover: BookCoverCardResponse;
}

export default function CoverCard({ cover }: CoverCardProps) {
  const link = `/covers/${cover.slug || cover.id}`;

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
        '&:hover': { borderColor: colors.border.strong },
      }}
    >
      <Box
        sx={{
          height: 280,
          backgroundColor: colors.surface.raised,
          backgroundImage: cover.primary_image_url
            ? `url(${cover.primary_image_url})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!cover.primary_image_url && (
          <Typography variant="body2" sx={{ color: colors.text.muted }}>
            No cover image
          </Typography>
        )}
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Typography
          sx={{
            fontFamily: fonts.bodyStrong,
            fontSize: '0.9375rem',
            color: colors.text.primary,
            mb: 1,
          }}
        >
          {cover.title}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 1 }}>
          {cover.author_name}
        </Typography>
        {cover.contributors.length > 0 && (
          <Typography variant="body2" sx={{ color: colors.text.muted, fontSize: '0.6875rem' }}>
            {cover.contributors.map((c) => c.contributor_name).join(', ')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
