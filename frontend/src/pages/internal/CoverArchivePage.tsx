import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { useCovers } from '../../api/hooks/useCovers';
import { useWorkSamples } from '../../api/hooks/useWorkSamples';
import { useTaxonomy } from '../../api/hooks/useTaxonomy';
import FilterChipGroup from '../../components/shared/FilterChipGroup';
import CoverCard from '../../components/shared/CoverCard';
import type { CoverFilters, WorkSampleCard } from '../../api/types';
import { colors, fonts } from '../../theme/tokens';

// ---------------------------------------------------------------------------
// Work sample card
// ---------------------------------------------------------------------------

function WorkSampleGridCard({ sample }: { sample: WorkSampleCard }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
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
          backgroundImage: sample.media_url ? `url(${sample.media_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!sample.media_url && (
          <Typography variant="body2" sx={{ color: colors.text.muted }}>
            No image
          </Typography>
        )}
      </Box>

      <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sample.title && (
          <Typography
            sx={{
              fontFamily: fonts.bodyStrong,
              fontSize: '0.9375rem',
              color: colors.text.primary,
            }}
          >
            {sample.title}
          </Typography>
        )}

        <Chip
          icon={<PersonIcon fontSize="small" />}
          label={sample.freelancer_name}
          size="small"
          clickable
          onClick={() => navigate(`/app/talent?open=${sample.freelancer_profile_id}`)}
          sx={{
            alignSelf: 'flex-start',
            backgroundColor: colors.surface.soft,
            color: colors.text.body,
            '&:hover': { backgroundColor: colors.surface.raised },
          }}
        />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Cover Archive tab
// ---------------------------------------------------------------------------

function CoverArchiveTab() {
  const [filters, setFilters] = useState<CoverFilters>({ sort: 'newest', page: 1 });
  const { data, isLoading } = useCovers(filters);
  const { data: genreTerms } = useTaxonomy('genre');
  const { data: audienceTerms } = useTaxonomy('audience');

  const updateFilter = (patch: Partial<CoverFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  };

  return (
    <Box sx={{ display: 'flex', gap: 6, mt: 4 }}>
      {/* Sidebar filters */}
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

      {/* Main content */}
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
            <Typography variant="h2" sx={{ mb: 3 }}>
              No covers found
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text.secondary }}>
              Try adjusting your filters or search terms.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Work Samples tab
// ---------------------------------------------------------------------------

function WorkSamplesTab() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWorkSamples({ q: q || undefined, page, page_size: 24 });

  const handleSearch = (value: string) => {
    setQ(value);
    setPage(1);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <TextField
        placeholder="Search by artist name or title..."
        value={q}
        onChange={(e) => handleSearch(e.target.value)}
        sx={{ mb: 6, maxWidth: 480 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: colors.text.muted }} />
            </InputAdornment>
          ),
        }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      ) : data && data.items.length > 0 ? (
        <>
          <Typography variant="body2" sx={{ color: colors.text.muted, mb: 4 }}>
            {data.total} work sample{data.total !== 1 ? 's' : ''}
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
            {data.items.map((sample) => (
              <WorkSampleGridCard key={sample.id} sample={sample} />
            ))}
          </Box>
          {data.total_pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <Pagination
                count={data.total_pages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Typography variant="h2" sx={{ mb: 3 }}>
            No work samples found
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            {q
              ? 'Try a different search term.'
              : 'Approved portfolio uploads from freelancers will appear here.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function InternalCoverArchivePage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 4 }}>
        Cover Archive
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: `1px solid ${colors.border.default}`, mb: 2 }}
      >
        <Tab label="Cover Archive" />
        <Tab label="Work Samples" />
      </Tabs>

      {tab === 0 && <CoverArchiveTab />}
      {tab === 1 && <WorkSamplesTab />}
    </Box>
  );
}
