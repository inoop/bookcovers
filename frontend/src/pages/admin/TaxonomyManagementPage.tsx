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
  FormControlLabel,
  IconButton,
  Switch,
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
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  useAdminTaxonomyTerms,
  useCreateTaxonomyTerm,
  useUpdateTaxonomyTerm,
  useDeleteTaxonomyTerm,
} from '../../api/hooks/useAdminTaxonomy';
import type { TaxonomyTermAdmin, TaxonomyTermCreateRequest } from '../../api/types';
import { colors } from '../../theme/tokens';

const CATEGORIES = ['audience', 'style', 'genre', 'image_tag', 'location', 'project_type'];

interface TermFormState {
  label: string;
  internal_label: string;
  slug: string;
  sort_order: string;
  is_active: boolean;
  aliases: string;
}

const emptyForm = (): TermFormState => ({
  label: '',
  internal_label: '',
  slug: '',
  sort_order: '0',
  is_active: true,
  aliases: '',
});

function termToForm(term: TaxonomyTermAdmin): TermFormState {
  return {
    label: term.label,
    internal_label: term.internal_label ?? '',
    slug: term.slug ?? '',
    sort_order: String(term.sort_order),
    is_active: term.is_active,
    aliases: (term.aliases ?? []).join(', '),
  };
}

export default function TaxonomyManagementPage() {
  const [categoryIdx, setCategoryIdx] = useState(0);
  const category = CATEGORIES[categoryIdx];
  const { data: terms = [], isLoading } = useAdminTaxonomyTerms(category, true);
  const createMutation = useCreateTaxonomyTerm();
  const updateMutation = useUpdateTaxonomyTerm();
  const deleteMutation = useDeleteTaxonomyTerm();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<TaxonomyTermAdmin | null>(null);
  const [form, setForm] = useState<TermFormState>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<TaxonomyTermAdmin | null>(null);

  const openCreate = () => {
    setEditingTerm(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (term: TaxonomyTermAdmin) => {
    setEditingTerm(term);
    setForm(termToForm(term));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload: TaxonomyTermCreateRequest = {
      category,
      label: form.label,
      internal_label: form.internal_label || undefined,
      slug: form.slug || undefined,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      aliases: form.aliases ? form.aliases.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    if (editingTerm) {
      await updateMutation.mutateAsync({ id: editingTerm.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Taxonomy Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Term
        </Button>
      </Box>

      <Tabs
        value={categoryIdx}
        onChange={(_, v) => setCategoryIdx(v)}
        sx={{ mb: 4, borderBottom: `1px solid ${colors.border.default}` }}
      >
        {CATEGORIES.map((cat) => (
          <Tab key={cat} label={cat.replace('_', ' ')} sx={{ textTransform: 'capitalize' }} />
        ))}
      </Tabs>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Internal Label</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Sort</TableCell>
              <TableCell>Aliases</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {terms.map((term) => (
              <TableRow key={term.id} hover>
                <TableCell>{term.label}</TableCell>
                <TableCell sx={{ color: colors.text.secondary }}>{term.internal_label}</TableCell>
                <TableCell sx={{ color: colors.text.muted, fontSize: '0.75rem' }}>{term.slug}</TableCell>
                <TableCell>{term.sort_order}</TableCell>
                <TableCell>
                  {(term.aliases ?? []).map((a) => (
                    <Chip key={a} label={a} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Switch
                    size="small"
                    checked={term.is_active}
                    onChange={(e) =>
                      updateMutation.mutate({ id: term.id, is_active: e.target.checked })
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(term)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteConfirm(term)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {terms.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: colors.text.muted }}>
                  No terms in this category yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTerm ? 'Edit Term' : 'Add Term'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
            label="Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Internal Label"
            value={form.internal_label}
            onChange={(e) => setForm({ ...form, internal_label: e.target.value })}
            fullWidth
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            fullWidth
            helperText="Auto-generated if left blank"
          />
          <TextField
            label="Sort Order"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            fullWidth
          />
          <TextField
            label="Aliases (comma-separated)"
            value={form.aliases}
            onChange={(e) => setForm({ ...form, aliases: e.target.value })}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.label || createMutation.isPending || updateMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Term?</DialogTitle>
        <DialogContent>
          <Typography>
            Delete &ldquo;{deleteConfirm?.label}&rdquo;? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
