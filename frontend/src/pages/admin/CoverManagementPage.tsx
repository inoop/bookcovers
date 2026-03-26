import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import {
  useAdminCovers,
  useCreateCover,
  useUpdateCover,
  useAddContributor,
  useRemoveContributor,
  useUploadCoverImage,
} from '../../api/hooks/useAdminCovers';
import type {
  CoverAdminResponse,
  CoverCreateRequest,
  ContributorCreateRequest,
} from '../../api/types';
import { colors } from '../../theme/tokens';

const VISIBILITY_OPTIONS = ['public', 'hidden', 'archived'];
const CONTRIBUTOR_TYPES = ['designer', 'illustrator', 'photographer', 'lettering_artist', 'animator', 'other'];

interface CoverForm {
  title: string;
  author_name: string;
  subtitle: string;
  publisher: string;
  imprint: string;
  publication_date: string;
  audience_tags: string;
  genre_tags: string;
  visual_tags: string;
  external_book_url: string;
  primary_image_asset_id: string;
  visibility: string;
}

const emptyForm = (): CoverForm => ({
  title: '',
  author_name: '',
  subtitle: '',
  publisher: '',
  imprint: '',
  publication_date: '',
  audience_tags: '',
  genre_tags: '',
  visual_tags: '',
  external_book_url: '',
  primary_image_asset_id: '',
  visibility: 'public',
});

function coverToForm(c: CoverAdminResponse): CoverForm {
  return {
    title: c.title,
    author_name: c.author_name,
    subtitle: c.subtitle ?? '',
    publisher: c.publisher ?? '',
    imprint: c.imprint ?? '',
    publication_date: c.publication_date ?? '',
    audience_tags: (c.audience_tags ?? []).join(', '),
    genre_tags: (c.genre_tags ?? []).join(', '),
    visual_tags: (c.visual_tags ?? []).join(', '),
    external_book_url: c.external_book_url ?? '',
    primary_image_asset_id: c.primary_image_asset_id,
    visibility: c.visibility,
  };
}

const visibilityColor: Record<string, 'success' | 'warning' | 'default'> = {
  public: 'success',
  hidden: 'warning',
  archived: 'default',
};

function CoverFormFields({
  form,
  onChange,
  imagePreviewUrl,
}: {
  form: CoverForm;
  onChange: (f: CoverForm) => void;
  imagePreviewUrl?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadCoverImage();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = localPreview ?? imagePreviewUrl ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setLocalPreview(URL.createObjectURL(file));
    try {
      const result = await uploadImage.mutateAsync(file);
      onChange({ ...form, primary_image_asset_id: result.id });
      setLocalPreview(result.url);
    } catch {
      setLocalPreview(null);
      setUploadError('Upload failed. Please try again.');
    }
    e.target.value = '';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField label="Title" value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} required fullWidth />
      <TextField label="Author Name" value={form.author_name} onChange={(e) => onChange({ ...form, author_name: e.target.value })} required fullWidth />
      <TextField label="Subtitle" value={form.subtitle} onChange={(e) => onChange({ ...form, subtitle: e.target.value })} fullWidth />
      <TextField label="Publisher" value={form.publisher} onChange={(e) => onChange({ ...form, publisher: e.target.value })} fullWidth />
      <TextField label="Imprint" value={form.imprint} onChange={(e) => onChange({ ...form, imprint: e.target.value })} fullWidth />
      <TextField label="Publication Date" type="date" value={form.publication_date} onChange={(e) => onChange({ ...form, publication_date: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />

      {/* Cover image upload */}
      <Box>
        <Typography variant="body2" sx={{ mb: 1, color: colors.text.secondary }}>Cover Image *</Typography>
        {displayUrl && (
          <Box
            component="img"
            src={displayUrl}
            sx={{ width: 120, height: 160, objectFit: 'cover', borderRadius: '4px', display: 'block', mb: 1, border: `1px solid ${colors.border.default}` }}
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={uploadImage.isPending ? undefined : <UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadImage.isPending}
        >
          {uploadImage.isPending ? 'Uploading…' : displayUrl ? 'Replace image' : 'Upload image'}
        </Button>
        {uploadError && (
          <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>{uploadError}</Typography>
        )}
        {form.primary_image_asset_id && (
          <Typography variant="caption" sx={{ color: colors.text.muted, display: 'block', mt: 0.5 }}>
            Asset ID: {form.primary_image_asset_id}
          </Typography>
        )}
      </Box>

      <TextField label="Audience Tags (comma-separated)" value={form.audience_tags} onChange={(e) => onChange({ ...form, audience_tags: e.target.value })} fullWidth />
      <TextField label="Genre Tags (comma-separated)" value={form.genre_tags} onChange={(e) => onChange({ ...form, genre_tags: e.target.value })} fullWidth />
      <TextField label="Visual Tags (comma-separated)" value={form.visual_tags} onChange={(e) => onChange({ ...form, visual_tags: e.target.value })} fullWidth />
      <TextField label="External Book URL" value={form.external_book_url} onChange={(e) => onChange({ ...form, external_book_url: e.target.value })} fullWidth />
      <FormControl fullWidth>
        <InputLabel>Visibility</InputLabel>
        <Select value={form.visibility} label="Visibility" onChange={(e) => onChange({ ...form, visibility: e.target.value })}>
          {VISIBILITY_OPTIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );
}

function splitTags(s: string): string[] {
  return s.split(',').map((t) => t.trim()).filter(Boolean);
}

function ContributorsTab({ cover }: { cover: CoverAdminResponse }) {
  const addMutation = useAddContributor();
  const removeMutation = useRemoveContributor();
  const [addForm, setAddForm] = useState<ContributorCreateRequest>({
    contributor_name: '',
    contributor_type: 'designer',
  });

  const handleAdd = async () => {
    await addMutation.mutateAsync({ coverId: cover.id, ...addForm });
    setAddForm({ contributor_name: '', contributor_type: 'designer' });
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Table size="small" sx={{ mb: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {cover.contributors.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.contributor_name}</TableCell>
              <TableCell sx={{ color: colors.text.secondary }}>{c.contributor_type}</TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeMutation.mutate({ coverId: cover.id, contributorId: c.id })}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {cover.contributors.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} sx={{ color: colors.text.muted, py: 3 }}>No contributors yet.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Typography variant="subtitle2" sx={{ mb: 2 }}>Add Contributor</Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          label="Name"
          size="small"
          value={addForm.contributor_name}
          onChange={(e) => setAddForm({ ...addForm, contributor_name: e.target.value })}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={addForm.contributor_type}
            label="Type"
            onChange={(e) => setAddForm({ ...addForm, contributor_type: e.target.value })}
          >
            {CONTRIBUTOR_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={handleAdd}
          disabled={!addForm.contributor_name || addMutation.isPending}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
}

function CoverEditDrawer({
  cover,
  onClose,
}: {
  cover: CoverAdminResponse;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<CoverForm>(coverToForm(cover));
  const updateMutation = useUpdateCover();

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: cover.id,
      title: form.title || undefined,
      author_name: form.author_name || undefined,
      subtitle: form.subtitle || undefined,
      publisher: form.publisher || undefined,
      imprint: form.imprint || undefined,
      publication_date: form.publication_date || undefined,
      audience_tags: splitTags(form.audience_tags),
      genre_tags: splitTags(form.genre_tags),
      visual_tags: splitTags(form.visual_tags),
      external_book_url: form.external_book_url || undefined,
      primary_image_asset_id: form.primary_image_asset_id || undefined,
      visibility: form.visibility,
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" noWrap sx={{ maxWidth: 400 }}>{cover.title}</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${colors.border.default}` }}>
        <Tab label="Details" />
        <Tab label="Contributors" />
      </Tabs>
      {tab === 0 && (
        <>
          <CoverFormFields form={form} onChange={setForm} imagePreviewUrl={cover.primary_image_url ?? undefined} />
          <Button
            variant="contained"
            sx={{ mt: 4 }}
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </>
      )}
      {tab === 1 && <ContributorsTab cover={cover} />}
    </Box>
  );
}

export default function CoverManagementPage() {
  const [visFilter, setVisFilter] = useState('');
  const { data: covers = [], isLoading } = useAdminCovers(visFilter || undefined);
  const createMutation = useCreateCover();

  const [drawerCoverId, setDrawerCoverId] = useState<string | null>(null);
  const drawerCover = drawerCoverId ? (covers.find((c) => c.id === drawerCoverId) ?? null) : null;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CoverForm>(emptyForm());

  const handleCreate = async () => {
    const payload: CoverCreateRequest = {
      title: createForm.title,
      author_name: createForm.author_name,
      subtitle: createForm.subtitle || undefined,
      publisher: createForm.publisher || undefined,
      imprint: createForm.imprint || undefined,
      publication_date: createForm.publication_date || undefined,
      audience_tags: splitTags(createForm.audience_tags),
      genre_tags: splitTags(createForm.genre_tags),
      visual_tags: splitTags(createForm.visual_tags),
      external_book_url: createForm.external_book_url || undefined,
      primary_image_asset_id: createForm.primary_image_asset_id,
      visibility: createForm.visibility,
    };
    await createMutation.mutateAsync(payload);
    setCreateDialogOpen(false);
    setCreateForm(emptyForm());
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Cover Archive Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
          Add Cover
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        {['', ...VISIBILITY_OPTIONS].map((v) => (
          <Chip
            key={v || 'all'}
            label={v || 'All'}
            onClick={() => setVisFilter(v)}
            color={visFilter === v ? 'primary' : 'default'}
            variant={visFilter === v ? 'filled' : 'outlined'}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Publisher</TableCell>
              <TableCell>Visibility</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {covers.map((c) => (
              <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDrawerCoverId(c.id)}>
                <TableCell>{c.title}</TableCell>
                <TableCell sx={{ color: colors.text.secondary }}>{c.author_name}</TableCell>
                <TableCell sx={{ color: colors.text.secondary }}>{c.publisher}</TableCell>
                <TableCell>
                  <Chip
                    label={c.visibility}
                    color={visibilityColor[c.visibility] ?? 'default'}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell sx={{ color: colors.text.muted }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {covers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: colors.text.muted }}>
                  No covers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={!!drawerCoverId}
        onClose={() => setDrawerCoverId(null)}
        PaperProps={{ sx: { width: { xs: '100%', md: 680 }, p: 6, top: '64px', height: 'calc(100% - 64px)', overflowY: 'auto' } }}
      >
        {drawerCover && (
          <CoverEditDrawer cover={drawerCover} onClose={() => setDrawerCoverId(null)} />
        )}
      </Drawer>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Cover</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <CoverFormFields form={createForm} onChange={setCreateForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!createForm.title || !createForm.author_name || !createForm.primary_image_asset_id || createMutation.isPending}
            title={!createForm.primary_image_asset_id ? 'Upload a cover image first' : undefined}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
