import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Pagination, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useCovers } from '../../api/hooks/useCovers';
import { useTaxonomy } from '../../api/hooks/useTaxonomy';
import FilterChipGroup from '../../components/shared/FilterChipGroup';
import CoverCard from '../../components/shared/CoverCard';
import type { CoverFilters } from '../../api/types';
import { colors } from '../../theme/tokens';

export default function CoverArchivePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<CoverFilters>({
    q: searchParams.get('q') || undefined,
    genre: searchParams.getAll('genre'),
    audience: searchParams.getAll('audience'),
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));
    filters.genre?.forEach((v) => params.append('genre', v));
    filters.audience?.forEach((v) => params.append('audience', v));
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const { data, isLoading } = useCovers(filters);
  const { data: genreTerms } = useTaxonomy('genre');
  const { data: audienceTerms } = useTaxonomy('audience');

  const updateFilter = (patch: Partial<CoverFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1200, py: 8, px: 6 }}>
      <Typography variant="h1" sx={{ mb: 6 }}>
        Book Cover Archive
      </Typography>

      <Box sx={{ display: 'flex', gap: 6 }}>
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
            backgroundColor: colors.surface.soft,
            p: 5,
            borderRadius: 2,
            alignSelf: 'flex-start',
            position: 'sticky',
            top: 120,
          }}
        >
          {genreTerms && (
            <FilterChipGroup
              label="Genre"
              options={genreTerms.slice(0, 12).map((t) => t.label)}
              selected={filters.genre || []}
              onChange={(genre) => updateFilter({ genre })}
            />
          )}
          {audienceTerms && (
            <FilterChipGroup
              label="Audience"
              options={audienceTerms.map((t) => t.label)}
              selected={filters.audience || []}
              onChange={(audience) => updateFilter({ audience })}
            />
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 3, mb: 6, alignItems: 'center' }}>
            <TextField
              placeholder="Search covers..."
              value={filters.q || ''}
              onChange={(e) => updateFilter({ q: e.target.value || undefined })}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.text.muted }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={filters.sort || 'newest'}
                label="Sort"
                onChange={(e) => updateFilter({ sort: e.target.value })}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="alpha">A-Z</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
              <CircularProgress />
            </Box>
          ) : data && data.items.length > 0 ? (
            <>
              <Typography variant="body2" sx={{ color: colors.text.muted, mb: 4 }}>
                {data.total} cover{data.total !== 1 ? 's' : ''} found
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
                {data.items.map((cover) => (
                  <CoverCard key={cover.id} cover={cover} />
                ))}
              </Box>
              {data.total_pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                  <Pagination
                    count={data.total_pages}
                    page={filters.page || 1}
                    onChange={(_, page) => updateFilter({ page })}
                    color="primary"
                  />
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Typography variant="h2" sx={{ mb: 3 }}>No covers found</Typography>
              <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                Try adjusting your filters or search terms.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
