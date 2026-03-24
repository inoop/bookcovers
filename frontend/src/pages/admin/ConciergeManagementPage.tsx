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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  useAdminPackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
} from '../../api/hooks/useAdminConcierge';
import type { ConciergePackageResponse, ConciergePackageCreateRequest } from '../../api/types';
import { colors } from '../../theme/tokens';

interface PackageForm {
  name: string;
  description: string;
  price_cents: string;
  currency: string;
  is_active: boolean;
}

const emptyForm = (): PackageForm => ({
  name: '',
  description: '',
  price_cents: '',
  currency: 'USD',
  is_active: true,
});

function pkgToForm(p: ConciergePackageResponse): PackageForm {
  return {
    name: p.name,
    description: p.description ?? '',
    price_cents: String(p.price_cents),
    currency: p.currency,
    is_active: p.is_active,
  };
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export default function ConciergeManagementPage() {
  const { data: packages = [], isLoading } = useAdminPackages();
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ConciergePackageResponse | null>(null);
  const [form, setForm] = useState<PackageForm>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<ConciergePackageResponse | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (pkg: ConciergePackageResponse) => {
    setEditing(pkg);
    setForm(pkgToForm(pkg));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload: ConciergePackageCreateRequest = {
      name: form.name,
      description: form.description || undefined,
      price_cents: Number(form.price_cents),
      currency: form.currency,
      is_active: form.is_active,
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Concierge Packages</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Package
        </Button>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packages.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.name}</TableCell>
                <TableCell sx={{ color: colors.text.secondary, maxWidth: 300 }}>
                  {p.description}
                </TableCell>
                <TableCell>{formatCents(p.price_cents, p.currency)}</TableCell>
                <TableCell>
                  <Chip
                    label={p.is_active ? 'Active' : 'Inactive'}
                    color={p.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteConfirm(p)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {packages.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: colors.text.muted }}>
                  No packages yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Package' : 'Add Package'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Price (cents)"
            type="number"
            value={form.price_cents}
            onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
            required
            fullWidth
            helperText="Enter price in cents (e.g. 9900 = $99.00)"
          />
          <TextField
            label="Currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
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
            disabled={!form.name || !form.price_cents || createMutation.isPending || updateMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Package?</DialogTitle>
        <DialogContent>
          <Typography>Delete &ldquo;{deleteConfirm?.name}&rdquo;? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (deleteConfirm) {
                await deleteMutation.mutateAsync(deleteConfirm.id);
                setDeleteConfirm(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
