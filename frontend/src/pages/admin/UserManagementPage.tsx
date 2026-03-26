import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAdminUsers, useDeleteUser, useUpdateUserActive, useUpdateUserRole } from '../../api/hooks/useAdminUsers';
import type { UserAdminResponse } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { colors } from '../../theme/tokens';

const ROLES = ['admin', 'reviewer', 'hiring_user', 'freelancer', 'anonymous'];

function UserRow({
  user,
  isSelf,
  onDelete,
}: {
  user: UserAdminResponse;
  isSelf: boolean;
  onDelete: (user: { id: string; email: string }) => void;
}) {
  const [pendingRole, setPendingRole] = useState(user.role);
  const updateRole = useUpdateUserRole();
  const toggleActive = useUpdateUserActive();
  const dirty = pendingRole !== user.role;

  return (
    <TableRow hover>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.display_name}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={pendingRole}
              onChange={(e) => setPendingRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {dirty && (
            <Button
              size="small"
              variant="contained"
              onClick={() => updateRole.mutate({ userId: user.id, role: pendingRole })}
              disabled={updateRole.isPending}
            >
              Save
            </Button>
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={user.is_active ? 'Active' : 'Inactive'}
          color={user.is_active ? 'success' : 'default'}
          size="small"
          onClick={() => toggleActive.mutate({ userId: user.id, isActive: !user.is_active })}
          disabled={toggleActive.isPending}
          sx={{ cursor: 'pointer' }}
        />
      </TableCell>
      <TableCell sx={{ color: colors.text.muted, fontSize: '0.8125rem' }}>
        {new Date(user.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <IconButton
          size="small"
          disabled={isSelf}
          onClick={() => onDelete({ id: user.id, email: user.email })}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [roleFilter, setRoleFilter] = useState('');
  const { data: users = [], isLoading } = useAdminUsers(roleFilter || undefined);
  const deleteUser = useDeleteUser();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">User Management</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={roleFilter}
            label="Filter by Role"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">All roles</MenuItem>
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {r.replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell width={60} />
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isSelf={u.email === currentUser?.email}
                onDelete={setDeleteTarget}
              />
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: colors.text.muted }}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete <strong>{deleteTarget?.email}</strong> from the database
            and the authentication provider. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteTarget) {
                deleteUser.mutate(deleteTarget.id);
                setDeleteTarget(null);
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
