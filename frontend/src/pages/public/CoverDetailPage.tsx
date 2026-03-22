import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, Chip, CircularProgress, Container, Link, Typography,
} from '@mui/material';
import { useCoverDetail } from '../../api/hooks/useCovers';
import CoverCard from '../../components/shared/CoverCard';
import { colors, fonts } from '../../theme/tokens';

export default function CoverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cover, isLoading, error } = useCoverDetail(id || '');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 24 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !cover) {
    return (
      <Container maxWidth={false} sx={{ maxWidth: 1080, py: 16, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ mb: 3 }}>Cover not found</Typography>
        <Button component={RouterLink} to="/covers" variant="outlined">
          Back to Archive
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1080, py: 8, px: 6 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 8 }}>
        {/* Cover Image */}
        <Box
          sx={{
            backgroundColor: colors.surface.raised,
            borderRadius: 2,
            overflow: 'hidden',
            minHeight: 400,
            backgroundImage: cover.primary_image_url
              ? `url(${cover.primary_image_url})`
              : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Metadata */}
        <Box>
          <Typography variant="h1" sx={{ fontFamily: fonts.display, mb: 2 }}>
            {cover.title}
          </Typography>
          {cover.subtitle && (
            <Typography variant="h2" sx={{ fontFamily: fonts.display, fontSize: '1.25rem', color: colors.text.secondary, mb: 3 }}>
              {cover.subtitle}
            </Typography>
          )}

          <Typography variant="body1" sx={{ mb: 4, color: colors.text.body }}>
            by {cover.author_name}
          </Typography>

          {cover.publisher && (
            <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 1 }}>
              {cover.publisher}{cover.imprint ? ` / ${cover.imprint}` : ''}
            </Typography>
          )}
          {cover.publication_date && (
            <Typography variant="body2" sx={{ color: colors.text.muted, mb: 4 }}>
              Published {cover.publication_date}
            </Typography>
          )}

          {/* Tags */}
          {(cover.genre_tags || cover.audience_tags || cover.visual_tags) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 6 }}>
              {cover.genre_tags?.map((t) => <Chip key={t} label={t} size="small" />)}
              {cover.audience_tags?.map((t) => <Chip key={t} label={t} size="small" />)}
              {cover.visual_tags?.map((t) => (
                <Chip key={t} label={t} size="small" sx={{ backgroundColor: 'transparent', border: `1px solid ${colors.border.default}` }} />
              ))}
            </Box>
          )}

          {/* Contributors */}
          {cover.contributors.length > 0 && (
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
                Credits
              </Typography>
              {cover.contributors.map((c) => (
                <Box key={c.id} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: colors.text.muted, textTransform: 'capitalize' }}>
                    {c.contributor_type.replace('_', ' ')}
                  </Typography>
                  {c.freelancer_slug ? (
                    <Link
                      component={RouterLink}
                      to={`/freelancers/${c.freelancer_slug}`}
                      sx={{ color: colors.link.utility, fontFamily: fonts.bodyStrong }}
                    >
                      {c.contributor_name}
                    </Link>
                  ) : (
                    <Typography sx={{ fontFamily: fonts.bodyStrong }}>{c.contributor_name}</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {cover.external_book_url && (
            <Button
              href={cover.external_book_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
            >
              View Book
            </Button>
          )}
        </Box>
      </Box>

      {/* Related Covers */}
      {cover.related_covers.length > 0 && (
        <Box sx={{ mt: 16 }}>
          <Typography variant="h2" sx={{ mb: 6 }}>
            Related Covers
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 5,
            }}
          >
            {cover.related_covers.map((rc) => (
              <CoverCard key={rc.id} cover={rc} />
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}
