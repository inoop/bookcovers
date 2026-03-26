import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import {
  useFolders,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
} from '../../api/hooks/useTalent';
import { colors as tokens_colors, radii as tokens_radii } from '../../theme/tokens';
import type { FolderResponse } from '../../api/types';

// ---------------------------------------------------------------------------
// Privacy badge
// ---------------------------------------------------------------------------

const PRIVACY_COLORS: Record<string, 'default' | 'primary' | 'secondary'> = {
  private: 'default',
  shared_users: 'secondary',
  shared_team: 'primary',
};

const PRIVACY_LABELS: Record<string, string> = {
  private: 'Private',
  shared_users: 'Shared',
  shared_team: 'Team',
};

function PrivacyBadge({ privacy }: { privacy: string }) {
  return (
    <Chip
      label={PRIVACY_LABELS[privacy] ?? privacy}
      color={PRIVACY_COLORS[privacy] ?? 'default'}
      size="small"
    />
  );
}

// ---------------------------------------------------------------------------
// Folder form dialog (create + edit)
// ---------------------------------------------------------------------------

function FolderFormDialog({
  open,
  onClose,
  folder,
}: {
  open: boolean;
  onClose: () => void;
  folder?: FolderResponse;
}) {
  const isEdit = !!folder;
  const [name, setName] = useState(folder?.name ?? '');
  const [privacy, setPrivacy] = useState(folder?.privacy ?? 'private');
  const [description, setDescription] = useState(folder?.description ?? '');

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (isEdit && folder) {
      updateFolder.mutate(
        { folderId: folder.id, body: { name, privacy, description: description || undefined } },
        { onSuccess: onClose }
      );
    } else {
      createFolder.mutate(
        { name, privacy, description: description || undefined },
        { onSuccess: onClose }
      );
    }
  };

  const isPending = createFolder.isPending || updateFolder.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Folder' : 'New Folder'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
          />
          <FormControl fullWidth>
            <InputLabel>Privacy</InputLabel>
            <Select
              value={privacy}
              label="Privacy"
              onChange={(e) => setPrivacy(e.target.value)}
            >
              <MenuItem value="private">Private — only you</MenuItem>
              <MenuItem value="shared_team">Shared with Team — all internal users</MenuItem>
              <MenuItem value="shared_users">Shared with Users — specific people</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
        >
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Folder card
// ---------------------------------------------------------------------------

function FolderCard({
  folder,
  onEdit,
  onDelete,
}: {
  folder: FolderResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Box
      sx={{
        border: `1px solid ${tokens_colors.border.default}`,
        borderRadius: `${tokens_radii.sm}px`,
        p: 2.5,
        bgcolor: 'background.paper',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
        transition: 'box-shadow 180ms',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FolderIcon sx={{ color: tokens_colors.action.secondary }} />
          <Typography
            component={RouterLink}
            to={`/app/folders/${folder.id}`}
            variant="subtitle1"
            fontWeight={700}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { color: tokens_colors.action.primary },
            }}
          >
            {folder.name}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit folder">
            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete folder">
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <PrivacyBadge privacy={folder.privacy} />
        <Typography variant="caption" color="text.secondary">
          {folder.member_count} profile{folder.member_count !== 1 ? 's' : ''}
        </Typography>
      </Stack>

      {folder.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {folder.description}
        </Typography>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const PRIVACY_TABS = [
  { label: 'All', value: '' },
  { label: 'Private', value: 'private' },
  { label: 'Team', value: 'shared_team' },
  { label: 'Shared', value: 'shared_users' },
];

export default function FoldersPage() {
  const [privacyFilter, setPrivacyFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editFolder, setEditFolder] = useState<FolderResponse | null>(null);

  const { data: folders = [], isLoading } = useFolders();
  const deleteFolder = useDeleteFolder();

  const displayed = privacyFilter
    ? folders.filter((f) => f.privacy === privacyFilter)
    : folders;

  const tabIdx = PRIVACY_TABS.findIndex((t) => t.value === privacyFilter);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h1">Folders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          New Folder
        </Button>
      </Stack>

      <Tabs
        value={tabIdx === -1 ? 0 : tabIdx}
        onChange={(_, idx) => setPrivacyFilter(PRIVACY_TABS[idx].value)}
        sx={{ mb: 3, borderBottom: `1px solid ${tokens_colors.border.default}` }}
      >
        {PRIVACY_TABS.map((t) => (
          <Tab key={t.value} label={t.label} />
        ))}
      </Tabs>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : displayed.length === 0 ? (
        <Typography color="text.secondary">
          {privacyFilter ? 'No folders with this privacy setting.' : 'No folders yet. Create your first folder.'}
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 2,
          }}
        >
          {displayed.map((f) => (
            <FolderCard
              key={f.id}
              folder={f}
              onEdit={() => setEditFolder(f)}
              onDelete={() => {
                if (confirm(`Delete folder "${f.name}"?`)) {
                  deleteFolder.mutate(f.id);
                }
              }}
            />
          ))}
        </Box>
      )}

      {/* Create dialog */}
      <FolderFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit dialog */}
      {editFolder && (
        <FolderFormDialog
          open={!!editFolder}
          onClose={() => setEditFolder(null)}
          folder={editFolder}
        />
      )}
    </>
  );
}
