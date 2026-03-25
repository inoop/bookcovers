import { useState } from 'react';
import {
  Alert, Box, Card, CardContent, Chip, CircularProgress, IconButton,
  TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useOwnPortfolio, useUploadAsset, useUpdateAsset, useDeleteAsset } from '../../api/hooks/usePortfolio';
import { useOwnProfile } from '../../api/hooks/useProfile';
import FormFileUpload from '../../components/forms/FormFileUpload';
import { colors } from '../../theme/tokens';

export default function PortfolioPage() {
  const { data: profile } = useOwnProfile();
  const { data: assets, isLoading } = useOwnPortfolio();
  const uploadAsset = useUploadAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasProfile = !!profile;

  const handleUpload = async (file: File) => {
    await uploadAsset.mutateAsync(file);
  };

  const handleTitleChange = (id: string, title: string) => {
    updateAsset.mutate({ id, title });
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      await deleteAsset.mutateAsync(id);
    } catch (e: any) {
      setDeleteError(e?.response?.data?.detail || 'Delete failed');
    }
  };

  if (!hasProfile) {
    return (
      <>
        <Typography variant="h1" sx={{ mb: 4 }}>Portfolio</Typography>
        <Alert severity="info">
          Create your profile first before uploading portfolio samples.
        </Alert>
      </>
    );
  }

  return (
    <>
      <Typography variant="h1" sx={{ mb: 2 }}>Portfolio</Typography>
      <Typography variant="body1" sx={{ color: colors.text.secondary, mb: 6 }}>
        Upload work samples to showcase your skills. JPG, PNG, WebP, or PDF up to 10MB each.
      </Typography>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      <FormFileUpload onUpload={handleUpload} />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : assets && assets.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 5,
            mt: 6,
          }}
        >
          {assets.map((asset) => (
            <Card key={asset.id}>
              <Box
                sx={{
                  height: 180,
                  backgroundColor: colors.surface.raised,
                  backgroundImage: asset.media_url ? `url(${asset.media_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                  <Chip
                    label={asset.asset_type}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      fontSize: '0.625rem',
                    }}
                  />
                </Box>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <TextField
                  size="small"
                  placeholder="Add a title..."
                  defaultValue={asset.title || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (asset.title || '')) {
                      handleTitleChange(asset.id, e.target.value);
                    }
                  }}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={asset.sort_order !== undefined ? `#${asset.sort_order + 1}` : ''}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.625rem' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(asset.id)}
                    sx={{ color: colors.status.error }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8, mt: 4 }}>
          <Typography variant="body1" sx={{ color: colors.text.muted }}>
            No portfolio samples yet. Upload your first work sample above.
          </Typography>
        </Box>
      )}
    </>
  );
}
