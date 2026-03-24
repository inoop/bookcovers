import { useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
} from '@mui/material';
import { useAdminUsers, useUpdateUserRole } from '../../api/hooks/useAdminUsers';
import type { UserAdminResponse } from '../../api/types';
import { colors } from '../../theme/tokens';

const ROLES = ['admin', 'reviewer', 'hiring_user', 'freelancer', 'anonymous'];

const roleColor: Record<string, 'error' | 'warning' | 'info' | 'default' | 'success'> = {
  admin: 'error',
  reviewer: 'warning',
  hiring_user: 'info',
  freelancer: 'success',
  anonymous: 'default',
};

function UserRow({ user }: { user: UserAdminResponse }) {
  const [pendingRole, setPendingRole] = useState(user.role);
  const updateRole = useUpdateUserRole();
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
        />
      </TableCell>
      <TableCell sx={{ color: colors.text.muted, fontSize: '0.8125rem' }}>
        {new Date(user.created_at).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
}

export default function UserManagementPage() {
  const [roleFilter, setRoleFilter] = useState('');
  const { data: users = [], isLoading } = useAdminUsers(roleFilter || undefined);

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
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: colors.text.muted }}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
