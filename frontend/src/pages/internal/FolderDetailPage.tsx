import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  useFolderDetail,
  useRemoveFromFolder,
  useToggleFavorite,
  useInternalFreelancerDetail,
  useTalentNotes,
  useProfileFeedback,
  useFolders,
  useAddToFolder,
  useCreateTalentNote,
  useUpdateTalentNote,
  useDeleteTalentNote,
  useCreateFeedback,
  useUpdateFolder,
} from '../../api/hooks/useTalent';
import { colors as tokens_colors, radii as tokens_radii } from '../../theme/tokens';
import type { InternalFreelancerCard } from '../../api/types';
import { ProfileCurationDrawer } from './TalentDatabasePage';

// ---------------------------------------------------------------------------
// Privacy badge
// ---------------------------------------------------------------------------

const PRIVACY_LABELS: Record<string, string> = {
  private: 'Private',
  shared_users: 'Shared',
  shared_team: 'Team',
};

function PrivacyBadge({ privacy }: { privacy: string }) {
  return (
    <Chip
      label={PRIVACY_LABELS[privacy] ?? privacy}
      size="small"
      variant="outlined"
      sx={{ textTransform: 'capitalize' }}
    />
  );
}

// ---------------------------------------------------------------------------
// Member card
// ---------------------------------------------------------------------------

function MemberCard({
  profile,
  folderId,
  isOwner,
  onOpen,
}: {
  profile: InternalFreelancerCard;
  folderId: string;
  isOwner: boolean;
  onOpen: () => void;
}) {
  const removeFromFolder = useRemoveFromFolder();
  const toggleFav = useToggleFavorite();

  return (
    <Box
      sx={{
        border: `1px solid ${tokens_colors.border.default}`,
        borderRadius: tokens_radii.md,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
        transition: 'box-shadow 180ms',
        position: 'relative',
      }}
    >
      {/* Remove button (owner only) */}
      {isOwner && (
        <Tooltip title="Remove from folder">
          <IconButton
            size="small"
            sx={{ position: 'absolute', top: 6, right: 6, zIndex: 1, bgcolor: 'background.paper' }}
            onClick={() => removeFromFolder.mutate({ folderId, profileId: profile.id })}
            disabled={removeFromFolder.isPending}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Hero */}
      <Box
        onClick={onOpen}
        sx={{
          height: 130,
          bgcolor: tokens_colors.surface.soft,
          backgroundImage: profile.hero_image_url ? `url(${profile.hero_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer',
        }}
      />

      {/* Body */}
      <Box sx={{ p: 2, cursor: 'pointer' }} onClick={onOpen}>
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {profile.name}
        </Typography>
        {profile.pronouns && (
          <Typography variant="caption" color="text.secondary">
            {profile.pronouns}
          </Typography>
        )}
        <Box sx={{ mt: 0.5 }}>
          <Chip
            label={profile.status.replace(/_/g, ' ')}
            size="small"
            sx={{ textTransform: 'capitalize', fontSize: 10 }}
          />
        </Box>
        {profile.current_locations && profile.current_locations.length > 0 && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {profile.current_locations.slice(0, 2).join(', ')}
          </Typography>
        )}
      </Box>

      {/* Favorite */}
      <Stack direction="row" justifyContent="flex-end" sx={{ px: 1.5, pb: 1.5 }}>
        <Tooltip title={profile.is_favorite ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            size="small"
            onClick={() => toggleFav.mutate(profile.id)}
            disabled={toggleFav.isPending}
          >
            {profile.is_favorite ? (
              <StarIcon fontSize="small" sx={{ color: tokens_colors.action.primary }} />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function FolderDetailPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const { data: folder, isLoading } = useFolderDetail(folderId ?? null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!folder) {
    return <Typography color="text.secondary">Folder not found.</Typography>;
  }

  const currentUserId = folder.owner_user_id; // approximation for owner check

  return (
    <>
      {/* Breadcrumb */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button
          component={RouterLink}
          to="/app/folders"
          startIcon={<BackIcon />}
          size="small"
          variant="text"
        >
          Folders
        </Button>
        <Typography color="text.secondary">/</Typography>
        <Typography variant="body2" fontWeight={600}>
          {folder.name}
        </Typography>
      </Stack>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h1">{folder.name}</Typography>
            <PrivacyBadge privacy={folder.privacy} />
          </Stack>
          {folder.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {folder.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {folder.member_count} profile{folder.member_count !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Stack>

      {/* Members grid */}
      {folder.members.length === 0 ? (
        <Typography color="text.secondary">
          No profiles in this folder yet. Use the Talent Database to add profiles.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 2,
          }}
        >
          {folder.members.map((profile) => (
            <MemberCard
              key={profile.id}
              profile={profile}
              folderId={folder.id}
              isOwner={true}
              onOpen={() => setSelectedProfileId(profile.id)}
            />
          ))}
        </Box>
      )}

      {/* Profile drawer — reuse from TalentDatabasePage via inline reimplementation */}
      <InlineCurationDrawer
        profileId={selectedProfileId}
        open={!!selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Inline curation drawer (simplified, read-only portfolio + notes)
// ---------------------------------------------------------------------------

function InlineCurationDrawer({
  profileId,
  open,
  onClose,
}: {
  profileId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  // Reuse the same drawer logic — import would cause circular dep, so inline lightly
  // For the folder detail page we show a simple profile view
  const { data: profile, isLoading } = useInternalFreelancerDetail(profileId);
  const toggleFav = useToggleFavorite();

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 680,
        bgcolor: 'background.paper',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {isLoading || !profile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid ${tokens_colors.border.default}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3">{profile.name}</Typography>
                <Chip
                  label={profile.status.replace(/_/g, ' ')}
                  size="small"
                  sx={{ textTransform: 'capitalize', mt: 0.5 }}
                />
              </Box>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => toggleFav.mutate(profile.id)}
                  disabled={toggleFav.isPending}
                >
                  <StarBorderIcon fontSize="small" />
                </IconButton>
                <Button size="small" variant="text" onClick={onClose}>
                  Close
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 3 }}>
            <Stack spacing={2}>
              {profile.email && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{profile.email}</Typography>
                </Box>
              )}
              {profile.current_locations && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body2">{profile.current_locations.join(', ')}</Typography>
                </Box>
              )}
              {profile.audience_tags && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Audience</Typography>
                  <Typography variant="body2">{profile.audience_tags.join(', ')}</Typography>
                </Box>
              )}
              {profile.style_tags && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Style</Typography>
                  <Typography variant="body2">{profile.style_tags.join(', ')}</Typography>
                </Box>
              )}
              {profile.summary && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Summary</Typography>
                  <Typography variant="body2">{profile.summary}</Typography>
                </Box>
              )}
              {profile.profile_statement && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Profile Statement</Typography>
                  <Typography variant="body2">{profile.profile_statement}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}
