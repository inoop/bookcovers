import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useAdminSettings, useUpsertSetting } from '../../api/hooks/useAdminSettings';
import type { AppSettingResponse } from '../../api/types';
import { colors } from '../../theme/tokens';

function SettingRow({ setting }: { setting: AppSettingResponse }) {
  const [value, setValue] = useState(setting.value);
  const upsert = useUpsertSetting();
  const dirty = value !== setting.value;

  useEffect(() => {
    setValue(setting.value);
  }, [setting.value]);

  return (
    <TableRow>
      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: colors.text.secondary }}>
        {setting.key}
      </TableCell>
      <TableCell sx={{ color: colors.text.muted, maxWidth: 280 }}>
        {setting.description}
      </TableCell>
      <TableCell>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="small"
          fullWidth
          multiline
          maxRows={4}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {dirty && (
          <Button
            size="small"
            variant="contained"
            onClick={() => upsert.mutate({ key: setting.key, value })}
            disabled={upsert.isPending}
          >
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function SettingsPage() {
  const { data: settings = [], isLoading } = useAdminSettings();

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 4 }}>Settings</Typography>
      <Typography variant="body1" sx={{ color: colors.text.body, mb: 6 }}>
        Configure labels, CTAs, and platform defaults.
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Value</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {settings.map((s) => (
              <SettingRow key={s.key} setting={s} />
            ))}
            {settings.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: colors.text.muted }}>
                  No settings configured.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
