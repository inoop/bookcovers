import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Pagination, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useFreelancers } from '../../api/hooks/useFreelancers';
import { useTaxonomy } from '../../api/hooks/useTaxonomy';
import FilterChipGroup from '../../components/shared/FilterChipGroup';
import FreelancerCard from '../../components/shared/FreelancerCard';
import type { FreelancerFilters } from '../../api/types';
import { colors } from '../../theme/tokens';

export default function FreelancerDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<FreelancerFilters>({
    q: searchParams.get('q') || undefined,
    audience: searchParams.getAll('audience'),
    style: searchParams.getAll('style'),
    genre: searchParams.getAll('genre'),
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));
    filters.audience?.forEach((v) => params.append('audience', v));
    filters.style?.forEach((v) => params.append('style', v));
    filters.genre?.forEach((v) => params.append('genre', v));
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const { data, isLoading } = useFreelancers(filters);
  const { data: audienceTerms } = useTaxonomy('audience');
  const { data: styleTerms } = useTaxonomy('style');
  const { data: genreTerms } = useTaxonomy('genre');

  const updateFilter = (patch: Partial<FreelancerFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1200, py: 8, px: 6 }}>
      <Typography variant="h1" sx={{ mb: 6 }}>
        Freelancer Directory
      </Typography>

      <Box sx={{ display: 'flex', gap: 6 }}>
        {/* Filter Rail */}
        <Box
          sx={{
            width: 260,
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
          {audienceTerms && (
            <FilterChipGroup
              label="Audience"
              options={audienceTerms.map((t) => t.label)}
              selected={filters.audience || []}
              onChange={(audience) => updateFilter({ audience })}
            />
          )}
          {styleTerms && (
            <FilterChipGroup
              label="Style"
              options={styleTerms.map((t) => t.label)}
              selected={filters.style || []}
              onChange={(style) => updateFilter({ style })}
            />
          )}
          {genreTerms && (
            <FilterChipGroup
              label="Genre"
              options={genreTerms.slice(0, 12).map((t) => t.label)}
              selected={filters.genre || []}
              onChange={(genre) => updateFilter({ genre })}
            />
          )}
        </Box>

        {/* Results */}
        <Box sx={{ flex: 1 }}>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', gap: 3, mb: 6, alignItems: 'center' }}>
            <TextField
              placeholder="Search freelancers..."
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
                <MenuItem value="featured">Featured</MenuItem>
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
                {data.total} freelancer{data.total !== 1 ? 's' : ''} found
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  },
                  gap: 6,
                }}
              >
                {data.items.map((freelancer) => (
                  <FreelancerCard key={freelancer.id} freelancer={freelancer} />
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
              <Typography variant="h2" sx={{ mb: 3 }}>
                No freelancers found
              </Typography>
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
