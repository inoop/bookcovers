import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FolderOpen as FolderIcon,
  GridView as GridIcon,
  ViewList as ListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  useInternalFreelancers,
  useInternalFreelancerDetail,
  useToggleFavorite,
  useFolders,
  useAddToFolder,
  useRemoveFromFolder,
  useTalentNotes,
  useCreateTalentNote,
  useUpdateTalentNote,
  useDeleteTalentNote,
  useProfileFeedback,
  useCreateFeedback,
} from '../../api/hooks/useTalent';
import { useTaxonomy } from '../../api/hooks/useTaxonomy';
import FilterChipGroup from '../../components/shared/FilterChipGroup';
import { colors as tokens_colors, radii as tokens_radii } from '../../theme/tokens';
import type {
  InternalFreelancerCard,
  InternalFreelancerFilters,
  ProfileNote,
  FeedbackEntry,
} from '../../api/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  draft: 'default',
  submitted: 'warning',
  under_review: 'info',
  changes_requested: 'warning',
  approved: 'success',
  rejected: 'error',
  archived: 'default',
  suspended: 'error',
};

function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      label={status.replace(/_/g, ' ')}
      color={STATUS_COLORS[status] ?? 'default'}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  );
}

function formatDate(iso: string | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const NOTE_TYPES = ['general', 'fit', 'compliance', 'project', 'evaluation'];

// ---------------------------------------------------------------------------
// Folder picker dialog
// ---------------------------------------------------------------------------

function FolderPickerDialog({
  open,
  onClose,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  profile: InternalFreelancerCard | null;
}) {
  const { data: folders = [] } = useFolders();
  const addToFolder = useAddToFolder();
  const removeFromFolder = useRemoveFromFolder();

  if (!profile) return null;

  const toggle = (folderId: string) => {
    if (profile.folder_ids.includes(folderId)) {
      removeFromFolder.mutate({ folderId, profileId: profile.id });
    } else {
      addToFolder.mutate({ folderId, profileId: profile.id });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add to Folder — {profile.name}</DialogTitle>
      <DialogContent>
        {folders.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 1 }}>
            No folders yet. Create one from the Folders page.
          </Typography>
        ) : (
          <FormGroup>
            {folders.map((f) => (
              <FormControlLabel
                key={f.id}
                control={
                  <Switch
                    checked={profile.folder_ids.includes(f.id)}
                    onChange={() => toggle(f.id)}
                    disabled={addToFolder.isPending || removeFromFolder.isPending}
                  />
                }
                label={f.name}
              />
            ))}
          </FormGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Internal card tile (grid view)
// ---------------------------------------------------------------------------

function InternalCardTile({
  profile,
  onOpen,
  onFolderClick,
}: {
  profile: InternalFreelancerCard;
  onOpen: () => void;
  onFolderClick: () => void;
}) {
  const toggleFav = useToggleFavorite();

  return (
    <Box
      sx={{
        border: `1px solid ${tokens_colors.border.default}`,
        borderRadius: tokens_radii.md,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
        transition: 'box-shadow 180ms',
      }}
    >
      {/* Hero */}
      <Box
        onClick={onOpen}
        sx={{
          height: 140,
          bgcolor: tokens_colors.surface.soft,
          backgroundImage: profile.hero_image_url ? `url(${profile.hero_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!profile.hero_image_url && (
          <Typography variant="caption" color="text.secondary">
            No image
          </Typography>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ p: 2, cursor: 'pointer' }} onClick={onOpen}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {profile.name}
            </Typography>
            {profile.pronouns && (
              <Typography variant="caption" color="text.secondary">
                {profile.pronouns}
              </Typography>
            )}
          </Box>
          <StatusChip status={profile.status} />
        </Stack>

        {profile.current_locations && profile.current_locations.length > 0 && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {profile.current_locations.slice(0, 2).join(', ')}
          </Typography>
        )}

        {profile.summary && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {profile.summary}
          </Typography>
        )}

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {profile.audience_tags?.slice(0, 2).map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" />
          ))}
        </Stack>
      </Box>

      {/* Actions */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{ px: 1.5, pb: 1.5 }}
        onClick={(e) => e.stopPropagation()}
      >
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
        <Tooltip title="Manage folders">
          <IconButton size="small" onClick={onFolderClick}>
            <FolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Profile curation drawer helpers
// ---------------------------------------------------------------------------

function Field({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {value}
      </Typography>
    </Box>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

function NoteRow({
  note,
  profileId,
}: {
  note: ProfileNote;
  profileId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(note.body);
  const updateNote = useUpdateTalentNote();
  const deleteNote = useDeleteTalentNote();

  return (
    <Box
      sx={{
        p: 1.5,
        borderLeft: `3px solid ${tokens_colors.action.primary}`,
        borderRadius: `0 ${tokens_radii.sm}px ${tokens_radii.sm}px 0`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={note.note_type}
            size="small"
            variant="outlined"
            sx={{ textTransform: 'capitalize', fontSize: 10 }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatDate(note.created_at)}
          </Typography>
        </Stack>
        <Stack direction="row">
          <IconButton size="small" onClick={() => setEditing(!editing)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => deleteNote.mutate({ profileId, noteId: note.id })}
            disabled={deleteNote.isPending}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      {editing ? (
        <Stack spacing={1}>
          <TextField
            size="small"
            multiline
            rows={3}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() =>
                updateNote.mutate(
                  { profileId, noteId: note.id, body: { body: editBody } },
                  { onSuccess: () => setEditing(false) }
                )
              }
              disabled={updateNote.isPending}
            >
              Save
            </Button>
            <Button size="small" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {note.body}
        </Typography>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Profile curation drawer
// ---------------------------------------------------------------------------

export function ProfileCurationDrawer({
  profileId,
  open,
  onClose,
}: {
  profileId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(0);
  const [noteBody, setNoteBody] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [feedbackCtx, setFeedbackCtx] = useState('');

  const { data: profile, isLoading } = useInternalFreelancerDetail(profileId);
  const { data: notes = [] } = useTalentNotes(profileId);
  const { data: feedbackList = [] } = useProfileFeedback(profileId);
  const { data: folders = [] } = useFolders();
  const createNote = useCreateTalentNote();
  const createFeedback = useCreateFeedback();
  const toggleFav = useToggleFavorite();
  const addToFolder = useAddToFolder();
  const removeFromFolder = useRemoveFromFolder();

  const submitNote = () => {
    if (!profileId || !noteBody.trim()) return;
    createNote.mutate(
      { profileId, note_type: noteType, body: noteBody },
      { onSuccess: () => setNoteBody('') }
    );
  };

  const submitFeedback = () => {
    if (!profileId || !feedbackBody.trim()) return;
    createFeedback.mutate(
      { profileId, body: { body: feedbackBody, project_context: feedbackCtx || undefined } },
      {
        onSuccess: () => {
          setFeedbackBody('');
          setFeedbackCtx('');
        },
      }
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 720, display: 'flex', flexDirection: 'column' } }}
    >
      {isLoading || !profile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid ${tokens_colors.border.default}`,
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 1,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h3" sx={{ mb: 0.5 }}>
                  {profile.name}
                </Typography>
                <StatusChip status={profile.status} />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Toggle favorite">
                  <IconButton
                    size="small"
                    onClick={() => toggleFav.mutate(profile.id)}
                    disabled={toggleFav.isPending}
                  >
                    <StarBorderIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button variant="text" size="small" onClick={onClose}>
                  Close
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ px: 3, borderBottom: `1px solid ${tokens_colors.border.default}` }}
          >
            <Tab label="Profile" />
            <Tab label={`Portfolio (${profile.portfolio_assets.length})`} />
            <Tab label={`Notes (${notes.length})`} />
            <Tab label={`Feedback (${feedbackList.length})`} />
            <Tab label="Folders" />
          </Tabs>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 3 }}>
            {/* Profile tab */}
            {tab === 0 && (
              <Stack spacing={3} divider={<Divider />}>
                <ProfileSection title="About">
                  <Field label="Name" value={profile.name} />
                  <Field label="Pronouns" value={profile.pronouns} />
                  <Field label="Email" value={profile.email} />
                  <Field label="Summary" value={profile.summary} />
                  <Field label="Self-submission" value={profile.is_self_submission ? 'Yes' : 'No'} />
                  <Field label="Relation type" value={profile.relation_type} />
                </ProfileSection>
                <ProfileSection title="Location">
                  <Field label="Current" value={profile.current_locations?.join(', ')} />
                  <Field label="Past" value={profile.past_locations?.join(', ')} />
                </ProfileSection>
                <ProfileSection title="Representation">
                  <Field label="Has agent" value={profile.has_agent ? 'Yes' : 'No'} />
                  {profile.has_agent && <Field label="Agent details" value={profile.agent_details} />}
                  <Field label="Worked with PRH" value={profile.worked_with_prh ? 'Yes' : 'No'} />
                  {profile.worked_with_prh && (
                    <Field label="PRH details" value={profile.prh_details} />
                  )}
                  <Field label="PRH employee" value={profile.employee_of_prh ? 'Yes' : 'No'} />
                </ProfileSection>
                <ProfileSection title="Artistic Classifications">
                  <Field label="Audience" value={profile.audience_tags?.join(', ')} />
                  <Field label="Style" value={profile.style_tags?.join(', ')} />
                  <Field label="Genre" value={profile.genre_tags?.join(', ')} />
                  <Field label="Image tags" value={profile.image_tags?.join(', ')} />
                  <Field label="Uses AI" value={profile.uses_ai ? 'Yes' : 'No'} />
                  {profile.uses_ai && <Field label="AI details" value={profile.ai_details} />}
                </ProfileSection>
                <ProfileSection title="Self-Identification">
                  <Field label="Profile statement" value={profile.profile_statement} />
                  <Field
                    label="Lived experience"
                    value={profile.lived_experience_statement}
                  />
                  <Field
                    label="Books excited about"
                    value={profile.books_excited_about?.join(', ')}
                  />
                </ProfileSection>
                <ProfileSection title="Internal">
                  <Field
                    label="Approved for hire"
                    value={profile.approved_for_hire ? 'Yes' : 'No'}
                  />
                  <Field label="Featured" value={profile.featured ? 'Yes' : 'No'} />
                  <Field label="Submitted" value={formatDate(profile.created_at)} />
                  <Field label="Last reviewed" value={formatDate(profile.last_reviewed_at)} />
                </ProfileSection>
              </Stack>
            )}

            {/* Portfolio tab */}
            {tab === 1 && (
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {profile.portfolio_assets.length === 0 && (
                  <Typography color="text.secondary">No portfolio assets.</Typography>
                )}
                {profile.portfolio_assets.map((asset) => (
                  <Box
                    key={asset.id}
                    sx={{
                      width: 160,
                      border: `1px solid ${tokens_colors.border.default}`,
                      borderRadius: tokens_radii.md,
                      overflow: 'hidden',
                    }}
                  >
                    {asset.media_url ? (
                      <Box
                        component="img"
                        src={asset.media_url}
                        alt={asset.title ?? ''}
                        sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 120,
                          bgcolor: tokens_colors.surface.soft,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption">{asset.asset_type}</Typography>
                      </Box>
                    )}
                    <Box sx={{ p: 1 }}>
                      <Typography variant="caption" noWrap display="block">
                        {asset.title ?? '(untitled)'}
                      </Typography>
                      <Chip label={asset.review_status} size="small" sx={{ fontSize: 10 }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Notes tab */}
            {tab === 2 && profileId && (
              <Stack spacing={2}>
                <Stack spacing={1.5}>
                  {notes.length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      No notes yet.
                    </Typography>
                  )}
                  {notes.map((n) => (
                    <NoteRow key={n.id} note={n} profileId={profileId} />
                  ))}
                </Stack>
                <Divider />
                <Typography variant="subtitle2">Add Note</Typography>
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={noteType}
                    label="Type"
                    onChange={(e) => setNoteType(e.target.value)}
                  >
                    {NOTE_TYPES.map((t) => (
                      <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Write a note…"
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={submitNote}
                  disabled={createNote.isPending || !noteBody.trim()}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Note
                </Button>
              </Stack>
            )}

            {/* Feedback tab */}
            {tab === 3 && profileId && (
              <Stack spacing={2}>
                <Stack spacing={1.5}>
                  {feedbackList.length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      No feedback yet.
                    </Typography>
                  )}
                  {feedbackList.map((fb: FeedbackEntry) => (
                    <Box
                      key={fb.id}
                      sx={{
                        p: 1.5,
                        border: `1px solid ${tokens_colors.border.default}`,
                        borderRadius: tokens_radii.md,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(fb.created_at)}
                        {fb.project_context && ` · ${fb.project_context}`}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                        {fb.body}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider />
                <Typography variant="subtitle2">Add Feedback</Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Project context (optional)"
                  value={feedbackCtx}
                  onChange={(e) => setFeedbackCtx(e.target.value)}
                />
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Feedback…"
                  value={feedbackBody}
                  onChange={(e) => setFeedbackBody(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={submitFeedback}
                  disabled={createFeedback.isPending || !feedbackBody.trim()}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Feedback
                </Button>
              </Stack>
            )}

            {/* Folders tab */}
            {tab === 4 && profileId && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Folder Membership</Typography>
                {folders.length === 0 && (
                  <Typography color="text.secondary" variant="body2">
                    No folders available. Create one from the Folders page.
                  </Typography>
                )}
                {folders.map((f) => (
                  <Stack key={f.id} direction="row" alignItems="center" spacing={2}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {f.name}
                    </Typography>
                    <Chip
                      label={f.privacy.replace(/_/g, ' ')}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => addToFolder.mutate({ folderId: f.id, profileId })}
                      disabled={addToFolder.isPending}
                    >
                      Add
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeFromFolder.mutate({ folderId: f.id, profileId })}
                      disabled={removeFromFolder.isPending}
                    >
                      Remove
                    </Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </>
      )}
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// Filter rail
// ---------------------------------------------------------------------------

function FilterRail({
  filters,
  onChange,
}: {
  filters: InternalFreelancerFilters;
  onChange: (f: Partial<InternalFreelancerFilters>) => void;
}) {
  const { data: audienceTerms = [] } = useTaxonomy('audience');
  const { data: styleTerms = [] } = useTaxonomy('style');
  const { data: genreTerms = [] } = useTaxonomy('genre');
  const { data: folders = [] } = useFolders();

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        borderRight: `1px solid ${tokens_colors.border.default}`,
        pr: 3,
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {/* Keyword */}
      <TextField
        size="small"
        fullWidth
        placeholder="Search by name…"
        value={filters.q ?? ''}
        onChange={(e) => onChange({ q: e.target.value || undefined, page: 1 })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <FilterChipGroup
        label="Audience"
        options={audienceTerms.map((t) => t.label)}
        selected={filters.audience ?? []}
        onChange={(v) => onChange({ audience: v.length ? v : undefined, page: 1 })}
      />

      <FilterChipGroup
        label="Style"
        options={styleTerms.map((t) => t.label)}
        selected={filters.style ?? []}
        onChange={(v) => onChange({ style: v.length ? v : undefined, page: 1 })}
      />

      <FilterChipGroup
        label="Genre"
        options={genreTerms.map((t) => t.label)}
        selected={filters.genre ?? []}
        onChange={(v) => onChange({ genre: v.length ? v : undefined, page: 1 })}
      />

      {/* Boolean toggles */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'text.secondary',
            display: 'block',
            mb: 1,
          }}
        >
          Filters
        </Typography>
        <FormGroup>
          {[
            { key: 'is_favorite', label: 'Favorites only' },
            { key: 'has_agent', label: 'Has agent' },
            { key: 'worked_with_prh', label: 'PRH history' },
            { key: 'employee_of_prh', label: 'PRH employee' },
            { key: 'uses_ai', label: 'Uses AI' },
          ].map(({ key, label }) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  size="small"
                  checked={!!(filters as Record<string, unknown>)[key]}
                  onChange={(e) =>
                    onChange({ [key]: e.target.checked || undefined, page: 1 })
                  }
                />
              }
              label={<Typography variant="body2">{label}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Folder filter */}
      {folders.length > 0 && (
        <FormControl size="small" fullWidth sx={{ mb: 3 }}>
          <InputLabel>Folder</InputLabel>
          <Select
            value={filters.folder_id ?? ''}
            label="Folder"
            onChange={(e) => onChange({ folder_id: e.target.value || undefined, page: 1 })}
          >
            <MenuItem value="">All</MenuItem>
            {folders.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Button
        size="small"
        onClick={() =>
          onChange({
            q: undefined,
            audience: undefined,
            style: undefined,
            genre: undefined,
            location: undefined,
            uses_ai: undefined,
            has_agent: undefined,
            worked_with_prh: undefined,
            employee_of_prh: undefined,
            folder_id: undefined,
            is_favorite: undefined,
            page: 1,
          })
        }
      >
        Clear filters
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function TalentDatabasePage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<InternalFreelancerFilters>({ page: 1, page_size: 24 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [folderPickerProfile, setFolderPickerProfile] = useState<InternalFreelancerCard | null>(
    null
  );

  // Support ?open=<profile_id> deep-link from Work Samples
  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId) setSelectedProfileId(openId);
  }, [searchParams]);

  const { data, isLoading } = useInternalFreelancers({ ...filters, status: 'approved' });
  const profiles = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 0;
  const page = filters.page ?? 1;

  const updateFilters = (partial: Partial<InternalFreelancerFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  return (
    <>
      <Typography variant="h1" sx={{ mb: 4 }}>
        Talent Database
      </Typography>

      <Stack direction="row" spacing={4} alignItems="flex-start">
        {/* Filter rail */}
        <FilterRail filters={filters} onChange={updateFilters} />

        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Top bar */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography variant="body2" color="text.secondary">
              {isLoading ? 'Loading…' : `${total} profile${total !== 1 ? 's' : ''}`}
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list">
                <ListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CircularProgress />
            </Box>
          ) : profiles.length === 0 ? (
            <Typography color="text.secondary">No profiles match your filters.</Typography>
          ) : viewMode === 'grid' ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 2,
              }}
            >
              {profiles.map((p) => (
                <InternalCardTile
                  key={p.id}
                  profile={p}
                  onOpen={() => setSelectedProfileId(p.id)}
                  onFolderClick={() => setFolderPickerProfile(p)}
                />
              ))}
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Audience</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {p.name}
                      </Typography>
                      {p.pronouns && (
                        <Typography variant="caption" color="text.secondary">
                          {p.pronouns}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={p.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {p.current_locations?.slice(0, 2).join(', ') ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {p.audience_tags?.slice(0, 2).join(', ') ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => setFolderPickerProfile(p)}
                        >
                          <FolderIcon fontSize="small" />
                        </IconButton>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedProfileId(p.id)}
                        >
                          Open
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                size="small"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: page - 1 })}
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ lineHeight: '30px' }}>
                Page {page} of {totalPages}
              </Typography>
              <Button
                size="small"
                disabled={page >= totalPages}
                onClick={() => updateFilters({ page: page + 1 })}
              >
                Next
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>

      <ProfileCurationDrawer
        profileId={selectedProfileId}
        open={!!selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
      />

      <FolderPickerDialog
        open={!!folderPickerProfile}
        onClose={() => setFolderPickerProfile(null)}
        profile={folderPickerProfile}
      />
    </>
  );
}
