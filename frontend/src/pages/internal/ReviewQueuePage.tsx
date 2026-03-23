import { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  useReviewSummary,
  useReviewQueue,
  useInternalProfile,
  useProfileNotes,
  useReviewAction,
  useAssetAction,
  useCreateNote,
} from '../../api/hooks/useReview';
import type { ProfileQueueItem, PortfolioAssetReviewItem, ProfileNote } from '../../api/types';
import { colors as tokens_colors, radii as tokens_radii } from '../../theme/tokens';

// --- Status helpers ---

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

// --- Summary bar ---

function SummaryBar() {
  const { data } = useReviewSummary();
  if (!data) return null;

  const items = [
    { label: 'Submitted', value: data.submitted, color: 'warning' as const },
    { label: 'Under Review', value: data.under_review, color: 'info' as const },
    { label: 'Changes Requested', value: data.changes_requested, color: 'warning' as const },
    { label: 'Approved', value: data.approved, color: 'success' as const },
    { label: 'Rejected', value: data.rejected, color: 'error' as const },
    { label: 'Archived', value: data.archived, color: 'default' as const },
  ];

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 4 }}>
      {items.map(({ label, value, color }) => (
        <Chip
          key={label}
          label={`${label}: ${value}`}
          color={color}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ))}
    </Stack>
  );
}

// --- Portfolio asset card ---

function AssetCard({
  asset,
  profileId,
}: {
  asset: PortfolioAssetReviewItem;
  profileId: string;
}) {
  const assetAction = useAssetAction();

  const act = (action: string) =>
    assetAction.mutate({ assetId: asset.id, action, profileId });

  return (
    <Box
      sx={{
        border: `1px solid ${tokens_colors.border.default}`,
        borderRadius: tokens_radii.md,
        overflow: 'hidden',
        width: 200,
        flexShrink: 0,
      }}
    >
      {asset.media_url ? (
        <Box
          component="img"
          src={asset.media_url}
          alt={asset.title ?? 'Portfolio asset'}
          sx={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 160,
            bgcolor: tokens_colors.surface.soft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {asset.asset_type}
          </Typography>
        </Box>
      )}
      <Box sx={{ p: 1.5 }}>
        <Typography variant="caption" fontWeight={600} noWrap display="block">
          {asset.title ?? '(untitled)'}
        </Typography>
        <StatusChip status={asset.review_status} />
        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => act('approve')}
            disabled={assetAction.isPending || asset.review_status === 'approved'}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => act('reject')}
            disabled={assetAction.isPending || asset.review_status === 'rejected'}
          >
            Reject
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => act('hide')}
            disabled={assetAction.isPending || asset.review_status === 'hidden'}
          >
            Hide
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

// --- Note item ---

function NoteItem({ note }: { note: ProfileNote }) {
  const isSystem = note.note_type === 'system';
  return (
    <Box
      sx={{
        p: 2,
        borderLeft: `3px solid ${isSystem ? tokens_colors.border.default : tokens_colors.action.primary}`,
        bgcolor: isSystem ? tokens_colors.surface.soft : 'transparent',
        borderRadius: `0 ${tokens_radii.sm} ${tokens_radii.sm} 0`,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <Chip
          label={note.note_type.replace(/_/g, ' ')}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'capitalize', fontSize: 10 }}
        />
        <Typography variant="caption" color="text.secondary">
          {formatDate(note.created_at)}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {note.body}
      </Typography>
    </Box>
  );
}

// --- Profile review drawer ---

const NOTE_TYPES = ['general', 'fit', 'compliance', 'project', 'evaluation'];

function ProfileDrawer({
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
  const [actionNote, setActionNote] = useState('');

  const { data: profile, isLoading } = useInternalProfile(profileId);
  const { data: notes } = useProfileNotes(profileId);
  const reviewAction = useReviewAction();
  const createNote = useCreateNote();

  const act = (action: string) => {
    if (!profileId) return;
    reviewAction.mutate(
      { profileId, action: { action, note: actionNote || undefined } },
      { onSuccess: () => setActionNote('') }
    );
  };

  const submitNote = () => {
    if (!profileId || !noteBody.trim()) return;
    createNote.mutate(
      { profileId, note_type: noteType, body: noteBody },
      { onSuccess: () => setNoteBody('') }
    );
  };

  // Split notes into human vs system for history tab
  const humanNotes = (notes ?? []).filter((n) => n.note_type !== 'system');
  const systemNotes = (notes ?? []).filter((n) => n.note_type === 'system');

  const status = profile?.status ?? '';
  const canClaim = status === 'submitted';
  const canApprove = ['submitted', 'under_review'].includes(status);
  const canReject = ['submitted', 'under_review'].includes(status);
  const canRequestChanges = ['submitted', 'under_review'].includes(status);
  const canArchive = ['under_review', 'approved', 'rejected', 'changes_requested'].includes(status);
  const canHide = status === 'approved';

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
          {/* Drawer header */}
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
              <Button variant="text" onClick={onClose} size="small">
                Close
              </Button>
            </Stack>

            {/* Action bar */}
            <Stack spacing={1} sx={{ mt: 2 }}>
              <ButtonGroup size="small" variant="outlined">
                {canClaim && (
                  <Button onClick={() => act('claim')} disabled={reviewAction.isPending}>
                    Claim
                  </Button>
                )}
                {canApprove && (
                  <Button color="success" onClick={() => act('approve')} disabled={reviewAction.isPending}>
                    Approve
                  </Button>
                )}
                {canReject && (
                  <Button color="error" onClick={() => act('reject')} disabled={reviewAction.isPending}>
                    Reject
                  </Button>
                )}
                {canRequestChanges && (
                  <Button onClick={() => act('request_changes')} disabled={reviewAction.isPending}>
                    Request Changes
                  </Button>
                )}
                {canArchive && (
                  <Button onClick={() => act('archive')} disabled={reviewAction.isPending}>
                    Archive
                  </Button>
                )}
                {canHide && (
                  <Button onClick={() => act('hide')} disabled={reviewAction.isPending}>
                    Hide
                  </Button>
                )}
              </ButtonGroup>
              <TextField
                size="small"
                placeholder="Optional note to attach to this action…"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                fullWidth
                multiline
                maxRows={3}
              />
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
            <Tab label={`Notes (${humanNotes.length})`} />
            <Tab label="History" />
          </Tabs>

          {/* Tab content */}
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
                  {profile.worked_with_prh && <Field label="PRH details" value={profile.prh_details} />}
                  <Field label="PRH employee" value={profile.employee_of_prh ? 'Yes' : 'No'} />
                  {profile.employee_of_prh && (
                    <Field label="Employee details" value={profile.prh_employee_details} />
                  )}
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
                    label="Lived experience statement"
                    value={profile.lived_experience_statement}
                  />
                  <Field label="Books excited about" value={profile.books_excited_about?.join(', ')} />
                </ProfileSection>

                <ProfileSection title="Internal / Admin">
                  <Field label="Approved for hire" value={profile.approved_for_hire ? 'Yes' : 'No'} />
                  <Field label="Featured" value={profile.featured ? 'Yes' : 'No'} />
                  <Field label="Review owner" value={profile.review_owner_id ?? '—'} />
                  <Field label="Last reviewed" value={formatDate(profile.last_reviewed_at)} />
                  <Field label="Submitted" value={formatDate(profile.created_at)} />
                </ProfileSection>
              </Stack>
            )}

            {/* Portfolio tab */}
            {tab === 1 && (
              <Box>
                {profile.portfolio_assets.length === 0 ? (
                  <Typography color="text.secondary">No portfolio assets.</Typography>
                ) : (
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    {profile.portfolio_assets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} profileId={profile.id} />
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Notes tab */}
            {tab === 2 && (
              <Stack spacing={2}>
                <Stack spacing={1.5}>
                  {humanNotes.length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      No notes yet.
                    </Typography>
                  )}
                  {humanNotes.map((n) => (
                    <NoteItem key={n.id} note={n} />
                  ))}
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
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
              </Stack>
            )}

            {/* History tab */}
            {tab === 3 && (
              <Stack spacing={1.5}>
                {systemNotes.length === 0 && (
                  <Typography color="text.secondary" variant="body2">
                    No audit history.
                  </Typography>
                )}
                {systemNotes.map((n) => (
                  <NoteItem key={n.id} note={n} />
                ))}
              </Stack>
            )}
          </Box>
        </>
      )}
    </Drawer>
  );
}

// --- Small presentational helpers ---

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

// --- Queue table ---

const STATUS_FILTER_TABS = [
  { label: 'Needs Review', value: 'submitted,under_review' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Changes Requested', value: 'changes_requested' },
  { label: 'All', value: 'submitted,under_review,changes_requested,approved,rejected,archived' },
];

function QueueTable({
  items,
  onOpen,
}: {
  items: ProfileQueueItem[];
  onOpen: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 3 }}>
        No profiles in this queue.
      </Typography>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Submitted</TableCell>
          <TableCell>Last Reviewed</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((p) => (
          <TableRow key={p.id} hover>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>
                {p.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {p.email}
              </Typography>
            </TableCell>
            <TableCell>
              <StatusChip status={p.status} />
            </TableCell>
            <TableCell>
              <Typography variant="body2">{formatDate(p.created_at)}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{formatDate(p.last_reviewed_at)}</Typography>
            </TableCell>
            <TableCell align="right">
              <Button size="small" variant="outlined" onClick={() => onOpen(p.id)}>
                Open
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// --- Main page ---

export default function ReviewQueuePage() {
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_TABS[0].value);
  const [page, setPage] = useState(1);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const { data: queue, isLoading } = useReviewQueue({
    status: statusFilter,
    page,
    page_size: 25,
  });

  const handleTabChange = (_: React.SyntheticEvent, idx: number) => {
    setStatusFilter(STATUS_FILTER_TABS[idx].value);
    setPage(1);
  };

  const currentTabIdx = STATUS_FILTER_TABS.findIndex((t) => t.value === statusFilter);

  return (
    <>
      <Typography variant="h1" sx={{ mb: 4 }}>
        Review Queue
      </Typography>

      <SummaryBar />

      <Tabs
        value={currentTabIdx === -1 ? 0 : currentTabIdx}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: `1px solid ${tokens_colors.border.default}` }}
      >
        {STATUS_FILTER_TABS.map((t) => (
          <Tab key={t.value} label={t.label} />
        ))}
      </Tabs>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <QueueTable items={queue?.items ?? []} onOpen={(id) => setSelectedProfileId(id)} />

          {/* Pagination */}
          {queue && queue.total_pages > 1 && (
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ lineHeight: '30px' }}>
                Page {page} of {queue.total_pages}
              </Typography>
              <Button
                size="small"
                disabled={page >= queue.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          )}
        </>
      )}

      <ProfileDrawer
        profileId={selectedProfileId}
        open={!!selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
      />
    </>
  );
}
