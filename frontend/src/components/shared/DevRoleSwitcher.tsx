import { useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { colors } from '../../theme/tokens';

const isLocalDev = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').includes('localhost');

const ROLES = ['admin', 'freelancer', 'reviewer', 'hiring_user'];

export default function DevRoleSwitcher() {
  const [role, setRole] = useState(() => localStorage.getItem('dev_role') || 'admin');
  const [userId, setUserId] = useState(() => localStorage.getItem('dev_user_id') || 'dev-admin-001');

  if (!isLocalDev) return null;

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: colors.surface.soft,
        borderRadius: 2,
        border: `1px dashed ${colors.border.default}`,
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: colors.text.muted, fontSize: '0.625rem', textTransform: 'uppercase', mb: 2 }}
      >
        Dev Auth
      </Typography>
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={role}
          label="Role"
          onChange={(e) => {
            const newRole = e.target.value;
            setRole(newRole);
            localStorage.setItem('dev_role', newRole);
          }}
        >
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="User ID"
        value={userId}
        onChange={(e) => {
          setUserId(e.target.value);
          localStorage.setItem('dev_user_id', e.target.value);
        }}
        fullWidth
      />
    </Box>
  );
}
